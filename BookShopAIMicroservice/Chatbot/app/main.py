# import os
# import shutil
# import asyncio
# from pathlib import Path
# from typing import List, Optional
# import time

# from fastapi import FastAPI, File, UploadFile, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# from dotenv import load_dotenv

# from langchain_chroma import Chroma
# from langchain_huggingface import HuggingFaceEmbeddings
# from langchain_google_genai import ChatGoogleGenerativeAI

# from langchain_core.prompts import ChatPromptTemplate
# from langchain_core.output_parsers import StrOutputParser
# from langchain_core.runnables import RunnablePassthrough

# # Thư viện cần thiết cho việc upload file (multipart/form-data)
# # Cần chạy: pip install python-multipart
# # Cần chạy: pip install unstructured (để xử lý file trong ingest_data.py)

# # Import hàm Ingestion từ file đã sửa
# from .ingest_data import run_ingestion 

# # =========================
# # LOAD ENV & CONSTANTS
# # =========================

# BASE_DIR = Path(__file__).resolve().parent.parent
# DOTENV_PATH = BASE_DIR / ".env"
# load_dotenv(dotenv_path=DOTENV_PATH)

# # Phải khớp với ingest_data.py
# PERSIST_DIR = str(BASE_DIR / "chroma_data")
# COLLECTION_NAME = "general_knowledge"
# EMBEDDING_MODEL_NAME = os.getenv(
#     "EMBEDDING_MODEL_NAME",
#     "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
# )
# FILE_DATA_DIR = BASE_DIR / "data" / "policy"

# GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
# if not GOOGLE_API_KEY:
#     print("⚠️  Thiếu GOOGLE_API_KEY trong .env, endpoint /chat sẽ lỗi nếu gọi LLM.")

# # =========================
# # GLOBAL STATES & LOCKS
# # =========================

# embeddings = None
# vectorstore = None
# retriever = None

# # Khóa để đảm bảo chỉ có 1 quá trình Ingest chạy cùng lúc
# INGEST_LOCK = asyncio.Lock()


# # =========================
# # EMBEDDINGS + VECTORSTORE LOGIC
# # =========================

# def get_embeddings():
#     global embeddings
#     if embeddings is None:
#         print(f"Khởi tạo HuggingFaceEmbeddings (service): {EMBEDDING_MODEL_NAME}")
#         embeddings = HuggingFaceEmbeddings(
#             model_name=EMBEDDING_MODEL_NAME,
#             model_kwargs={"device": "cpu"},
#             encode_kwargs={"normalize_embeddings": True},
#         )
#     return embeddings

# def load_vectorstore_and_retriever():
#     """Tải Vectorstore và cập nhật Retriever."""
#     global vectorstore, retriever
    
#     embed_func = get_embeddings()
    
#     # Kiểm tra sự tồn tại của Vector DB
#     if not Path(PERSIST_DIR).is_dir() or not any(Path(PERSIST_DIR).iterdir()):
#         print(f"⚠️ Vector DB chưa tồn tại tại {PERSIST_DIR}. Đang khởi tạo vectorstore rỗng.")
#         vectorstore = Chroma(
#             embedding_function=embed_func,
#             persist_directory=PERSIST_DIR,
#             collection_name=COLLECTION_NAME,
#         )
#     else:
#         print("Đang tải Vectorstore Chroma hiện tại...")
#         vectorstore = Chroma(
#             embedding_function=embed_func,
#             persist_directory=PERSIST_DIR,
#             collection_name=COLLECTION_NAME,
#         )
    
#     retriever = vectorstore.as_retriever(search_kwargs={"k": 8})
#     print("Vectorstore và Retriever đã sẵn sàng.")

# # Khởi tạo Vectorstore/Retriever khi service khởi động
# load_vectorstore_and_retriever()


# # =========================
# # LLM GEMINI + RAG CHAIN LOGIC
# # =========================

# def get_gemini_llm():
#     if not GOOGLE_API_KEY:
#         return None

#     llm = ChatGoogleGenerativeAI(
#         model="gemini-2.5-flash-lite",
#         temperature=0.2,
#     )
#     print("Đã khởi tạo LLM Gemini: gemini-2.5-flash-lite")
#     return llm

# llm_gemini = get_gemini_llm()


