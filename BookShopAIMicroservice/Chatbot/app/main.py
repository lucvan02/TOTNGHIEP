import os
import shutil
import asyncio
import time
import logging
import gc
from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
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

# Dùng loader để extract PDF/text khi admin yêu cầu xem nội dung
from langchain_community.document_loaders import PyPDFLoader, TextLoader

# Import hàm Ingestion và hằng số từ ingest_data (file ingest_data.py đã được chỉnh sửa)
from .ingest_data import run_ingestion

# Logging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

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

# Cấu hình ngưỡng điểm (Threshold) cho gợi ý (giá trị dùng trong similarity score)
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
        # tạo Chroma empty (một số phiên bản choma require persist_directory arg)
        try:
            vectorstore = Chroma(embedding_function=embed_func, persist_directory=PERSIST_DIR, collection_name=COLLECTION_NAME)
        except Exception:
            # fallback nếu signature khác
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

# Tải vectorstore khi khởi động
try:
    load_vectorstore_and_retriever()
except Exception as e:
    logger.exception("Lỗi khi load vectorstore lúc khởi động: %s", e)


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

# HÀM MỚI: Format lịch sử chat
def format_history_to_string(history: List['ChatMessage']) -> str:
    """Chuyển đổi List[ChatMessage] thành chuỗi format cho Prompt."""
    if not history:
        return "Không có lịch sử trò chuyện."
    # Dùng list comprehension để chuyển đổi
    return "\n".join([f"{msg.role.upper()}: {msg.content}" for msg in history])


