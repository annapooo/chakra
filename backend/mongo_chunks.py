import os
import re
from pymongo import MongoClient
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from PyPDF2 import PdfReader

# =========================
# 🔹 CONFIG
# =========================
load_dotenv()

MONGO_URL = os.getenv("MONGODB_URL")

if not MONGO_URL:
    raise ValueError("❌ MONGODB_URL not found")

PDF_PATH = "civil-procedure.pdf"

# =========================
# 🔹 DB SETUP
# =========================
client = MongoClient(MONGO_URL)
db = client["chakra"]
collection = db["legal_chunks"]

# OPTIONAL: remove only CPC data
collection.delete_many({"act": "Civil Procedure Code"})
print("🧹 Cleared old CPC data")

# =========================
# 🔹 LOAD MODEL
# =========================
model = SentenceTransformer('all-MiniLM-L6-v2')

# =========================
# 🔹 STEP 1: EXTRACT TEXT
# =========================
def extract_text_from_pdf(pdf_path):
    reader = PdfReader(pdf_path)
    text = ""

    for page in reader.pages:
        content = page.extract_text()
        if content:
            text += content + "\n"

    return text

# =========================
# 🔹 STEP 2: CLEAN TEXT
# =========================
def clean_text(text):
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

# =========================
# 🔹 STEP 3: LEGAL CHUNKING (IMPORTANT CHANGE)
# =========================
def chunk_text(text):
    """
    Split based on legal structure:
    Section / Order / Rule
    """

    # Split by legal headings
    parts = re.split(
        r'(Section\s+\d+[A-Z]?|Order\s+[IVXLC]+|Rule\s+\d+)',
        text,
        flags=re.IGNORECASE
    )

    chunks = []

    for i in range(1, len(parts), 2):
        title = parts[i].strip()
        content = parts[i+1].strip() if i+1 < len(parts) else ""

        full_chunk = f"{title} {content}"

        if len(full_chunk) > 100:
            chunks.append(full_chunk)

    return chunks

# =========================
# 🔹 STEP 4: ADD BASIC TAGS
# =========================
def generate_basic_tags(text):
    text = text.lower()

    tags = []

    if "suit" in text:
        tags.append("civil_suit")
    if "court" in text:
        tags.append("court")
    if "jurisdiction" in text:
        tags.append("jurisdiction")
    if "plaint" in text:
        tags.append("plaint")
    if "decree" in text:
        tags.append("decree")
    if "appeal" in text:
        tags.append("appeal")

    return tags

# =========================
# 🔹 STEP 5: PROCESS + STORE
# =========================
def process_pdf():
    print("📄 Extracting text...")
    raw_text = extract_text_from_pdf(PDF_PATH)

    print("🧹 Cleaning text...")
    clean = clean_text(raw_text)

    print("✂️ Chunking (legal-aware)...")
    chunks = chunk_text(clean)

    print(f"📦 Total chunks: {len(chunks)}")

    docs = []

    for i, chunk in enumerate(chunks):
        if len(chunk.strip()) < 50:
            continue

        embedding = model.encode(chunk).tolist()
        tags = generate_basic_tags(chunk)

        doc = {
            "text": f"[CPC] {chunk}",   # 🔥 helps retrieval
            "tags": tags,
            "act": "Civil Procedure Code",
            "chunk_id": i,
            "embedding": embedding
        }

        docs.append(doc)

        if i % 50 == 0:
            print(f"⚡ Processed {i} chunks")

    if docs:
        collection.insert_many(docs)
        print(f"✅ Inserted {len(docs)} CPC chunks")

    print("🎉 CPC ingestion complete!")

# =========================
# 🔹 RUN
# =========================
if __name__ == "__main__":
    process_pdf()