# def build_rag_chain(llm):
#     """
#     Tạo RAG chain sử dụng retriever + Gemini LLM.
#     """
#     template = """
# Bạn là trợ lý tư vấn và hỗ trợ khách hàng cho một nhà sách online.

# Bạn được cung cấp thông tin liên quan trong phần CONTEXT bên dưới.
# CONTEXT có thể bao gồm:
# 1. **Danh sách SÁCH:** Tiêu đề, tác giả, thể loại, giá, đánh giá, tồn kho, mô tả,...
# 2. **Các tài liệu Chính sách, FAQ** (ví dụ: chính sách đổi trả, quy định bảo mật).

# ---------------------- CONTEXT ----------------------
# {context}
# -----------------------------------------------------

# Câu hỏi / yêu cầu của khách: {question}

# YÊU CẦU TRẢ LỜI:
# - Dựa CHỦ YẾU vào thông tin trong CONTEXT.
# - **Nếu khách hỏi về sách/gợi ý sách:**
#     + Hãy chọn 3–5 quyển phù hợp nhất từ CONTEXT (nếu có).
#     + Mỗi sách ghi rõ: tên, tác giả, thể loại chính, giá (xấp xỉ), đối tượng phù hợp.
# - **Nếu khách hỏi về Chính sách/FAQ:**
#     + Tóm tắt và trả lời dựa trên nội dung trong CONTEXT.
# - Nếu CONTEXT không chứa thông tin phù hợp:
#     + Hãy nói rõ là bạn chưa có dữ liệu trong hệ thống hiện tại.
#     + Gợi ý khách dùng tính năng tìm kiếm hoặc liên hệ CSKH.

# Luôn trả lời bằng TIẾNG VIỆT, giọng thân thiện, rõ ràng.
# """

#     prompt = ChatPromptTemplate.from_template(template)

#     # Sử dụng lambda để đảm bảo retriever được gọi với input dictionary
#     # và sử dụng đối tượng retriever mới nhất (global)
#     rag_chain = (
#         {
#             "context": lambda x: retriever.invoke(x["question"]),
#             "question": RunnablePassthrough(),
#         }
#         | prompt
#         | llm
#         | StrOutputParser()
#     )
#     return rag_chain


# rag_chain = build_rag_chain(llm_gemini) if llm_gemini is not None else None


# # =========================
# # SCHEMAS (Pydantic Models)
# # =========================

# class RecommendRequest(BaseModel):
#     query: str


# class BookOut(BaseModel):
#     book_id: Optional[int] = None
#     title: Optional[str] = None
#     authors: Optional[str] = None
#     categories: Optional[str] = None
#     publisher: Optional[str] = None
#     price: Optional[float] = None
#     star: Optional[float] = None
#     stock: Optional[int] = None
#     image: Optional[str] = None
#     reason: Optional[str] = None
#     short_description: Optional[str] = None


# class RecommendResponse(BaseModel):
#     books: List[BookOut]


# class ChatRequest(BaseModel):
#     question: str


# class ChatResponse(BaseModel):
#     answer: str

# class IngestResponse(BaseModel):
#     status: str
#     message: str
#     time_taken: float = 0.0


# # =========================
# # FASTAPI APP
# # =========================

# app = FastAPI(title="BookShopAI Service (HF Embedding + Gemini LLM)")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )


# # ---------- HÀM CHUNG ĐỂ RELOAD RETRIEVER SAU INGEST ----------
# async def reload_retriever_from_ingest():
#     """Thực hiện quá trình Ingest (tốn thời gian) và cập nhật Retriever."""
#     global vectorstore, retriever
    
#     # Đảm bảo chỉ 1 tiến trình ingest chạy cùng lúc
#     async with INGEST_LOCK:
#         print("Bắt đầu quá trình Ingest toàn bộ dữ liệu (MySQL + Files)...")
#         start_time = time.time()
        
#         try:
#             # Chạy hàm ingest đã được import
#             # Sử dụng asyncio.to_thread để chạy hàm blocking (I/O) trên một luồng khác
#             new_vectorstore = await asyncio.to_thread(run_ingestion)
            
