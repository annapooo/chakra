import os
import pandas as pd
from pymongo import MongoClient
from dotenv import load_dotenv

# 🔹 Load environment variables
load_dotenv()

# 🔹 Get MongoDB URL from .env
mongo_url = os.getenv("MONGODB_URL")

if not mongo_url:
    raise ValueError("❌ MONGODB_URL not found in .env file")

# 🔹 Connect to MongoDB Atlas
client = MongoClient(mongo_url)

# 🔹 Select database and collection
db = client["chakra"]
collection = db["code"]   # change to "legal_sections" if needed

def ingest_bns(csv_path: str):
    df = pd.read_csv(csv_path)

    # Debug: print columns to avoid mismatch issues
    print("CSV Columns:", df.columns)

    docs = []
    for _, row in df.iterrows():
        doc = {
            "code": "BNS",
            "chapter": int(row["Chapter"]),
            "chapter_name": str(row["Chapter_name"]),
            "chapter_subtype": str(row["Chapter_subtype"]),
            "section_number": str(row["Section"]),
            "section_title": str(row["Section _name"]),  # ensure exact column name
            "text": str(row["Description"]),
            "jurisdiction_type": "central",
            "state": None,
            "tags": [],
            "source": "bns_sections_csv"
        }
        docs.append(doc)

    if docs:
        collection.insert_many(docs)
        print(f"✅ Inserted {len(docs)} documents into 'chakra.code'")

# 🔹 Run script
if __name__ == "__main__":
    ingest_bns("bns_sections.csv")

    # 🔹 Test connection
    print("📡 Connected DBs:", client.list_database_names())