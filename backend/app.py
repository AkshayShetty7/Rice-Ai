from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from PIL import Image
import torch
import torchvision.transforms as transforms
import numpy as np
import json

from model import RiceEfficientNetB3

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEVICE = torch.device("cpu")

with open("model_meta.json") as f:
    meta = json.load(f)

class_names = meta["class_names"]

model = RiceEfficientNetB3(
    num_classes=len(class_names)
)

checkpoint = torch.load(
    "rice_B3_pytorch.pt",
    map_location=DEVICE
)

model.load_state_dict(
    checkpoint["model_state_dict"]
)

model.eval()

transform = transforms.Compose([
    transforms.Resize((224,224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485,0.456,0.406],
        std=[0.229,0.224,0.225]
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

    entropy = float(
        -np.sum(preds * np.log(preds + 1e-10))
    )

    non_rice_idx = class_names.index(
        "non_rice_leaf"
    )

    non_rice_prob = float(
        preds[non_rice_idx]
    )

    is_ood = (
        top_class == "non_rice_leaf"
        or top_conf < 0.60
        or non_rice_prob > 0.30
        or entropy > 1.2
    )

    if is_ood:
        disease = "NOT A VALID RICE LEAF IMAGE"
    else:
        disease = top_class

    top3_idx = np.argsort(preds)[::-1][:3]

    top3 = [
        {
            "class": class_names[i],
            "confidence": float(preds[i])
        }
        for i in top3_idx
    ]

    return {
        "disease": disease,
        "confidence": top_conf,
        "entropy": entropy,
        "is_rice_leaf": not is_ood,
        "top3_predictions": top3
    }