#             if new_vectorstore:
#                 # Cập nhật global vectorstore và retriever mới
#                 vectorstore = new_vectorstore
#                 retriever = vectorstore.as_retriever(search_kwargs={"k": 8})
#                 time_taken = time.time() - start_time
#                 return IngestResponse(
#                     status="success", 
#                     message="Ingest thành công, Retriever đã được cập nhật.",
#                     time_taken=time_taken
#                 )
#             else:
#                 time_taken = time.time() - start_time
#                 return IngestResponse(
#                     status="warning", 
#                     message="Ingest hoàn tất nhưng không có dữ liệu để nhúng.",
#                     time_taken=time_taken
#                 )

#         except Exception as e:
#             time_taken = time.time() - start_time
#             print(f"Lỗi trong quá trình Ingest: {e}")
#             raise HTTPException(status_code=500, detail=f"Lỗi Ingest dữ liệu: {e}")


# # ---------- /recommend: Vector search đơn giản ----------

# @app.post("/recommend", response_model=RecommendResponse, tags=["Book Search"])
# async def recommend(req: RecommendRequest):
#     """
#     Dùng vector search lấy top-k sách gần nhất, không gọi LLM.
#     Chỉ trả về các document có source là sách.
#     """
#     # Sử dụng retriever global
#     docs = retriever.invoke(req.query)

#     if not docs:
#         return RecommendResponse(books=[])

#     books: List[BookOut] = []

#     for idx, d in enumerate(docs):
#         m = d.metadata
        
#         # Chỉ trả về BookOut nếu nguồn là sách (mysql_book)
#         if m.get("source") != "mysql_book":
#             continue

#         if len(books) >= 3: # Giới hạn 3 cuốn sách
#              break

#         title = m.get("title")
#         authors = m.get("authors") or "Không rõ tác giả"
#         categories = m.get("categories") or "Không rõ thể loại"
#         price = m.get("price")
#         star = m.get("star")

#         reason = f"Sách này có nội dung/thể loại gần với yêu cầu: \"{req.query}\"."
#         short_desc = (
#             f"\"{title}\" thuộc {categories}, phù hợp với chủ đề bạn đang tìm."
#         )

#         books.append(
#             BookOut(
#                 book_id=m.get("book_id"),
#                 title=title,
#                 authors=authors,
#                 categories=categories,
#                 publisher=m.get("publisher"),
#                 price=price,
#                 star=star,
#                 stock=m.get("stock"),
#                 image=m.get("image"),
#                 reason=reason,
#                 short_description=short_desc,
#             )
#         )

#     return RecommendResponse(books=books)


# # ---------- /chat: RAG + Gemini LLM ----------

# @app.post("/chat", response_model=ChatResponse, tags=["Chatbot"])
# async def chat(req: ChatRequest):
#     """
#     Logic: Dùng retriever lấy context sách và policy liên quan, sau đó cho Gemini RAG trả lời.
#     """
#     # Sử dụng rag_chain global
#     if rag_chain is None:
#         return ChatResponse(
#             answer="Hiện tại dịch vụ LLM (Gemini) chưa được cấu hình GOOGLE_API_KEY. "
#                    "Hãy liên hệ admin để cấu hình khóa API."
#         )

#     try:
#         # Gọi invoke với dictionary input
#         answer = rag_chain.invoke({"question": req.question}) 
#     except Exception as e:
#         print(f"Lỗi LLM: {e}")
#         answer = f"Đã xảy ra lỗi khi gọi mô hình LLM: {e}"

#     return ChatResponse(answer=answer)


# # -------------------------------------------------------------------
# # ---------- API MỚI 1: POST /ingest (Reload Toàn Bộ Dữ liệu) ----------
# # -------------------------------------------------------------------

# @app.post("/ingest", response_model=IngestResponse, tags=["Admin"])
# async def reload_data():
#     """
#     Kích hoạt việc tải lại toàn bộ Vector DB từ MySQL và thư mục file.
#     """
#     return await reload_retriever_from_ingest()

# # -------------------------------------------------------------------
# # ---------- API MỚI 2: POST /upload_file (Upload File Tài liệu) ----------
# # -------------------------------------------------------------------

# @app.post("/upload_file", response_model=IngestResponse, tags=["Admin"])
# async def upload_document(
#     file: UploadFile = File(...)
# ):
#     """
#     Tải file tài liệu (chính sách, FAQ) lên và kích hoạt Ingest sau đó.
#     Chỉ chấp nhận các loại file đã được cấu hình trong ingest_data.py (txt, pdf).
#     """
    