def build_rag_chain_with_history(llm_generation, llm_contextualize):
    """Tạo RAG chain mới tích hợp Contextualization và History."""
    # PROMPT ĐƯỢC CHỈNH SỬA ĐỂ BAO GỒM LỊCH SỬ HỘI THOẠI
    template = """
Bạn là trợ lý tư vấn và hỗ trợ khách hàng cho một nhà sách online.
Bạn được cung cấp thông tin liên quan trong phần CONTEXT TÀI LIỆU VÀ LỊCH SỬ HỘI THOẠI.

---------------------- LỊCH SỬ HỘI THOẠI ----------------------
{history_str}
-------------------------------------------------------------

---------------------- CONTEXT TÀI LIỆU ----------------------
{context}
--------------------------------------------------------------

Câu hỏi / yêu cầu của khách: {question}

YÊU CẦU TRẢ LỜI:
- Dựa CHỦ YẾU vào thông tin trong CONTEXT TÀI LIỆU VÀ LỊCH SỬ HỘI THOẠI.
- **Đặc biệt: Nếu câu hỏi liên quan đến thông tin cá nhân (tên, sở thích,...) đã được nhắc trong LỊCH SỬ HỘI THOẠI, hãy sử dụng thông tin đó để trả lời.**
- **Nếu khách hỏi về sách/gợi ý sách:**
    + Hãy chọn 3–5 quyển phù hợp nhất từ CONTEXT TÀI LIỆU (nếu có).
    + Mỗi sách ghi rõ: tên, tác giả, thể loại chính, giá (xấp xỉ), đối tượng phù hợp.
- **Nếu khách hỏi về Chính sách/FAQ:**
    + Tóm tắt và trả lời dựa trên nội dung trong CONTEXT TÀI LIỆU.
- Nếu CONTEXT TÀI LIỆU không chứa thông tin phù hợp và câu hỏi không liên quan đến lịch sử chat:
    + Hãy nói rõ là bạn chưa có dữ liệu trong hệ thống hiện tại.
    + Gợi ý khách dùng tính năng tìm kiếm hoặc liên hệ CSKH.

Luôn trả lời bằng TIẾNG VIỆT, giọng thân thiện, rõ ràng.
"""
    prompt = ChatPromptTemplate.from_template(template)
    
    # # Bước 1: Contextualize Question
    # contextualize_step = RunnablePassthrough.assign(
    #     question_standalone=lambda x: get_contextualized_question(
    #         llm_contextualize, x['history'], x['question']
    #     )
    # )

    # # Bước 2: Retrieval và Generation (TRUYỀN THÊM LỊCH SỬ HỘI THOẠI)
    # rag_chain = (
    #     contextualize_step
    #     | {
    #         "context": lambda x: retriever.invoke(x["question_standalone"]), # Dùng standalone question để tìm kiếm tài liệu
    #         "question": lambda x: x["question"],
    #         #Format lịch sử chat và truyền vào Prompt
    #         "history_str": lambda x: format_history_to_string(x["history"]),
    #     }
    #     | prompt
    #     | llm_generation
    #     | StrOutputParser()
    # )
    # return rag_chain

    # Tạo một hàm phụ để vừa lấy câu hỏi, vừa in ra màn hình console
    def get_and_print_standalone(x):
        standalone = get_contextualized_question(
            llm_contextualize, x['history'], x['question']
        )
        # IN RA CONSOLE ĐỂ KIỂM TRA
        print(f"\n" + "="*50)
        print(f"🔍 [DEBUG] CÂU HỎI GỐC: {x['question']}")
        print(f"🤖 [DEBUG] CÂU HỎI ĐỘC LẬP: {standalone}")
        print("="*50 + "\n")
        return standalone

    # Bước 1: Contextualize Question (Cập nhật lại để dùng hàm in trên)
    contextualize_step = RunnablePassthrough.assign(
        question_standalone=lambda x: get_and_print_standalone(x)
    )

    # Bước 2: Retrieval và Generation
    rag_chain = (
        contextualize_step
        | {
            "context": lambda x: retriever.invoke(x["question_standalone"]),
            "question": lambda x: x["question"],
            "history_str": lambda x: format_history_to_string(x["history"]),
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
    global vectorstore, retriever
    
    async with INGEST_LOCK:
        print("Bắt đầu quá trình Ingest...")
        start_time = time.time()
        
        try:
            # GIẢI PHÓNG BIẾN TOÀN CỤC TRƯỚC KHI INGEST
            vectorstore = None
            retriever = None
            gc.collect() 
            await asyncio.sleep(1) 

            # Thực hiện ingest ở luồng riêng
            new_vectorstore = await asyncio.to_thread(run_ingestion)
            
            if new_vectorstore:
                vectorstore = new_vectorstore
                retriever = vectorstore.as_retriever(search_kwargs={"k": 8})
                return IngestResponse(status="success", message="Đã xóa cũ và nạp mới thành công.", time_taken=time.time()-start_time)
            
        except Exception as e:
            logger.error(f"Lỗi Ingest: {e}")
            # Nếu lỗi, cố gắng load lại bản cũ để chatbot không chết
            load_vectorstore_and_retriever()
            raise HTTPException(status_code=500, detail=str(e))


# ---------- /recommend: Vector search đơn giản VÀ LỌC THEO ĐIỂM ----------

@app.post("/chatbot/recommend", response_model=RecommendResponse, tags=["Book Search"])
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



# ---------- /chat: RAG + Gemini LLM (CÓ lịch sử chat và BẮT LỖI QUOTA) ----------
@app.post("/chatbot/chat", response_model=ChatResponse, tags=["Chatbot"])
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

# sanitize filename helper
def secure_filename(name: str) -> str:
    name = Path(name).name
    import re
    return re.sub(r'[^A-Za-z0-9_.-]', '_', name)


@app.post("/chatbot/upload_file", response_model=IngestResponse, tags=["Admin"])
async def upload_document(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None
):
    # Logic giữ nguyên nhưng sanitize filename và chạy ingest nền
    allowed_extensions = ['.txt', '.pdf', '.md']
    file_ext = Path(file.filename).suffix.lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail=f"Chỉ chấp nhận các file có định dạng: {', '.join(allowed_extensions)}"
        )
    
    # Use safe filename 
    FILE_DATA_DIR.mkdir(parents=True, exist_ok=True)
    safe_name = secure_filename(file.filename)
    upload_path = Path(FILE_DATA_DIR) / safe_name
    
    try:
        with upload_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        print(f"Đã lưu file: {upload_path}")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi lưu file: {e}")

    # Chạy ingest ngay lập tức 
    # return await reload_retriever_from_ingest()


# ---------- API: LIST POLICIES (Admin) ----------
@app.get("/chatbot/policies", tags=["Admin"])
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


# ---------- NEW: GET POLICY CONTENT (Admin) ----------
class PolicyContentRequest(BaseModel):
    filename: str

class PolicyContentResponse(BaseModel):
    filename: str
    content: str
    truncated: bool = False

@app.post("/chatbot/policy_content", response_model=PolicyContentResponse, tags=["Admin"])
async def get_policy_content(req: PolicyContentRequest):
    """
    Trả về nội dung file (text or pdf). Nếu file lớn, trả truncated với truncated=True.
    """
    fname = req.filename
    safe = Path(FILE_DATA_DIR) / Path(fname).name
    if not safe.exists() or not safe.is_file():
        raise HTTPException(status_code=404, detail="File không tồn tại.")

    ext = safe.suffix.lower()
    try:
        if ext in [".txt", ".md"]:
            loader = TextLoader(str(safe))
            docs = loader.load()
            text = "\n\n".join([d.page_content for d in docs])
        elif ext == ".pdf":
            loader = PyPDFLoader(str(safe))
            docs = loader.load()
            text = "\n\n".join([d.page_content for d in docs])
        else:
            # không hỗ trợ preview cho loại khác
            raise HTTPException(status_code=400, detail="Loại file không hỗ trợ preview.")
    except Exception as e:
        logger.exception("Lỗi khi đọc file: %s", e)
        raise HTTPException(status_code=500, detail=f"Lỗi khi đọc file: {e}")

    # Giới hạn trả về (ví dụ 20000 ký tự) để tránh trả payload quá lớn
    MAX_CHARS = 20000
    truncated = len(text) > MAX_CHARS
    if truncated:
        text = text[:MAX_CHARS] + "\n\n...[Nội dung bị rút gọn]"
    return PolicyContentResponse(filename=safe.name, content=text, truncated=truncated)


# ---------- NEW: DELETE POLICY FILE (Admin) ----------
class PolicyDeleteRequest(BaseModel):
    filename: str

@app.post("/chatbot/delete_file", response_model=IngestResponse, tags=["Admin"])
async def delete_policy(req: PolicyDeleteRequest, background_tasks: BackgroundTasks = None):
    fname = req.filename
    safe = Path(FILE_DATA_DIR) / Path(fname).name
    if not safe.exists() or not safe.is_file():
        raise HTTPException(status_code=404, detail="File không tồn tại.")

    try:
        safe.unlink()
        print(f"Đã xóa file: {safe}")
    except Exception as e:
        logger.exception("Lỗi khi xóa file: %s", e)
        raise HTTPException(status_code=500, detail=f"Lỗi khi xóa file: {e}")

    # Chạy ingest ngay lập tức để cập nhật vectorstore
    # return await reload_retriever_from_ingest()


# ---------- ADMIN: TRIGGER INGEST (nền) ----------
@app.post("/chatbot/ingest", response_model=IngestResponse, tags=["Admin"])
async def reload_data(background_tasks: BackgroundTasks):
    # chạy nền để tránh timeout client
    background_tasks.add_task(reload_retriever_from_ingest)
    return IngestResponse(status="accepted", message="Ingest đã được phóng vào nền.", time_taken=0.0)