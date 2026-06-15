from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from PIL import Image
import torch
import torchvision.transforms as transforms
import numpy as np
import json
from pathlib import Path
import warnings

warnings.filterwarnings("ignore")

# ── RAG imports ──────────────────────────────────────────────────────────────
import os
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate
from langchain.schema import Document, BaseRetriever
from sentence_transformers import CrossEncoder
from dataclasses import dataclass
from typing import List, Optional

from model import RiceEfficientNetB3

# ── Load env ─────────────────────────────────────────────────────────────────
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Image classification setup 


DEVICE = torch.device("cpu")

with open("model_meta.json") as f:
    meta = json.load(f)

class_names = meta["class_names"]

model = RiceEfficientNetB3(num_classes=len(class_names))
checkpoint = torch.load("rice_B3_pytorch.pt", map_location=DEVICE)
model.load_state_dict(checkpoint["model_state_dict"])
model.eval()

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    image = Image.open(file.file).convert("RGB")
    x = transform(image).unsqueeze(0)

    with torch.no_grad():
        logits = model(x)
        probs = torch.softmax(logits, dim=1)[0]

    preds = probs.numpy()
    top_idx = int(np.argmax(preds))
    top_class = class_names[top_idx]
    top_conf = float(preds[top_idx])
    entropy = float(-np.sum(preds * np.log(preds + 1e-10)))

    non_rice_idx = class_names.index("non_rice_leaf")
    non_rice_prob = float(preds[non_rice_idx])

    is_ood = (
        top_class == "non_rice_leaf"
        or top_conf < 0.60
        or non_rice_prob > 0.30
        or entropy > 1.2
    )

    disease = "NOT A VALID RICE LEAF IMAGE" if is_ood else top_class

    top3_idx = np.argsort(preds)[::-1][:3]
    top3 = [
        {"class": class_names[i], "confidence": float(preds[i])}
        for i in top3_idx
    ]

    return {
        "disease": disease,
        "confidence": top_conf,
        "entropy": entropy,
        "is_rice_leaf": not is_ood,
        "top3_predictions": top3,
    }



# RAG Pipeline setup


@dataclass
class RAGConfig:
    pdf_dir: str = "./pdfs"
    faiss_index_path: str = "./faiss_index"
    chunk_size: int = 1000
    chunk_overlap: int = 200
    embedding_model: str = "BAAI/bge-base-en-v1.5"
    mmr_fetch_k: int = 20
    mmr_return_k: int = 4
    reranker_model: str = "BAAI/bge-reranker-base"
    reranker_top_k: int = 5
    llm_model: str = "llama-3.3-70b-versatile"
    llm_temperature: float = 0.1
    llm_max_tokens: int = 1024


config = RAGConfig()
Path(config.pdf_dir).mkdir(parents=True, exist_ok=True)


# ── Helpers (identical logic to your notebook) ───────────────────────────────

def load_documents(pdf_dir: str) -> List[Document]:
    pdf_directory = Path(pdf_dir)
    pdf_files = sorted(pdf_directory.rglob("*.pdf"))
    if not pdf_files:
        return []

    all_documents: List[Document] = []
    for pdf_path in pdf_files:
        try:
            loader = PyPDFLoader(str(pdf_path))
            pages = loader.load()
            for page_doc in pages:
                page_doc.metadata["source"] = pdf_path.name
                page_doc.metadata["page"] = page_doc.metadata.get("page", 0) + 1
                page_doc.metadata["file_path"] = str(pdf_path.resolve())
            all_documents.extend(pages)
        except Exception:
            continue
    return all_documents


def split_documents(documents: List[Document], chunk_size=1000, chunk_overlap=200) -> List[Document]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    return splitter.split_documents(documents)


def create_embeddings(model_name: str) -> HuggingFaceEmbeddings:
    if torch.cuda.is_available():
        device = "cuda"
    elif torch.backends.mps.is_available():
        device = "mps"
    else:
        device = "cpu"

    return HuggingFaceEmbeddings(
        model_name=model_name,
        model_kwargs={"device": device},
        encode_kwargs={"normalize_embeddings": True, "batch_size": 32},
    )


def get_vectorstore(embeddings: HuggingFaceEmbeddings) -> Optional[FAISS]:
    index_path = config.faiss_index_path
    if Path(index_path).exists():
        return FAISS.load_local(
            folder_path=index_path,
            embeddings=embeddings,
            allow_dangerous_deserialization=True,
        )
    docs = load_documents(config.pdf_dir)
    if not docs:
        return None
    chunks = split_documents(docs, config.chunk_size, config.chunk_overlap)
    vs = FAISS.from_documents(documents=chunks, embedding=embeddings)
    vs.save_local(index_path)
    return vs


def format_context(docs: List[Document]) -> str:
    parts = []
    for i, doc in enumerate(docs, 1):
        source = doc.metadata.get("source", "Unknown")
        page = doc.metadata.get("page", "?")
        score = doc.metadata.get("rerank_score", None)
        header = f"[Source {i}: {source}, Page {page}"
        if score is not None:
            header += f", Relevance: {score:.4f}"
        header += "]"
        parts.append(f"{header}\n{doc.page_content}")
    return "\n\n".join(parts)


