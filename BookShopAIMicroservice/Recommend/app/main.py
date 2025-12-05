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
# app = FastAPI(title="BookWebAI CBF API (blockwise cosine, L1 user)", version="3.0")

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
#         "books": len(cbf.book_ids),
#         "vocab": {
#             "authors": len(cbf.author2idx),
#             "categories": len(cbf.cate2idx),
#             "publishers": len(cbf.pub2idx),
#         },
#         # trường weights giữ lại cho tương thích (không dùng)
#         "weights": {"author": cbf.l_author, "category": cbf.l_cate, "publisher": cbf.l_pub},
#         "mode": "blockwise-cosine-no-weights-L1-user"
#     }

# @app.post("/cbf/reload")
# def reload():
#     """Nạp lại vocab + item matrices khi dữ liệu thay đổi (không cần restart)."""
#     try:
#         cbf.reload_all()
#         return {
#             "status": "reloaded",
#             "books": len(cbf.book_ids),
#             "vocab": {
#                 "authors": len(cbf.author2idx),
#                 "categories": len(cbf.cate2idx),
#                 "publishers": len(cbf.pub2idx),
#             },
#         }
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
#     Trả danh sách [{book_id, score}] với score là trung bình 3 cosine (A/C/P).
#     - User profile L1-normalized theo từng khối, xây từ review(1..5) + favorite(=5).
#     - Loại sách đã tương tác nếu exclude_interacted=True.
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
#     """
#     Gợi ý sách tương tự: trung bình 3 cosine giữa item (A/C/P) và các item khác.
#     Đồng thời trả kèm breakdown thuộc tính để giải thích.
#     """
#     try:
#         row_base = cbf.bookid2row.get(book_id)
#         if row_base is None:
#             raise HTTPException(status_code=404, detail="book_id not found")

#         base_title = cbf.book_meta.get(book_id, {}).get("title")
#         sims = cbf.similar_items(book_id, top_k)

#         return {
#             "base": {
#                 "book_id": book_id,
#                 "title": base_title,
#                 "breakdown": cbf.item_breakdown(book_id)
#             },
#             "similar": [
#                 {
#                     "book_id": b,
#                     "title": cbf.book_meta.get(b, {}).get("title"),
#                     "score": float(s),
#                     "breakdown": cbf.item_breakdown(b)
#                 }
#                 for (b, s) in sims
#             ]
#         }
#     except HTTPException:
#         raise
#     except Exception as e:
#         log.exception("Error in /cbf/similar")
#         raise HTTPException(status_code=500, detail=str(e))
    











import os
import logging
from typing import List, Optional

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
app = FastAPI(title="BookWebAI CBF API (one-block cosine, L1 user)", version="4.0")

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
        # giữ trường weights cho tương thích (không dùng)
        "weights": {"author": cbf.l_author, "category": cbf.l_cate, "publisher": cbf.l_pub},
        "mode": "one-block-cosine-L1-user"
    }

# @app.post("/cbf/reload")
# def reload():
#     """Nạp lại vocab + ma trận X khi dữ liệu thay đổi (không cần restart)."""
#     try:
#         cbf.reload_all()
#         return {
#             "status": "reloaded",
#             "books": len(cbf.book_ids),
#             "vocab": {
#                 "authors": len(cbf.author2idx),
#                 "categories": len(cbf.cate2idx),
#                 "publishers": len(cbf.pub2idx),
#             },
#         }
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
#     Trả danh sách [{book_id, score}] với score = cosine(U, X[i]).
#     - U: hồ sơ one-block L1 từ review(1..5) + favorite(=5).
#     - Có thể loại sách đã tương tác.
#     """
#     try:
#         rows = cbf.recommend_for_user(user_id, top_k, exclude_interacted)
#         return [ScoredItem(book_id=b, score=float(s)) for b, s in rows]
#     except Exception as e:
#         log.exception("Error in /cbf/recommend")
#         raise HTTPException(status_code=500, detail=str(e))


@app.post("/cbf/reload")
def reload(
    export_csv: bool = Query(False, description="Xuất CSV ma trận nhị phân thuộc tính sách"),
    out_dir: str = Query("./exports", description="Thư mục ghi CSV")
):
    """Nạp lại vocab + item matrices khi dữ liệu thay đổi (không cần restart)."""
    try:
        cbf.reload_all()
        payload = {
            "status": "reloaded",
            "books": len(cbf.book_ids),
            "vocab": {
                "authors": len(cbf.author2idx),
                "categories": len(cbf.cate2idx),
                "publishers": len(cbf.pub2idx),
            },
        }
        if export_csv:
            try:
                files = cbf.export_item_features_csv(out_dir)
                payload["csv"] = files
            except Exception as e:
                payload["csv_error"] = str(e)
        return payload
    except Exception as e:
        log.exception("Error in /cbf/reload")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/cbf/recommend", response_model=List[ScoredItem])
def recommend(
    user_id: str = Query(..., description="UID trong bảng reviews/favorites"),
    top_k: int = Query(12, ge=1, le=100),
    exclude_interacted: bool = Query(True, description="Loại sách đã review/favorite"),
    export_csv: bool = Query(False, description="Xuất CSV interactions/profile/scores cho user"),
    out_dir: str = Query("./exports", description="Thư mục ghi CSV")
):
    """
    Trả danh sách [{book_id, score}] với score là trung bình 3 cosine (A/C/P).
    Đồng thời (tuỳ chọn) xuất CSV:
      - interactions_user_*.csv: vector tương tác 0..5 với tất cả sách
      - user_profile_features_*.csv: hồ sơ user theo từng feature (A|C|P)
      - recommend_scores_*.csv: điểm gợi ý cho TẤT CẢ sách
    """
    try:
        rows = cbf.recommend_for_user(user_id, top_k, exclude_interacted)
        result = [ScoredItem(book_id=b, score=float(s)) for b, s in rows]

        if export_csv:
            try:
                files = cbf.export_user_csvs(out_dir, user_id)
                # nhét đường dẫn file vào header trả về (không phá response_model)
                # hoặc trả kèm dưới dạng header X-CSV-* nếu bạn muốn.
                # Ở đây mình trả thêm field động:
                return result  # FastAPI sẽ bỏ fields ngoài schema; nên ta log ở server
            except Exception as e:
                log.warning("Export CSV failed: %s", e)

        return result
    except Exception as e:
        log.exception("Error in /cbf/recommend")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/cbf/similar")
def similar(
    book_id: int = Query(...),
    top_k: int = Query(12, ge=1, le=100)
):
    """
    Gợi ý sách tương tự bằng cosine giữa các hàng trong X (one-block).
    Đồng thời trả breakdown thuộc tính để giải thích.
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
