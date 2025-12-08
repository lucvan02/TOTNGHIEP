# app/ingest_books.py

import os
import pymysql
import shutil
from pathlib import Path
from dotenv import load_dotenv

from langchain_core.documents import Document
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

# ----- LOAD .env ở thư mục Chatbot -----
BASE_DIR = Path(__file__).resolve().parent.parent
DOTENV_PATH = BASE_DIR / ".env"
load_dotenv(dotenv_path=DOTENV_PATH)

# ---------- CẤU HÌNH MYSQL ----------
MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", "3306"))
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
MYSQL_DB = os.getenv("MYSQL_DB", "bookweb_book")

# ---------- CẤU HÌNH CHROMA ----------
PERSIST_DIR = str(BASE_DIR / "chroma_books")  # thư mục lưu vector DB
COLLECTION_NAME = "books"

# ---------- CẤU HÌNH EMBEDDING ----------
# Có thể override trong .env: EMBEDDING_MODEL_NAME=...
EMBEDDING_MODEL_NAME = os.getenv(
    "EMBEDDING_MODEL_NAME",
    "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
)
# Model này:
# - Đa ngôn ngữ, hỗ trợ tiếng Việt tốt
# - Vẫn khá nhẹ, chạy được trên CPU


def get_connection():
    return pymysql.connect(
        host=MYSQL_HOST,
        port=MYSQL_PORT,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_DB,
        cursorclass=pymysql.cursors.DictCursor,
        charset="utf8mb4",
    )


def fetch_books():
    """
    Lấy dữ liệu sách + tác giả + thể loại + NXB từ MySQL.
    Sau này nếu muốn lọc sách đang bán thì mở WHERE bên dưới.
    """
    sql = """
      SELECT
        b.id,
        b.title,
        b.description,
        b.price,
        b.star,
        b.stock,
        b.status,
        b.weight,
        b.image,
        p.name AS publisher,
        GROUP_CONCAT(DISTINCT a.name SEPARATOR ', ') AS authors,
        GROUP_CONCAT(DISTINCT c.name SEPARATOR ', ') AS categories
      FROM books b
      LEFT JOIN publishers p ON p.id = b.publisher_id
      LEFT JOIN author_book ab ON ab.book_id = b.id
      LEFT JOIN authors a ON a.id = ab.author_id
      LEFT JOIN book_category bc ON bc.book_id = b.id
      LEFT JOIN categories c ON c.id = bc.category_id
      -- Nếu chỉ muốn sách đang bán thì mở comment:
      -- WHERE (b.status IS NULL OR b.status = 1) AND b.stock > 0
      GROUP BY b.id
    """

    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(sql)
            rows = cursor.fetchall()
            return rows
    finally:
        conn.close()


def build_book_text(row: dict) -> str:
    """
    Ghép 1 record sách thành đoạn text để embed.
    """
    title = row.get("title") or ""
    authors = row.get("authors") or "Không rõ"
    categories = row.get("categories") or "Chưa gắn thể loại"
    publisher = row.get("publisher") or "Không rõ"
    description = row.get("description") or ""
    price = row.get("price") or 0
    star = row.get("star") or 0
    stock = row.get("stock") or 0

    text = (
        f"Tiêu đề: {title}\n"
        f"Tác giả: {authors}\n"
        f"Thể loại: {categories}\n"
        f"Nhà xuất bản: {publisher}\n"
        f"Giá: {price} VND\n"
        f"Số sao trung bình: {star}\n"
        f"Tồn kho: {stock}\n"
        f"Mô tả nội dung: {description}"
    )

    return text


def get_embeddings():
    """
    Embedding local từ HuggingFace.
    - Không cần API token nếu model public.
    - Chạy trên CPU.
    """
    print(f"Đang khởi tạo HuggingFaceEmbeddings: {EMBEDDING_MODEL_NAME}")
    embeddings = HuggingFaceEmbeddings(
        model_name=EMBEDDING_MODEL_NAME,
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True},
    )
    return embeddings


def main():
    print("Đang tải dữ liệu sách từ MySQL...")
    rows = fetch_books()
    print(f"Lấy được {len(rows)} sách.")

    if not rows:
        print("Không có sách nào trong DB, dừng ingest.")
        return

    docs = []
    for row in rows:
        content = build_book_text(row)
        metadata = {
            "book_id": row["id"],
            "title": row.get("title"),
            "authors": row.get("authors"),
            "categories": row.get("categories"),
            "publisher": row.get("publisher"),
            "price": row.get("price"),
            "star": row.get("star"),
            "stock": row.get("stock"),
            "image": row.get("image"),
        }
        docs.append(Document(page_content=content, metadata=metadata))

    embeddings = get_embeddings()

    # Xóa vector DB cũ để tạo lại cho sạch
    shutil.rmtree(PERSIST_DIR, ignore_errors=True)

    print("Đang tạo vectorstore Chroma (LOCAL)...")
    _ = Chroma.from_documents(
        documents=docs,
        embedding=embeddings,
        persist_directory=PERSIST_DIR,
        collection_name=COLLECTION_NAME,
    )

    print(
        f"Ingest xong {len(docs)} sách vào Chroma tại '{PERSIST_DIR}', "
        f"collection='{COLLECTION_NAME}'"
    )


if __name__ == "__main__":
    main()