def extract_citations(docs: List[Document]) -> str:
    seen = set()
    citations = []
    for doc in docs:
        source = doc.metadata.get("source", "Unknown")
        page = doc.metadata.get("page", "?")
        key = (source, page)
        if key not in seen:
            seen.add(key)
            citations.append(f"- {source} (Page {page})")
    citations.sort()
    return "\n".join(citations) if citations else "- No sources available"


def rerank_documents(
    query: str,
    docs: List[Document],
    reranker: CrossEncoder,
    top_k: int = 5,
) -> List[Document]:
    if not docs:
        return []
    pairs = [[query, doc.page_content] for doc in docs]
    scores = reranker.predict(pairs)
    scored = []
    for doc, score in zip(docs, scores):
        scored.append(Document(
            page_content=doc.page_content,
            metadata={**doc.metadata, "rerank_score": float(score)},
        ))
    return sorted(scored, key=lambda d: d.metadata["rerank_score"], reverse=True)[:top_k]


RAG_PROMPT_TEMPLATE = """\
You are an expert research assistant. Answer the user's question using ONLY \
the provided context. Do not use any prior knowledge or make assumptions \
beyond what is explicitly stated in the context.

STRICT RULES:
1. Base your answer SOLELY on the context below.
2. If the answer cannot be found in the context, respond EXACTLY with:
   "I couldn't find sufficient information in the available rice disease documents to answer your question. Please ask a question related to rice leaf diseases."
3. Never fabricate information, names, statistics, or citations.
4. Be concise but comprehensive — cover all relevant points from the context.
5. Always end with a Sources section listing the referenced documents.

ANSWER FORMAT:
Answer: [Your detailed answer here]

Sources:
- [filename] (Page [number])

==========
CONTEXT:
{context}
==========

QUESTION: {question}

Answer:"""

REWRITER_PROMPT_TEMPLATE = """You are a query rewriting assistant for a retrieval system.

Given a CHAT HISTORY and a FOLLOW-UP QUESTION, rewrite the follow-up
into a STANDALONE QUESTION that is fully self-contained.

RULES:
1. Resolve ALL pronouns (this, it, they, these, that) to explicit referents.
2. Expand implicit references fully.
3. If the follow-up is already self-contained, return it UNCHANGED.
4. Output ONLY the rewritten question — no explanation, no preamble.

==========
CHAT HISTORY:
{chat_history}
==========

FOLLOW-UP QUESTION: {question}

STANDALONE QUESTION:"""


# ── Initialise RAG components at startup ─────────────────────────────────────

print("Loading RAG components…")

_embeddings = create_embeddings(config.embedding_model)
_vectorstore = get_vectorstore(_embeddings)
_retriever = (
    _vectorstore.as_retriever(
        search_type="mmr",
        search_kwargs={"k": config.mmr_return_k, "fetch_k": config.mmr_fetch_k},
    )
    if _vectorstore
    else None
)
_reranker = CrossEncoder(config.reranker_model, max_length=512)
_llm = ChatGroq(
    model=config.llm_model,
    temperature=config.llm_temperature,
    max_tokens=config.llm_max_tokens,
    api_key=GROQ_API_KEY,
)
_qa_prompt = PromptTemplate(
    input_variables=["context", "question"],
    template=RAG_PROMPT_TEMPLATE,
)
_rewriter_prompt = PromptTemplate(
    input_variables=["chat_history", "question"],
    template=REWRITER_PROMPT_TEMPLATE,
)

print("RAG pipeline ready!")



# /chat endpoint


class ChatMessage(BaseModel):
    role: str   
    text: str


class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []   


def _format_history(history: List[ChatMessage]) -> str:
    lines = []
    for m in history:
        prefix = "Human" if m.role == "user" else "Assistant"
        content = m.text[:400] + "…" if len(m.text) > 400 else m.text
        lines.append(f"{prefix}: {content}")
    return "\n".join(lines)


def _rewrite_query(query: str, history: List[ChatMessage]) -> str:
    """Resolve follow-up references; skip LLM on first turn."""
    if not history:
        return query
    filled = _rewriter_prompt.format(
        chat_history=_format_history(history),
        question=query,
    )
    result = _llm.invoke(filled).content.strip()
    return result if result else query


def _generate_answer(question: str, reranked_docs: List[Document]) -> str:
    context = format_context(reranked_docs)
    filled = _qa_prompt.format(context=context, question=question)

    answer_text = _llm.invoke(filled).content.strip()

    no_answer_phrases = [
        "I couldn't find sufficient information",
        "Please ask a question related to rice leaf diseases"
    ]

    if all(p in answer_text for p in no_answer_phrases):
        return (
            "I couldn't find sufficient information in the available rice disease documents "
            "to answer your question. Please ask a question related to rice leaf diseases."
        )

    if "Sources:" not in answer_text:
        citations = extract_citations(reranked_docs)
        answer_text += f"\n\nSources:\n{citations}"

    return answer_text


@app.post("/chat")
async def chat(req: ChatRequest):

    if not GROQ_API_KEY:
        return {"reply": "GROQ_API_KEY is not configured on the server."}

    if _retriever is None:
        return {
            "reply": (
                "No PDF documents found. "
                "Please add rice-disease PDFs to the `./pdfs/` folder and restart the server."
            )
        }


    standalone = _rewrite_query(req.message, req.history)

    initial_docs: List[Document] = _retriever.invoke(standalone)

    reranked = rerank_documents(standalone, initial_docs, _reranker, top_k=config.reranker_top_k)

    reply = _generate_answer(standalone, reranked)

    return {"reply": reply}