import os
import pymysql
import shutil
from pathlib import Path
from dotenv import load_dotenv
from typing import List

import hashlib
import gc
import time

from langchain_core.documents import Document
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.document_loaders import DirectoryLoader, PyPDFLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

# ----- LOAD .env ở thư mục Chatbot -----
BASE_DIR = Path(__file__).resolve().parent.parent
DOTENV_PATH = BASE_DIR / ".env"
load_dotenv(dotenv_path=DOTENV_PATH)

# ---------- CẤU HÌNH CHUNG ----------
PERSIST_DIR = str(BASE_DIR / "chroma_data")  # Thư mục lưu vector DB CHUNG
COLLECTION_NAME = "general_knowledge" # Tên collection chung

# ---------- CẤU HÌNH DỮ LIỆU FILE ----------
FILE_DATA_DIR = BASE_DIR / "data" / "policy"

# ---------- CẤU HÌNH MYSQL ----------
MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", "3306"))
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
MYSQL_DB = os.getenv("MYSQL_DB", "bookweb_book")

# ---------- CẤU HÌNH EMBEDDING ----------
EMBEDDING_MODEL_NAME = os.getenv(
    "EMBEDDING_MODEL_NAME",
    "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
)

# ==================================
# PHẦN 1: INGEST DỮ LIỆU SÁCH (MySQL)
# ==================================

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
    """Lấy dữ liệu sách từ MySQL."""
    sql = """
     SELECT 
       b.id, b.title, b.description, b.price, b.star, b.stock, b.image,
       p.name AS publisher,
       GROUP_CONCAT(DISTINCT a.name SEPARATOR ', ') AS authors,
       GROUP_CONCAT(DISTINCT c.name SEPARATOR ', ') AS categories
     FROM books b
     LEFT JOIN publishers p ON p.id = b.publisher_id
     LEFT JOIN author_book ab ON ab.book_id = b.id
     LEFT JOIN authors a ON a.id = ab.author_id
     LEFT JOIN book_category bc ON bc.book_id = b.id
     LEFT JOIN categories c ON c.id = bc.category_id
     GROUP BY b.id
    """
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(sql)
            return cursor.fetchall()
    finally:
        conn.close()


def build_book_doc(row: dict) -> Document:
    """Ghép 1 record sách thành Document."""
    title = row.get("title") or ""
    authors = row.get("authors") or "Không rõ"
    categories = row.get("categories") or "Chưa gắn thể loại"
    publisher = row.get("publisher") or "Không rõ"
    description = row.get("description") or ""
    price = row.get("price") or 0
    star = row.get("star") or 0
    stock = row.get("stock") or 0

    content = (
        f"Tiêu đề Sách: {title}\n"
        f"Tác giả: {authors}\n"
        f"Thể loại: {categories}\n"
        f"Nhà xuất bản: {publisher}\n"
        f"Giá: {price} VND\n"
        f"Số sao trung bình: {star}\n"
        f"Tồn kho: {stock}\n"
        f"Mô tả nội dung: {description}"
    )
    
    metadata = {
        "source": "mysql_book",
        "book_id": row["id"],
        "title": title,
        "authors": authors,
        "categories": categories,
        "publisher": publisher,
        "price": price,
        "star": star,
        "stock": stock,
        "image": row.get("image"),
    }
    return Document(page_content=content, metadata=metadata)

# ==================================
# PHẦN 2: INGEST DỮ LIỆU FILE (Chính sách, FAQ)
# ==================================

