# import os
# import logging
# from typing import List

# from fastapi import FastAPI, HTTPException, Query
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# from dotenv import load_dotenv

# from .db import get_mysql_engine
# from .cbf import CBFModel

# # ---------- Logging ----------
# logging.basicConfig(level=logging.INFO)
# log = logging.getLogger(__name__)

# # ---------- App & CORS ----------
# load_dotenv()
# app = FastAPI(title="BookWebAI CBF API (no-centering)", version="2.0")

# ALLOWED_ORIGINS = os.getenv(
#     "ALLOWED_ORIGINS",
#     "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173"
# ).split(",")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[o.strip() for o in ALLOWED_ORIGINS if o.strip()],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # ---------- Init model ----------
# engine = get_mysql_engine()
# DB_USER  = os.getenv("DB_USER", "bookweb_user")
# DB_BOOK  = os.getenv("DB_BOOK", "bookweb_book")
# DB_ORDER = os.getenv("DB_ORDER", "bookweb_order")

# cbf = CBFModel(engine, DB_USER, DB_BOOK, DB_ORDER)
# cbf.reload_all()

# # ---------- Schemas ----------
# class ScoredItem(BaseModel):
#     book_id: int
#     score: float

# # ---------- Endpoints ----------
# @app.get("/health")
# def health():
#     return {
#         "status": "ok",
#         "books": len(cbf.book_vectors),
#         "vocab": {
#             "authors": len(cbf.author2idx),
#             "categories": len(cbf.cate2idx),
#             "publishers": len(cbf.pub2idx),
#         },
#         "weights": {
#             "author": cbf.l_author,
#             "category": cbf.l_cate,
#             "publisher": cbf.l_pub,
#         }
#     }

# @app.post("/cbf/reload")
# def reload():
#     """Nạp lại vocab + vectors khi có thay đổi dữ liệu (không cần restart)."""
#     try:
#         cbf.reload_all()
#         return {"status": "reloaded", "books": len(cbf.book_vectors)}
#     except Exception as e:
#         log.exception("Error in /cbf/reload")
#         raise HTTPException(status_code=500, detail=str(e))

# @app.get("/cbf/recommend", response_model=List[ScoredItem])
# def recommend(
#     user_id: str = Query(..., description="UID trong bảng reviews/favorites"),
#     top_k: int = Query(12, ge=1, le=100),
#     exclude_interacted: bool = Query(True, description="Loại sách đã review/favorite")
# ):
#     """
#     Trả danh sách [{book_id, score}] với score là cosine(p̂, v_i).
#     - p̂ được xây từ review(1..5) + favorite(=5).
#     - Loại các sách user đã tương tác nếu exclude_interacted=True.
#     """
#     try:
#         rows = cbf.recommend_for_user(user_id, top_k, exclude_interacted)
#         return [ScoredItem(book_id=b, score=float(s)) for b, s in rows]
#     except Exception as e:
#         log.exception("Error in /cbf/recommend")
#         raise HTTPException(status_code=500, detail=str(e))

# @app.get("/cbf/similar")
# def similar(
#     book_id: int = Query(...),
#     top_k: int = Query(12, ge=1, le=100)
# ):
#     """Gợi ý sách tương tự theo cosine trên vector nội dung."""
#     try:
#         base_title = cbf.book_meta.get(book_id, {}).get("title")
#         v0 = cbf.book_vectors.get(book_id)
#         if v0 is None:
#             raise HTTPException(status_code=404, detail="book_id not found")

#         out = []
#         for bid, v in cbf.book_vectors.items():
#             if bid == book_id: 
#                 continue
#             sc = cbf._cosine(v0, v)
#             out.append((bid, float(sc)))
#         out.sort(key=lambda x: x[1], reverse=True)
#         out = out[:top_k]

#         # trả breakdown để debug/giải thích
#         return {
#             "base": {"book_id": book_id, "title": base_title, "breakdown": cbf.item_breakdown(book_id)},
#             "similar": [
#                 {
#                     "book_id": b,
#                     "title": cbf.book_meta.get(b, {}).get("title"),
#                     "score": s,
#                     "breakdown": cbf.item_breakdown(b)
#                 } for b, s in out
#             ]
#         }
#     except HTTPException:
#         raise
#     except Exception as e:
#         log.exception("Error in /cbf/similar")
#         raise HTTPException(status_code=500, detail=str(e))