#     # Kiểm tra loại file cơ bản
#     allowed_extensions = ['.txt', '.pdf', '.md']
#     file_ext = Path(file.filename).suffix.lower()
    
#     if file_ext not in allowed_extensions:
#         raise HTTPException(
#             status_code=400, 
#             detail=f"Chỉ chấp nhận các file có định dạng: {', '.join(allowed_extensions)}"
#         )
    
#     # Dùng tên file gốc
#     upload_path = Path(FILE_DATA_DIR) / file.filename
    
#     try:
#         # 1. Đảm bảo thư mục tồn tại và lưu file
#         FILE_DATA_DIR.mkdir(parents=True, exist_ok=True)
        
#         # Ghi nội dung file
#         with upload_path.open("wb") as buffer:
#             shutil.copyfileobj(file.file, buffer)
        
#         print(f"Đã lưu file: {upload_path}")
        
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Lỗi khi lưu file: {e}")

#     # 2. Sau khi lưu file, kích hoạt Ingest toàn bộ dữ liệu để cập nhật Vector DB
#     return await reload_retriever_from_ingest()











import os
import shutil
import asyncio
from pathlib import Path
from typing import List, Optional
import time

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, AIMessage

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

# Import hàm Ingestion từ file đã sửa
from .ingest_data import run_ingestion 
# Import ngoại lệ để xử lý lỗi tài nguyên hết quota Gemini
# from google.api_core.exceptions import ResourceExhaustedError

# =========================
# LOAD ENV & CONSTANTS
# =========================

BASE_DIR = Path(__file__).resolve().parent.parent
DOTENV_PATH = BASE_DIR / ".env"
load_dotenv(dotenv_path=DOTENV_PATH)

PERSIST_DIR = str(BASE_DIR / "chroma_data")
COLLECTION_NAME = "general_knowledge"
EMBEDDING_MODEL_NAME = os.getenv(
    "EMBEDDING_MODEL_NAME",
    "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
)
FILE_DATA_DIR = BASE_DIR / "data" / "policy"

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# Cấu hình ngưỡng điểm (Threshold) cho gợi ý (0.0 đến 1.0)
SCORE_THRESHOLD = 1.05

# =========================
# GLOBAL STATES & LOCKS
# =========================

embeddings = None
vectorstore = None
retriever = None
INGEST_LOCK = asyncio.Lock()


# =========================
# EMBEDDINGS + VECTORSTORE LOGIC
# =========================

def get_embeddings():
    global embeddings
    if embeddings is None:
        print(f"Khởi tạo HuggingFaceEmbeddings (service): {EMBEDDING_MODEL_NAME}")
        embeddings = HuggingFaceEmbeddings(
            model_name=EMBEDDING_MODEL_NAME,
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True},
        )
    return embeddings

def load_vectorstore_and_retriever():
    """Tải Vectorstore và cập nhật Retriever."""
    global vectorstore, retriever
    
    embed_func = get_embeddings()
    
    if not Path(PERSIST_DIR).is_dir() or not any(Path(PERSIST_DIR).iterdir()):
        print(f"⚠️ Vector DB chưa tồn tại tại {PERSIST_DIR}. Đang khởi tạo vectorstore rỗng.")
        vectorstore = Chroma(embedding_function=embed_func)
    else:
        print("Đang tải Vectorstore Chroma hiện tại...")
        vectorstore = Chroma(
            embedding_function=embed_func,
            persist_directory=PERSIST_DIR,
            collection_name=COLLECTION_NAME,
        )
    
    retriever = vectorstore.as_retriever(search_kwargs={"k": 8})
    print("Vectorstore và Retriever đã sẵn sàng.")

load_vectorstore_and_retriever()


# =========================
# LLM GEMINI + RAG CHAIN LOGIC
# =========================

def get_gemini_llm():
    if not GOOGLE_API_KEY:
        return None

    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0.2,
    )
    print("Đã khởi tạo LLM Gemini: gemini-2.5")
    return llm

llm_gemini = get_gemini_llm()


