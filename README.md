# Rice AI – Rice Leaf Disease Detection & Farmer Assistant

Rice AI is an AI powered agricultural assistance platform that helps farmers identify rice leaf diseases from images and receive evidence based recommendations through a Retrieval Augmented Generation (RAG) chatbot.

The system combines computer vision, deep learning, and large language models to support disease diagnosis and agricultural knowledge retrieval.

---

## Live Demo

**Frontend**
https://rice-ai.vercel.app

**Backend**
https://akshayshetty7-rice-ai-backend-v2.hf.space

**Hugging Face Space**
https://huggingface.co/spaces/Akshayshetty7/rice-ai-backend-v2

**Knowledge Base Dataset**
https://huggingface.co/datasets/Akshayshetty7/rice-ai-documents

---

## Features

### Disease Detection

* Rice leaf disease classification using EfficientNet B3
* Top 3 prediction probabilities
* Confidence scoring
* Out of Distribution (OOD) detection
* Non rice leaf image rejection

### Farmer Assistant

* Natural language question answering
* Retrieval Augmented Generation (RAG)
* Source grounded responses
* Context aware conversations
* Agricultural PDF knowledge base

### Multilingual Support

* English
* Hindi
* Kannada

---

## Architecture

### Disease Detection Pipeline

```text
Rice Leaf Image
      ↓
Image Preprocessing
      ↓
EfficientNet-B3
      ↓
Disease Prediction
      ↓
OOD Validation
      ↓
Result
```

### Farmer Assistant Pipeline

```text
User Query
     ↓
Query Rewriting
     ↓
FAISS Retrieval
     ↓
Cross-Encoder Re-ranking
     ↓
Groq LLM
     ↓
Response
```

---

## Knowledge Base

The chatbot is powered by a curated dataset of 30+ agricultural PDF documents covering:

* Rice leaf diseases
* Disease symptoms
* Treatment recommendations
* Crop protection practices
* Rice cultivation guidelines

Dataset:
https://huggingface.co/datasets/Akshayshetty7/rice-ai-documents

---

## Technology Stack

### Frontend

* React
* Vite
* i18next

### Backend

* FastAPI
* Python
* PyTorch

### AI & RAG

* EfficientNet B3
* LangChain
* FAISS
* BAAI Embeddings
* Cross Encoder Re ranking
* Groq LLM

### Deployment

* Vercel
* Hugging Face Spaces

---

## Disease Categories

| Category              |
| --------------------- |
| Bacterial Leaf Blight |
| Brown Spot            |
| Leaf Scald            |
| Leaf Blast            |
| Narrow Brown Spot     |
| Healthy Lef           |
| Non-Rice Leaf         |

---

## Project Structure

```text
RICE-DISEASE-APP
│
├── backend
│   ├── app.py
│   ├── model.py
│   ├── pdfs
│   ├── faiss_index
│   └── rice_B3_pytorch.pt
│
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── hooks
│   │   ├── i18n
│   │   └── pages
│
└── README.md
```

---


### Backend


Create a `.env` file:

```env
GROQ_API_KEY=your_api_key
```


---

## API Endpoints

| Method | Endpoint | Description              |
| ------ | -------- | ------------------------ |
| POST   | /predict | Rice disease prediction  |
| POST   | /chat    | Farmer assistant chatbot |



---

## License

This project is licensed under the MIT License.
