# app/main.py

import os
from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

# =========================
# LOAD ENV & CONSTANTS
# =========================

BASE_DIR = Path(__file__).resolve().parent.parent
DOTENV_PATH = BASE_DIR / ".env"
load_dotenv(dotenv_path=DOTENV_PATH)

# Thư mục & collection phải khớp với ingest_books.py
PERSIST_DIR = str(BASE_DIR / "chroma_books")
COLLECTION_NAME = "books"

# Cấu hình embedding (giống ingest)
EMBEDDING_MODEL_NAME = os.getenv(
    "EMBEDDING_MODEL_NAME",
    "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
)

# Gemini API key
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    print("⚠️  Thiếu GOOGLE_API_KEY trong .env, endpoint /chat sẽ lỗi nếu gọi LLM.")


# =========================
# EMBEDDINGS + VECTORSTORE
# =========================

def get_embeddings():
    print(f"Khởi tạo HuggingFaceEmbeddings (service): {EMBEDDING_MODEL_NAME}")
    return HuggingFaceEmbeddings(
        model_name=EMBEDDING_MODEL_NAME,
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True},
    )


embeddings = get_embeddings()

vectorstore = Chroma(
    embedding_function=embeddings,
    persist_directory=PERSIST_DIR,
    collection_name=COLLECTION_NAME,
)

retriever = vectorstore.as_retriever(search_kwargs={"k": 8})


# =========================
# LLM GEMINI + RAG CHAIN
# =========================

def get_gemini_llm():
    if not GOOGLE_API_KEY:
        # vẫn trả về None, để kiểm soát ở /chat
        return None

    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0.2,
    )
    print("Đã khởi tạo LLM Gemini: gemini-2.5-flash")
    return llm


llm_gemini = get_gemini_llm()


def build_rag_chain(llm):
    """
    Tạo RAG chain sử dụng retriever + Gemini LLM.
    """
    template = """
Bạn là trợ lý tư vấn sách cho một nhà sách online.

Bạn được cung cấp danh sách SÁCH liên quan trong phần CONTEXT bên dưới.
Mỗi sách có: tiêu đề, tác giả, thể loại, giá, đánh giá, tồn kho, mô tả,...

---------------------- CONTEXT (DANH SÁCH SÁCH) ----------------------
{context}
---------------------------------------------------------------------

Câu hỏi / yêu cầu của khách: {question}

YÊU CẦU TRẢ LỜI:
- Dựa CHỦ YẾU vào thông tin trong CONTEXT.
- Khi khách hỏi "gợi ý sách" hoặc mô tả nhu cầu (vd: thích trinh thám, self-help, lập trình,...):
    + Hãy chọn 3–5 quyển phù hợp nhất từ CONTEXT.
    + Mỗi sách ghi rõ: tên, tác giả, thể loại chính, giá (xấp xỉ), đối tượng phù hợp.
- Nếu khách hỏi về một cuốn cụ thể:
    + Tóm tắt nội dung, đối tượng phù hợp, điểm mạnh/đặc biệt.
- Nếu CONTEXT không chứa thông tin phù hợp:
    + Hãy nói rõ là bạn chưa có dữ liệu trong hệ thống hiện tại.
    + Gợi ý khách dùng tính năng tìm kiếm hoặc liên hệ CSKH.

Luôn trả lời bằng TIẾNG VIỆT, giọng thân thiện, rõ ràng.
"""

    prompt = ChatPromptTemplate.from_template(template)

    rag_chain = (
        {
            "context": retriever,          # retriever nhận input là question
            "question": RunnablePassthrough(),
        }
        | prompt
        | llm
        | StrOutputParser()
    )
    return rag_chain


rag_chain = build_rag_chain(llm_gemini) if llm_gemini is not None else None


# =========================
# SCHEMAS
# =========================

class RecommendRequest(BaseModel):
    query: str


class BookOut(BaseModel):
    book_id: Optional[int] = None
    title: Optional[str] = None
    authors: Optional[str] = None
    categories: Optional[str] = None
    publisher: Optional[str] = None
    price: Optional[float] = None
    star: Optional[float] = None
    stock: Optional[int] = None
    image: Optional[str] = None
    reason: Optional[str] = None
    short_description: Optional[str] = None


class RecommendResponse(BaseModel):
    books: List[BookOut]


class ChatRequest(BaseModel):
    question: str


class ChatResponse(BaseModel):
    answer: str


# =========================
# FASTAPI APP
# =========================

app = FastAPI(title="BookShopAI Service (HF Embedding + Gemini LLM)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Dev: mở hết, sau giới hạn domain FE
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- /recommend: Vector search đơn giản ----------

@app.post("/recommend", response_model=RecommendResponse)
async def recommend(req: RecommendRequest):
    """
    Body:
      { "query": "sách trinh thám" }

    Dùng vector search lấy top-k sách gần nhất, không gọi LLM.
    """
    docs = retriever.invoke(req.query)

    if not docs:
        return RecommendResponse(books=[])

    books: List[BookOut] = []

    for idx, d in enumerate(docs[:6]):  # max 6 cuốn
        m = d.metadata

        title = m.get("title")
        authors = m.get("authors") or "Không rõ tác giả"
        categories = m.get("categories") or "Không rõ thể loại"
        price = m.get("price")
        star = m.get("star")

        reason = f"Sách này có nội dung/thể loại gần với yêu cầu: \"{req.query}\"."
        short_desc = (
            f"\"{title}\" thuộc {categories}, phù hợp với chủ đề bạn đang tìm."
        )

        books.append(
            BookOut(
                book_id=m.get("book_id"),
                title=title,
                authors=authors,
                categories=categories,
                publisher=m.get("publisher"),
                price=price,
                star=star,
                stock=m.get("stock"),
                image=m.get("image"),
                reason=reason,
                short_description=short_desc,
            )
        )

    return RecommendResponse(books=books)


# ---------- /chat: RAG + Gemini LLM ----------

@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    """
    Body:
      { "question": "Mình thích truyện trinh thám nhẹ nhàng, có gợi ý gì không?" }

    Logic:
      - Dùng retriever lấy context sách liên quan
      - Cho Gemini RAG trả lời theo context.
    """
    if rag_chain is None:
        return ChatResponse(
            answer="Hiện tại dịch vụ LLM (Gemini) chưa được cấu hình GOOGLE_API_KEY. "
                   "Hãy liên hệ admin để cấu hình khóa API."
        )

    try:
        answer = rag_chain.invoke(req.question)
    except Exception as e:
        answer = f"Đã xảy ra lỗi khi gọi mô hình LLM: {e}"

    return ChatResponse(answer=answer)
