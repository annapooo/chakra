import os
from pymongo import MongoClient
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer

load_dotenv()

# 🔹 Connect to MongoDB
client = MongoClient(os.getenv("MONGODB_URL"))
db = client["chakra"]
collection = db["code"]

# 🔹 Load FREE embedding model (runs locally)
model = SentenceTransformer('all-MiniLM-L6-v2')

# 🔹 Fetch documents
docs = list(collection.find())

for doc in docs:
    text = doc.get("text", "")

    if not text:
        continue

    # ✅ Skip if already embedded (VERY IMPORTANT)
    if "embedding" in doc:
        continue

    # 🔹 Generate embedding (FREE)
    embedding = model.encode(text).tolist()

    # 🔹 Update document
    collection.update_one(
        {"_id": doc["_id"]},
        {"$set": {"embedding": embedding}}
    )

    print(f"✅ Updated: {doc['_id']}")

print("🎉 All documents updated with FREE embeddings!")