# PROMPT DÙNG ĐỂ TẠO CÂU HỎI ĐỘC LẬP (CONTEXTUALIZATION)
CONTEXTUALIZE_PROMPT = """
Dựa trên lịch sử cuộc trò chuyện và câu hỏi mới nhất, hãy tạo ra một câu hỏi độc lập 
có thể được hiểu mà không cần tham chiếu đến lịch sử trò chuyện.
Nếu không có lịch sử trò chuyện, chỉ cần trả lại câu hỏi mới nhất.
Luôn trả lời bằng TIẾNG VIỆT.

Lịch sử trò chuyện:
{chat_history}

Câu hỏi mới nhất: {question}

Câu hỏi độc lập:
"""

def get_contextualized_question(llm, chat_history, question):
    """Sử dụng LLM để biến câu hỏi phụ thuộc ngữ cảnh thành câu hỏi độc lập."""
    if not chat_history:
        return question

    # Chuyển lịch sử Pydantic thành chuỗi văn bản đơn giản
    history_str = "\n".join([f"{msg.role}: {msg.content}" for msg in chat_history])
    
    contextualize_prompt = ChatPromptTemplate.from_template(CONTEXTUALIZE_PROMPT)
    contextualize_chain = contextualize_prompt | llm | StrOutputParser()
    
    independent_question = contextualize_chain.invoke({
        "chat_history": history_str,
        "question": question
    })
    return independent_question


def build_rag_chain_with_history(llm_generation, llm_contextualize):
    """Tạo RAG chain mới tích hợp Contextualization."""
    template = """
Bạn là trợ lý tư vấn và hỗ trợ khách hàng cho một nhà sách online.
Bạn được cung cấp thông tin liên quan trong phần CONTEXT bên dưới.
CONTEXT có thể bao gồm:
1. **Danh sách SÁCH:** Tiêu đề, tác giả, thể loại, giá, đánh giá, tồn kho, mô tả,...
2. **Các tài liệu Chính sách, FAQ** (ví dụ: chính sách đổi trả, quy định bảo mật).

---------------------- CONTEXT ----------------------
{context}
-----------------------------------------------------

Câu hỏi / yêu cầu của khách: {question}

YÊU CẦU TRẢ LỜI:
- Dựa CHỦ YẾU vào thông tin trong CONTEXT.
- **Nếu khách hỏi về sách/gợi ý sách:**
    + Hãy chọn 3–5 quyển phù hợp nhất từ CONTEXT (nếu có).
    + Mỗi sách ghi rõ: tên, tác giả, thể loại chính, giá (xấp xỉ), đối tượng phù hợp.
- **Nếu khách hỏi về Chính sách/FAQ:**
    + Tóm tắt và trả lời dựa trên nội dung trong CONTEXT.
- Nếu CONTEXT không chứa thông tin phù hợp:
    + Hãy nói rõ là bạn chưa có dữ liệu trong hệ thống hiện tại.
    + Gợi ý khách dùng tính năng tìm kiếm hoặc liên hệ CSKH.

Luôn trả lời bằng TIẾNG VIỆT, giọng thân thiện, rõ ràng.
"""
    prompt = ChatPromptTemplate.from_template(template)
    
    # Bước 1: Contextualize Question
    contextualize_step = RunnablePassthrough.assign(
        question_standalone=lambda x: get_contextualized_question(
            llm_contextualize, x['history'], x['question']
        )
    )

    # Bước 2: Retrieval và Generation
    rag_chain = (
        contextualize_step
        | {
            "context": lambda x: retriever.invoke(x["question_standalone"]), 
            "question": lambda x: x["question"],
        }
        | prompt
        | llm_generation
        | StrOutputParser()
    )
    return rag_chain

# Khởi tạo RAG Chain mới
rag_chain = build_rag_chain_with_history(llm_gemini, llm_gemini) if llm_gemini is not None else None


# =========================
# SCHEMAS (Cập nhật cho Lịch sử Chat)
# =========================

class ChatMessage(BaseModel):
    role: str # 'human' hoặc 'ai'
    content: str

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
    # Thêm trường message để báo lỗi/cảnh báo
    message: Optional[str] = None 

class ChatRequest(BaseModel):
    question: str
    history: List[ChatMessage] = [] # Thêm trường lịch sử chat

class ChatResponse(BaseModel):
    answer: str

class IngestResponse(BaseModel):
    status: str
    message: str
    time_taken: float = 0.0


# =========================
# FASTAPI APP
# =========================