def load_file_data(data_dir: Path) -> List[Document]:
    """
    Tải và chia nhỏ các file văn bản (TXT, MD, PDF) từ thư mục data_dir.
    """
    if not data_dir.is_dir():
        print(f"Thư mục dữ liệu file không tồn tại: {data_dir}. Bỏ qua.")
        return []

    print(f"Đang tải dữ liệu từ thư mục file: {data_dir}")
    
    # Loader cho các file .txt (Đã thêm encoding='utf-8' theo đề xuất trước)
    generic_txt_loader = DirectoryLoader(
        path=str(data_dir), 
        glob="**/*.txt", 
        loader_cls=TextLoader,
        loader_kwargs={"encoding": "utf-8"}, # <--- Thêm Encoding
        silent_errors=True
    )
    # Loader cho các file .pdf 
    pdf_loader = DirectoryLoader(
        path=str(data_dir), 
        glob="**/*.pdf",
        loader_cls=PyPDFLoader,
        silent_errors=True
    )

    documents = generic_txt_loader.load() + pdf_loader.load()
    
    if not documents:
        print("Không tìm thấy file nào trong thư mục policy.")
        return []

    # Chia nhỏ văn bản lớn
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
        is_separator_regex=False,
    )
    
    docs_with_metadata = []
    for doc in documents:
        # Lấy đường dẫn file gốc do Loader tạo ra
        original_path = doc.metadata.get("source", "Unknown file path")
        
        # SỬA: Lấy tên file chính xác từ đường dẫn
        filename = Path(original_path).name 

        # SỬA: Đặt lại metadata 
        doc.metadata["source"] = "file_policy" # Giữ nguyên loại nguồn chung
        doc.metadata["filename"] = filename    # Gán tên file chính xác
        
        # Thêm metadata 'chunk_source' để trích xuất đầy đủ đường dẫn khi cần thiết
        # doc.metadata["chunk_source"] = original_path 
        
        docs_with_metadata.append(doc)

    texts = text_splitter.split_documents(docs_with_metadata)
    print(f"Đã chia {len(documents)} document thành {len(texts)} chunks.")
    return texts

# ==================================
# PHẦN 3: MAIN INGEST LOGIC
# ==================================

def get_embeddings():
    """Khởi tạo Embedding local từ HuggingFace."""
    print(f"Đang khởi tạo HuggingFaceEmbeddings: {EMBEDDING_MODEL_NAME}")
    embeddings = HuggingFaceEmbeddings(
        model_name=EMBEDDING_MODEL_NAME,
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True},
    )
    return embeddings


def generate_id(content: str, metadata: dict) -> str:
    """
    Tạo ID duy nhất. 
    LƯU Ý: Không dùng metadata['filename'] trực tiếp nếu filename có chứa timestamp.
    Sử dụng title (cho sách) hoặc nội dung (cho file).
    """
    if metadata.get("source") == "mysql_book":
        unique_key = f"book_{metadata.get('book_id')}"
    else:

        filename = metadata.get("filename", "unknown")
        content_hash = hashlib.md5(content.encode()).hexdigest()
        unique_key = f"file_{filename}_{content_hash}"
    
    return unique_key



def run_ingestion():
    # 1. Lấy dữ liệu
    book_rows = fetch_books()
    book_docs = [build_book_doc(row) for row in book_rows]
    file_docs = load_file_data(FILE_DATA_DIR)
    all_docs = book_docs + file_docs
    
    if not all_docs:
        return None

    # 2. Tạo ID cố định
    ids = [generate_id(doc.page_content, doc.metadata) for doc in all_docs]
    embeddings = get_embeddings()

    # 3. Dọn dẹp Database (Cải tiến)
    if os.path.exists(PERSIST_DIR):
        print("Đang xóa sạch collection cũ...")
        try:
            # Khởi tạo instance tạm để xóa triệt để collection
            temp_db = Chroma(
                persist_directory=PERSIST_DIR,
                embedding_function=embeddings,
                collection_name=COLLECTION_NAME
            )
            temp_db.delete_collection()
            # Ép buộc giải phóng bộ nhớ để tránh File Lock
            del temp_db
            gc.collect() 
            time.sleep(1) # Chờ OS giải phóng file
            shutil.rmtree(PERSIST_DIR, ignore_errors=True)
        except Exception as e:
            print(f"Cảnh báo dọn dẹp: {e}")

    print(f"Đang nạp {len(all_docs)} chunks vào Chroma (IDs cố định)...")
    
    # 4. Ingest với ID - Nếu trùng ID, Chroma sẽ tự động Update (Upsert)
    new_vectorstore = Chroma.from_documents(
        documents=all_docs,
        ids=ids, 
        embedding=embeddings,
        persist_directory=PERSIST_DIR,
        collection_name=COLLECTION_NAME,
    )
    return new_vectorstore


if __name__ == "__main__":
    run_ingestion()



