import os
import logging
from typing import List

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from .db import get_mysql_engine
from .cbf import CBFModel

# ---------- Logging ----------
logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

# ---------- App & CORS ----------
load_dotenv()
app = FastAPI(title="BookWebAI CBF API (blockwise cosine, L1 user)", version="3.0")

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in ALLOWED_ORIGINS if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Init model ----------
engine = get_mysql_engine()
DB_USER  = os.getenv("DB_USER", "bookweb_user")
DB_BOOK  = os.getenv("DB_BOOK", "bookweb_book")
DB_ORDER = os.getenv("DB_ORDER", "bookweb_order")

cbf = CBFModel(engine, DB_USER, DB_BOOK, DB_ORDER)
cbf.reload_all()

# ---------- Schemas ----------
class ScoredItem(BaseModel):
    book_id: int
    score: float

# ---------- Endpoints ----------
@app.get("/health")
def health():
    return {
        "status": "ok",
        "books": len(cbf.book_ids),
        "vocab": {
            "authors": len(cbf.author2idx),
            "categories": len(cbf.cate2idx),
            "publishers": len(cbf.pub2idx),
        },
        # trường weights giữ lại cho tương thích (không dùng)
        "weights": {"author": cbf.l_author, "category": cbf.l_cate, "publisher": cbf.l_pub},
        "mode": "blockwise-cosine-no-weights-L1-user"
    }

@app.post("/cbf/reload")
def reload():
    """Nạp lại vocab + item matrices khi dữ liệu thay đổi (không cần restart)."""
    try:
        cbf.reload_all()
        return {
            "status": "reloaded",
            "books": len(cbf.book_ids),
            "vocab": {
                "authors": len(cbf.author2idx),
                "categories": len(cbf.cate2idx),
                "publishers": len(cbf.pub2idx),
            },
        }
    except Exception as e:
        log.exception("Error in /cbf/reload")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/cbf/recommend", response_model=List[ScoredItem])
def recommend(
    user_id: str = Query(..., description="UID trong bảng reviews/favorites"),
    top_k: int = Query(12, ge=1, le=100),
    exclude_interacted: bool = Query(True, description="Loại sách đã review/favorite")
):
    """
    Trả danh sách [{book_id, score}] với score là trung bình 3 cosine (A/C/P).
    - User profile L1-normalized theo từng khối, xây từ review(1..5) + favorite(=5).
    - Loại sách đã tương tác nếu exclude_interacted=True.
    """
    try:
        rows = cbf.recommend_for_user(user_id, top_k, exclude_interacted)
        return [ScoredItem(book_id=b, score=float(s)) for b, s in rows]
    except Exception as e:
        log.exception("Error in /cbf/recommend")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/cbf/similar")
def similar(
    book_id: int = Query(...),
    top_k: int = Query(12, ge=1, le=100)
):
    """
    Gợi ý sách tương tự: trung bình 3 cosine giữa item (A/C/P) và các item khác.
    Đồng thời trả kèm breakdown thuộc tính để giải thích.
    """
    try:
        row_base = cbf.bookid2row.get(book_id)
        if row_base is None:
            raise HTTPException(status_code=404, detail="book_id not found")

        base_title = cbf.book_meta.get(book_id, {}).get("title")
        sims = cbf.similar_items(book_id, top_k)

        return {
            "base": {
                "book_id": book_id,
                "title": base_title,
                "breakdown": cbf.item_breakdown(book_id)
            },
            "similar": [
                {
                    "book_id": b,
                    "title": cbf.book_meta.get(b, {}).get("title"),
                    "score": float(s),
                    "breakdown": cbf.item_breakdown(b)
                }
                for (b, s) in sims
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        log.exception("Error in /cbf/similar")
        raise HTTPException(status_code=500, detail=str(e))