app = FastAPI(title="BookShopAI Service (HF Embedding + Gemini LLM)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- HÀM CHUNG ĐỂ RELOAD RETRIEVER SAU INGEST ----------
async def reload_retriever_from_ingest():
    # ... (Logic giữ nguyên)
    global vectorstore, retriever
    
    async with INGEST_LOCK:
        print("Bắt đầu quá trình Ingest toàn bộ dữ liệu (MySQL + Files)...")
        start_time = time.time()
        
        try:
            new_vectorstore = await asyncio.to_thread(run_ingestion)
            
            if new_vectorstore:
                vectorstore = new_vectorstore
                retriever = vectorstore.as_retriever(search_kwargs={"k": 8})
                time_taken = time.time() - start_time
                return IngestResponse(
                    status="success", 
                    message="Ingest thành công, Retriever đã được cập nhật.",
                    time_taken=time_taken
                )
            else:
                time_taken = time.time() - start_time
                return IngestResponse(
                    status="warning", 
                    message="Ingest hoàn tất nhưng không có dữ liệu để nhúng.",
                    time_taken=time_taken
                )

        except Exception as e:
            time_taken = time.time() - start_time
            print(f"Lỗi trong quá trình Ingest: {e}")
            raise HTTPException(status_code=500, detail=f"Lỗi Ingest dữ liệu: {e}")


# ---------- /recommend: Vector search đơn giản VÀ LỌC THEO ĐIỂM ----------

@app.post("/recommend", response_model=RecommendResponse, tags=["Book Search"])
async def recommend(req: RecommendRequest):
    """
    Dùng vector search lấy top-k sách gần nhất và LỌC theo SCORE_THRESHOLD (0.82).
    """
    global vectorstore
    
    # Lấy document CÙNG VỚI ĐIỂM SỐ
    # k=15 để lấy nhiều hơn, tạo cơ hội tìm được 3 cuốn đạt ngưỡng
    scored_docs = vectorstore.similarity_search_with_score(
        query=req.query,
        k=15
    ) 

    if not scored_docs:
        return RecommendResponse(books=[], message="Không tìm thấy tài liệu nào trong Vector DB.")

    books: List[BookOut] = []

    for d, score in scored_docs:
        
        # 1. Lọc theo Ngưỡng điểm (Threshold)
        if score < SCORE_THRESHOLD:
            # Nếu điểm thấp hơn ngưỡng, dừng gợi ý (vì docs đã sắp xếp theo điểm)
            break
            
        m = d.metadata
        
        # 2. Lọc theo Nguồn (chỉ lấy sách)
        if m.get("source") != "mysql_book":
            continue

        if len(books) >= 3: # Giới hạn 3 cuốn sách
             break

        # Gán dữ liệu sách
        title = m.get("title")
        authors = m.get("authors") or "Không rõ tác giả"
        categories = m.get("categories") or "Không rõ thể loại"
        price = m.get("price")
        star = m.get("star")

        reason = f"Sách này (Điểm: {score:.3f}) có nội dung/thể loại gần với yêu cầu: \"{req.query}\"."
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
    
    # Trả về thông báo nếu không có sách nào đạt ngưỡng
    if not books:
        return RecommendResponse(
            books=[], 
            message=f"Không tìm thấy sách phù hợp (yêu cầu: '{req.query}')"
        )

    return RecommendResponse(books=books, message=f"Gợi ý {len(books)} sách phù hợp với yêu cầu.")


# ---------- /chat: RAG + Gemini LLM (CÓ LỊCH SỬ CHAT) ----------

# @app.post("/chat", response_model=ChatResponse, tags=["Chatbot"])
# async def chat(req: ChatRequest):
#     """
#     Logic: Contextualize câu hỏi bằng lịch sử chat, sau đó dùng RAG để trả lời.
#     """
#     if rag_chain is None:
#         return ChatResponse(
#             answer="Hiện tại dịch vụ LLM (Gemini) chưa được cấu hình GOOGLE_API_KEY. "
#                    "Hãy liên hệ admin để cấu hình khóa API."
#         )

#     try:
#         # Gọi invoke, truyền cả question VÀ history (theo schema mới)
#         answer = rag_chain.invoke({"question": req.question, "history": req.history}) 
#     except Exception as e:
#         print(f"Lỗi LLM: {e}")
#         answer = f"Đã xảy ra lỗi khi gọi mô hình LLM: {e}"

#     return ChatResponse(answer=answer)



# ---------- /chat: RAG + Gemini LLM (CÓ lịch sử chat và BẮT LỖI QUOTA) ----------
@app.post("/chat", response_model=ChatResponse, tags=["Chatbot"])
async def chat(req: ChatRequest):
    """
    Logic: Contextualize câu hỏi bằng lịch sử chat, sau đó dùng RAG để trả lời.
    Sử dụng bắt lỗi theo nội dung lỗi (chuỗi ký tự) để xử lý lỗi 429 (Quota Exceeded).
    """
    if rag_chain is None:
        return ChatResponse(
            answer="Hiện tại dịch vụ LLM (Gemini) chưa được cấu hình GOOGLE_API_KEY. "
                   "Hãy liên hệ admin để cấu hình khóa API."
        )

    try:
        # Gọi invoke, truyền cả question VÀ history
        answer = rag_chain.invoke({"question": req.question, "history": req.history}) 
    
    except Exception as e:
        error_message = str(e)
        
        # Bắt lỗi Quota Exceeded bằng cách kiểm tra các từ khóa quan trọng
        # (Ví dụ: 429, Quota, Exceeded) trong thông báo lỗi.
        is_quota_error = (
            "429" in error_message
            or "ResourceExhaustedError" in error_message
            or "Quota exceeded" in error_message
            or "limit:" in error_message # Kiểm tra cụm "limit: 20"
        )
        
        if is_quota_error:
            print("⚠️ Lỗi Quota Exceeded: Đã hết lượt chat hôm nay.")
            answer = "Bạn đã hết lượt chat hôm nay rồi, vui lòng quay lại sau nhé! Bạn có thể sang tab Gợi ý nhanh để tìm sách nè."
        else:
            # Bắt các lỗi chung khác
            print(f"Lỗi LLM không xác định: {e}")
            answer = f"Đã xảy ra lỗi hệ thống khi gọi mô hình LLM. Vui lòng thử lại sau."
            
    return ChatResponse(answer=answer)


# ---------- API Admin (Ingest/Upload) ----------

@app.post("/ingest", response_model=IngestResponse, tags=["Admin"])
async def reload_data():
    return await reload_retriever_from_ingest()

@app.post("/upload_file", response_model=IngestResponse, tags=["Admin"])
async def upload_document(
    file: UploadFile = File(...)
):
    # Logic giữ nguyên
    allowed_extensions = ['.txt', '.pdf', '.md']
    file_ext = Path(file.filename).suffix.lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail=f"Chỉ chấp nhận các file có định dạng: {', '.join(allowed_extensions)}"
        )
    
    upload_path = Path(FILE_DATA_DIR) / file.filename
    
    try:
        FILE_DATA_DIR.mkdir(parents=True, exist_ok=True)
        with upload_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        print(f"Đã lưu file: {upload_path}")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi lưu file: {e}")

    return await reload_retriever_from_ingest()




# ---------- API MỚI 3: GET /policies (Liệt kê file trong thư mục data/policy) ----------
@app.get("/policies", tags=["Admin"])
async def list_policies():
    """
    Trả về danh sách file tài liệu trong thư mục data/policy (đã dùng để Ingest).
    Response: [{ filename, source, size, uploaded_at }, ...]
    """
    # Sử dụng hằng số FILE_DATA_DIR đã định nghĩa
    data_dir = FILE_DATA_DIR 
    result = []
    
    # Đảm bảo thư mục tồn tại, nếu không thì trả về danh sách rỗng
    if not data_dir.exists():
        print(f"Thư mục chính sách không tồn tại: {data_dir}")
        return result

    # Lặp qua các file, sắp xếp theo thời gian sửa đổi (mới nhất lên đầu)
    for p in sorted(data_dir.iterdir(), key=lambda x: x.stat().st_mtime, reverse=True):
        if p.is_file():
            stat = p.stat()
            result.append({
                "filename": p.name,
                "source": str(p),
                "size": stat.st_size, # Kích thước tính bằng bytes
                "uploaded_at": time.strftime("%Y-%m-%dT%H:%M:%S", time.localtime(stat.st_mtime))
            })
            
    print(f"Đã trả về danh sách {len(result)} file chính sách.")
    return result