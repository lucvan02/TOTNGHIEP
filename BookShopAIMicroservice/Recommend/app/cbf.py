# import os
# import numpy as np
# import logging
# import math
# from typing import Dict, List, Tuple, Set, Optional
# from sqlalchemy.engine import Engine
# from .db import fetch_all

# log = logging.getLogger(__name__)


# class CBFModel:
#     """
#     Content-Based Filtering (blockwise cosine, no lambda weights):
#     - Item vectors tách 3 khối:
#         A_items (books x #authors)  multi-hot (0/1)
#         C_items (books x #categories) multi-hot (0/1)
#         P_items (books x #publishers) one-hot (0/1)
#       -> KHÔNG chia 1/k, KHÔNG áp dụng sqrt(lambda).
#     - Interactions:
#         + review: điểm 1..5 (lấy review mới nhất theo created_at, id)
#         + favorite: 5 điểm
#       Nếu cùng sách có cả review và favorite -> lấy max (tức là 5).
#     - User profile từng khối (thô): U_raw_block = sum(score * item_block_row)
#       Sau đó CHUẨN HOÁ THEO TỔNG (L1): U_block = U_raw_block / sum(U_raw_block) (nếu tổng=0 giữ nguyên 0).
#     - Scoring:
#         cos_A = cosine(U_A, A_items[i])
#         cos_C = cosine(U_C, C_items[i])
#         cos_P = cosine(U_P, P_items[i])
#         score = (cos_A + cos_C + cos_P) / 3
#     - Loại item user đã tương tác (review/favorite) khi recommend.
#     """

#     def __init__(self, engine: Engine, db_user: str, db_book: str, db_order: str):
#         self.engine = engine
#         self.db_user = db_user
#         self.db_book = db_book
#         self.db_order = db_order

#         # vocab maps
#         self.author2idx: Dict[int, int] = {}
#         self.cate2idx: Dict[int, int] = {}
#         self.pub2idx: Dict[int, int] = {}
#         self.idx2author: Dict[int, str] = {}
#         self.idx2cate: Dict[int, str] = {}
#         self.idx2pub: Dict[int, str] = {}

#         # book list & meta
#         self.book_ids: List[int] = []
#         self.bookid2row: Dict[int, int] = {}
#         self.book_meta: Dict[int, dict] = {}

#         # item matrices (numpy)
#         self.A_items: Optional[np.ndarray] = None  # (n_books, n_authors)
#         self.C_items: Optional[np.ndarray] = None  # (n_books, n_categories)
#         self.P_items: Optional[np.ndarray] = None  # (n_books, n_publishers)

#         # giữ cho /health tương thích (không dùng đến)
#         self.l_author = 0.0
#         self.l_cate = 0.0
#         self.l_pub = 0.0

#     # ---------- Utils ----------
#     @staticmethod
#     def _cosine(a: np.ndarray, b: np.ndarray) -> float:
#         na = np.linalg.norm(a)
#         nb = np.linalg.norm(b)
#         if na == 0.0 or nb == 0.0:
#             return 0.0
#         return float(a.dot(b) / (na * nb))

#     @staticmethod
#     def _l1_normalize(v: np.ndarray) -> np.ndarray:
#         s = v.sum()
#         if s > 0:
#             return v / s
#         return v

#     # ---------- Load vocabs & item matrices ----------
#     def load_vocabs(self):
#         a = fetch_all(self.engine, f"SELECT id, name FROM {self.db_book}.authors")
#         c = fetch_all(self.engine, f"SELECT id, name FROM {self.db_book}.categories")
#         p = fetch_all(self.engine, f"SELECT id, name FROM {self.db_book}.publishers")

#         self.author2idx = {row["id"]: i for i, row in enumerate(a)}
#         self.cate2idx = {row["id"]: i for i, row in enumerate(c)}
#         self.pub2idx = {row["id"]: i for i, row in enumerate(p)}

#         self.idx2author = {i: row["name"] for i, row in enumerate(a)}
#         self.idx2cate = {i: row["name"] for i, row in enumerate(c)}
#         self.idx2pub = {i: row["name"] for i, row in enumerate(p)}

#         log.info(
#             "Loaded vocab: authors=%d, categories=%d, publishers=%d",
#             len(self.author2idx), len(self.cate2idx), len(self.pub2idx)
#         )

#     def load_item_matrices(self):
#         """Tạo 3 ma trận nhị phân A_items, C_items, P_items; lưu book_ids, meta, index map."""
#         from collections import defaultdict

#         ab = fetch_all(self.engine, f"SELECT book_id, author_id FROM {self.db_book}.author_book")
#         bc = fetch_all(self.engine, f"SELECT book_id, category_id FROM {self.db_book}.book_category")
#         bp = fetch_all(self.engine, f"SELECT id AS book_id, publisher_id, title FROM {self.db_book}.books")

#         # danh sách sách + meta
#         self.book_ids = [r["book_id"] for r in bp]
#         self.bookid2row = {bid: i for i, bid in enumerate(self.book_ids)}
#         self.book_meta = {r["book_id"]: {"title": r["title"]} for r in bp}

#         n_books = len(self.book_ids)
#         na, nc, npub = len(self.author2idx), len(self.cate2idx), len(self.pub2idx)
#         A = np.zeros((n_books, na), dtype=float)
#         C = np.zeros((n_books, nc), dtype=float)
#         P = np.zeros((n_books, npub), dtype=float)

#         # authors multi-hot
#         for r in ab:
#             bid = r["book_id"]
#             ai_raw = r["author_id"]
#             if ai_raw in self.author2idx and bid in self.bookid2row:
#                 A[self.bookid2row[bid], self.author2idx[ai_raw]] = 1.0

#         # categories multi-hot
#         for r in bc:
#             bid = r["book_id"]
#             ci_raw = r["category_id"]
#             if ci_raw in self.cate2idx and bid in self.bookid2row:
#                 C[self.bookid2row[bid], self.cate2idx[ci_raw]] = 1.0

#         # publishers one-hot
#         for r in bp:
#             bid = r["book_id"]
#             pj_raw = r["publisher_id"]
#             if pj_raw in self.pub2idx and bid in self.bookid2row:
#                 P[self.bookid2row[bid], self.pub2idx[pj_raw]] = 1.0

#         self.A_items, self.C_items, self.P_items = A, C, P
#         log.info(
#             "Built item matrices: A=%s, C=%s, P=%s (books=%d)",
#             A.shape, C.shape, P.shape, n_books
#         )

#     # ---------- Interactions (latest review + favorites=5) ----------
#     def get_user_pairs_score15(self, user_id: str) -> Dict[int, float]:
#         """
#         Trả về {book_id: score(1..5)} cho user:
#           - review mới nhất mỗi (user,book)
#           - favorite = 5; nếu đã có review thì lấy max(review, 5)
#         """
#         pairs: Dict[int, float] = {}
#         book_ids_set = set(self.book_ids)

#         # MySQL 8+ window function: review mới nhất theo created_at, id
#         latest_reviews = fetch_all(self.engine, f"""
#             SELECT buyer_id AS uid, book_id, stars AS rating
#             FROM (
#                 SELECT buyer_id, book_id, stars,
#                        ROW_NUMBER() OVER (PARTITION BY buyer_id, book_id
#                                           ORDER BY created_at DESC, id DESC) rn
#                 FROM {self.db_order}.reviews
#                 WHERE buyer_id = :uid
#             ) t
#             WHERE rn = 1
#         """, {"uid": user_id})
#         for r in latest_reviews:
#             bid = r["book_id"]
#             if bid in book_ids_set:
#                 pairs[bid] = float(r["rating"])

#         favs = fetch_all(self.engine, f"""
#             SELECT book_id
#             FROM {self.db_order}.favorites
#             WHERE buyer_id = :uid
#         """, {"uid": user_id})
#         for r in favs:
#             bid = r["book_id"]
#             if bid in book_ids_set:
#                 pairs[bid] = max(pairs.get(bid, 0.0), 5.0)

#         return pairs

#     # ---------- Build user profiles (A_user, C_user, P_user) ----------
#     def _build_user_block_profiles(self, pairs: Dict[int, float]) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
#         """
#         Trả về (A_user, C_user, P_user) dạng L1-normalized (vector 1D cho user).
#         Nếu pairs rỗng -> 3 vector 0.
#         """
#         na, nc, npub = len(self.author2idx), len(self.cate2idx), len(self.pub2idx)
#         uA = np.zeros(na, dtype=float)
#         uC = np.zeros(nc, dtype=float)
#         uP = np.zeros(npub, dtype=float)

#         if not pairs:
#             return uA, uC, uP

#         for bid, score in pairs.items():
#             row = self.bookid2row.get(bid)
#             if row is None:
#                 continue
#             # cộng dồn theo điểm
#             uA += score * self.A_items[row, :]
#             uC += score * self.C_items[row, :]
#             uP += score * self.P_items[row, :]

#         # L1-normalize theo TỪNG KHỐI
#         uA = self._l1_normalize(uA)
#         uC = self._l1_normalize(uC)
#         uP = self._l1_normalize(uP)
#         return uA, uC, uP

#     # ---------- Recommend / Similar ----------
#     def recommend_for_user(self, user_id: str, top_k: int = 12, exclude_interacted: bool = True):
#         """
#         Trả về [(book_id, score)], score = average cosine theo 3 khối (A/C/P).
#         - Hồ sơ người dùng lấy từ review(1..5) + favorite(=5), sau đó L1-normalize từng khối.
#         - Loại các sách user đã tương tác nếu exclude_interacted=True.
#         """
#         if self.A_items is None:
#             # phòng hờ
#             self.load_vocabs()
#             self.load_item_matrices()

#         pairs = self.get_user_pairs_score15(user_id)
#         uA, uC, uP = self._build_user_block_profiles(pairs)

#         interacted_ids: Set[int] = set(pairs.keys()) if exclude_interacted else set()

#         rows: List[Tuple[int, float]] = []
#         for bid in self.book_ids:
#             if bid in interacted_ids:
#                 continue
#             row = self.bookid2row[bid]
#             sA = self._cosine(uA, self.A_items[row, :])
#             sC = self._cosine(uC, self.C_items[row, :])
#             sP = self._cosine(uP, self.P_items[row, :])
#             sc = (sA + sC + sP) / 3.0
#             rows.append((bid, float(sc)))
#         rows.sort(key=lambda x: x[1], reverse=True)
#         return rows[:top_k]

#     def item_breakdown(self, book_id: int) -> Optional[dict]:
#         """Trả về các thuộc tính ON (1.0) cho 1 sách để giải thích."""
#         if self.A_items is None:
#             return None
#         row = self.bookid2row.get(book_id)
#         if row is None:
#             return None
#         # liệt kê tên thuộc tính có giá trị 1
#         authors = [self.idx2author[i] for i in np.where(self.A_items[row, :] != 0)[0]]
#         cates = [self.idx2cate[i] for i in np.where(self.C_items[row, :] != 0)[0]]
#         pubs_idx = np.where(self.P_items[row, :] != 0)[0]
#         pubs = [self.idx2pub[int(pubs_idx[0])]] if pubs_idx.size > 0 else []
#         return {"authors": authors, "categories": cates, "publishers": pubs}

#     def similar_items(self, book_id: int, top_k: int = 12):
#         """
#         Tính tương tự giữa item và các item khác bằng cách
#         trung bình 3 cosine theo từng khối (A/C/P) như recommend.
#         """
#         if self.A_items is None:
#             return []

#         row0 = self.bookid2row.get(book_id)
#         if row0 is None:
#             return []

#         sims: List[Tuple[int, float]] = []
#         for bid in self.book_ids:
#             if bid == book_id:
#                 continue
#             row = self.bookid2row[bid]
#             sA = self._cosine(self.A_items[row0, :], self.A_items[row, :])
#             sC = self._cosine(self.C_items[row0, :], self.C_items[row, :])
#             sP = self._cosine(self.P_items[row0, :], self.P_items[row, :])
#             sc = (sA + sC + sP) / 3.0
#             sims.append((bid, float(sc)))
#         sims.sort(key=lambda x: x[1], reverse=True)
#         return sims[:top_k]

#     # ---------- Maintenance ----------
#     def reload_all(self):
#         """Reload toàn bộ vocab + item matrices (dùng khi thêm sách/thuộc tính)."""
#         self.load_vocabs()
#         self.load_item_matrices()














import numpy as np
import pandas as pd
import os
import logging
from typing import Dict, List, Tuple, Set, Optional
from sqlalchemy.engine import Engine
from .db import fetch_all
import time

log = logging.getLogger(__name__)


class CBFModel:
    """
    Content-Based Filtering (one-block cosine, no weights):
    - Item matrix X (books x (#authors + #categories + #publishers)):
        + authors: multi-hot (0/1)
        + categories: multi-hot (0/1)
        + publishers: one-hot (0/1)
      -> KHÔNG chia 1/k, KHÔNG áp dụng lambda/trọng số.

    - Interactions:
        + review: điểm 1..5 (review mới nhất theo created_at, id)
        + favorite: 5 điểm
      Nếu cùng sách có cả review & favorite -> lấy max.

    - User profile (một khối):
        U_raw = sum(score * X[row_of_book])
        U = U_raw / sum(U_raw)  (L1, nếu tổng=0 thì để nguyên 0)

    - Scoring:
        score = cosine(U, X[i])

    - Khi recommend có thể loại sách đã tương tác.
    """

    def __init__(self, engine: Engine, db_user: str, db_book: str, db_order: str):
        self.engine = engine
        self.db_user = db_user
        self.db_book = db_book
        self.db_order = db_order

        # vocabs
        self.author2idx: Dict[int, int] = {}
        self.cate2idx: Dict[int, int] = {}
        self.pub2idx: Dict[int, int] = {}
        self.idx2author: Dict[int, str] = {}
        self.idx2cate: Dict[int, str] = {}
        self.idx2pub: Dict[int, str] = {}

        # books
        self.book_ids: List[int] = []
        self.bookid2row: Dict[int, int] = {}
        self.book_meta: Dict[int, dict] = {}

        # one-block item matrix & feature offsets
        self.X: Optional[np.ndarray] = None  # shape: (n_books, n_feats)
        self.n_authors = 0
        self.n_categories = 0
        self.n_publishers = 0
        self.offA = 0
        self.offC = 0
        self.offP = 0

        # giữ cho /health tương thích (không dùng)
        self.l_author = 0.0
        self.l_cate = 0.0
        self.l_pub = 0.0

    # ---------- Utils ----------
    @staticmethod
    def _cosine(a: np.ndarray, b: np.ndarray) -> float:
        na = np.linalg.norm(a)
        nb = np.linalg.norm(b)
        if na == 0.0 or nb == 0.0:
            return 0.0
        return float(a.dot(b) / (na * nb))

    @staticmethod
    def _l1_normalize(v: np.ndarray) -> np.ndarray:
        s = v.sum()
        if s > 0:
            return v / s
        return v

    # ---------- Load vocabs ----------
    def load_vocabs(self):
        a = fetch_all(self.engine, f"SELECT id, name FROM {self.db_book}.authors")
        c = fetch_all(self.engine, f"SELECT id, name FROM {self.db_book}.categories")
        p = fetch_all(self.engine, f"SELECT id, name FROM {self.db_book}.publishers")

        self.author2idx = {row["id"]: i for i, row in enumerate(a)}
        self.cate2idx = {row["id"]: i for i, row in enumerate(c)}
        self.pub2idx = {row["id"]: i for i, row in enumerate(p)}

        self.idx2author = {i: row["name"] for i, row in enumerate(a)}
        self.idx2cate = {i: row["name"] for i, row in enumerate(c)}
        self.idx2pub = {i: row["name"] for i, row in enumerate(p)}

        self.n_authors = len(self.author2idx)
        self.n_categories = len(self.cate2idx)
        self.n_publishers = len(self.pub2idx)

        # offsets (A | C | P)
        self.offA = 0
        self.offC = self.offA + self.n_authors
        self.offP = self.offC + self.n_categories

        log.info(
            "Loaded vocab: authors=%d, categories=%d, publishers=%d",
            self.n_authors, self.n_categories, self.n_publishers
        )

    # ---------- Build one-block item matrix X ----------
    def load_item_matrix(self):
        """
        Tạo ma trận X (n_books x (na+nc+np)) nhị phân.
        Lưu book_ids, meta, mapping index.
        """
        ab = fetch_all(self.engine, f"SELECT book_id, author_id FROM {self.db_book}.author_book")
        bc = fetch_all(self.engine, f"SELECT book_id, category_id FROM {self.db_book}.book_category")
        bp = fetch_all(self.engine, f"SELECT id AS book_id, publisher_id, title FROM {self.db_book}.books")

        # books + meta
        self.book_ids = [r["book_id"] for r in bp]
        self.bookid2row = {bid: i for i, bid in enumerate(self.book_ids)}
        self.book_meta = {r["book_id"]: {"title": r["title"]} for r in bp}

        n_books = len(self.book_ids)
        n_feats = self.n_authors + self.n_categories + self.n_publishers
        X = np.zeros((n_books, n_feats), dtype=float)

        # authors multi-hot
        for r in ab:
            bid = r["book_id"]
            ai_raw = r["author_id"]
            if ai_raw in self.author2idx and bid in self.bookid2row:
                X[self.bookid2row[bid], self.offA + self.author2idx[ai_raw]] = 1.0

        # categories multi-hot
        for r in bc:
            bid = r["book_id"]
            ci_raw = r["category_id"]
            if ci_raw in self.cate2idx and bid in self.bookid2row:
                X[self.bookid2row[bid], self.offC + self.cate2idx[ci_raw]] = 1.0

        # publishers one-hot
        for r in bp:
            bid = r["book_id"]
            pj_raw = r["publisher_id"]
            if pj_raw in self.pub2idx and bid in self.bookid2row:
                X[self.bookid2row[bid], self.offP + self.pub2idx[pj_raw]] = 1.0

        self.X = X
        log.info("Built item matrix X=%s (books=%d, feats=%d)", X.shape, n_books, n_feats)

    # ---------- Interactions (latest review + favorites=5) ----------
    def get_user_pairs_score15(self, user_id: str) -> Dict[int, float]:
        """
        Trả {book_id: score(1..5)} cho user:
          - review mới nhất mỗi (user,book)
          - favorite = 5; nếu đã có review thì lấy max(review, 5)
        """
        pairs: Dict[int, float] = {}
        book_ids_set = set(self.book_ids)

        latest_reviews = fetch_all(self.engine, f"""
            SELECT buyer_id AS uid, book_id, stars AS rating
            FROM (
                SELECT buyer_id, book_id, stars,
                       ROW_NUMBER() OVER (PARTITION BY buyer_id, book_id
                                          ORDER BY created_at DESC, id DESC) rn
                FROM {self.db_order}.reviews
                WHERE buyer_id = :uid
            ) t
            WHERE rn = 1
        """, {"uid": user_id})
        for r in latest_reviews:
            bid = r["book_id"]
            if bid in book_ids_set:
                pairs[bid] = float(r["rating"])

        favs = fetch_all(self.engine, f"""
            SELECT book_id
            FROM {self.db_order}.favorites
            WHERE buyer_id = :uid
        """, {"uid": user_id})
        for r in favs:
            bid = r["book_id"]
            if bid in book_ids_set:
                pairs[bid] = max(pairs.get(bid, 0.0), 5.0)

        return pairs

    # ---------- User profile (one block) ----------
    def _build_user_profile(self, pairs: Dict[int, float]) -> np.ndarray:
        """
        Trả U (1D) dạng L1-normalized. Nếu rỗng -> vector 0.
        """
        if self.X is None:
            return np.zeros(0, dtype=float)

        n_feats = self.X.shape[1]
        U_raw = np.zeros(n_feats, dtype=float)

        if not pairs:
            return U_raw  # all zeros

        for bid, score in pairs.items():
            row = self.bookid2row.get(bid)
            if row is None:
                continue
            U_raw += score * self.X[row, :]

        U = self._l1_normalize(U_raw)
        return U

    # ---------- Recommend / Similar ----------
    def recommend_for_user(self, user_id: str, top_k: int = 12, exclude_interacted: bool = True):
        """
        Trả [(book_id, score)], score = cosine(U, X[i]) với U là hồ sơ one-block L1.
        """
        if self.X is None:
            # phòng hờ
            self.load_vocabs()
            self.load_item_matrix()

        pairs = self.get_user_pairs_score15(user_id)
        U = self._build_user_profile(pairs)

        interacted_ids: Set[int] = set(pairs.keys()) if exclude_interacted else set()

        rows: List[Tuple[int, float]] = []
        for bid in self.book_ids:
            if bid in interacted_ids:
                continue
            row = self.bookid2row[bid]
            sc = self._cosine(U, self.X[row, :])
            rows.append((bid, float(sc)))
        rows.sort(key=lambda x: x[1], reverse=True)
        return rows[:top_k]

    def item_breakdown(self, book_id: int) -> Optional[dict]:
        """
        Liệt kê các thuộc tính =1 cho 1 sách (authors/categories/publishers) để giải thích.
        """
        if self.X is None:
            return None
        row = self.bookid2row.get(book_id)
        if row is None:
            return None

        on_idx = np.where(self.X[row, :] != 0)[0]
        authors, cates, pubs = [], [], []
        for j in on_idx:
            if j < self.offC:
                # author
                ai = j - self.offA
                authors.append(self.idx2author.get(int(ai)))
            elif j < self.offP:
                # category
                ci = j - self.offC
                cates.append(self.idx2cate.get(int(ci)))
            else:
                # publisher
                pi = j - self.offP
                pubs.append(self.idx2pub.get(int(pi)))

        return {"authors": [x for x in authors if x],
                "categories": [x for x in cates if x],
                "publishers": [x for x in pubs if x]}

    def similar_items(self, book_id: int, top_k: int = 12):
        """
        Tương tự item-item = cosine giữa 2 hàng X (one-block).
        """
        if self.X is None:
            return []

        row0 = self.bookid2row.get(book_id)
        if row0 is None:
            return []

        base = self.X[row0, :]
        sims: List[Tuple[int, float]] = []
        for bid in self.book_ids:
            if bid == book_id:
                continue
            row = self.bookid2row[bid]
            sc = self._cosine(base, self.X[row, :])
            sims.append((bid, float(sc)))
        sims.sort(key=lambda x: x[1], reverse=True)
        return sims[:top_k]

    # ---------- Maintenance ----------
    def reload_all(self):
        """Reload vocabs + item matrix X (dùng khi thêm sách/thuộc tính)."""
        self.load_vocabs()
        self.load_item_matrix()









#xuat ma tran lưu vao csv để phân tích và test
# ==========================================
# Xuất ma trận/CSV để phân tích & test (one-block)
# ==========================================

    def _ensure_items_loaded(self):
        """Đảm bảo X và danh mục đã sẵn sàng."""
        if self.X is None or not self.book_ids:
            self.reload_all()

    def _feature_names(self):
        """Tên cột theo thứ tự one-block: [A ...][C ...][P ...]."""
        A_cols = [f"A:{self.idx2author[i]}" for i in range(len(self.idx2author))]
        C_cols = [f"C:{self.idx2cate[i]}"   for i in range(len(self.idx2cate))]
        P_cols = [f"P:{self.idx2pub[i]}"    for i in range(len(self.idx2pub))]
        return A_cols, C_cols, P_cols, (A_cols + C_cols + P_cols)

    def df_item_feature(self) -> pd.DataFrame:
        """Ma trận nhị phân thuộc tính sách (one-block X, gộp A|C|P)."""
        self._ensure_items_loaded()
        A_cols, C_cols, P_cols, ALL = self._feature_names()
        # X shape: (n_books, n_feats)
        idx = [f"{bid}:{self.book_meta[bid]['title']}" for bid in self.book_ids]
        df = pd.DataFrame(self.X.astype(int), index=idx, columns=ALL)
        return df

    # ===== Artifacts theo user để test =====
    def _interactions_vector(self, user_id: str) -> pd.Series:
        """Một hàng (tất cả sách) với điểm tương tác 0..5 của user."""
        self._ensure_items_loaded()
        pairs = self.get_user_pairs_score15(user_id)
        scores_per_book = {bid: 0.0 for bid in self.book_ids}
        for bid, s in pairs.items():
            if bid in scores_per_book:
                scores_per_book[bid] = float(s)
        idx = [f"{bid}:{self.book_meta[bid]['title']}" for bid in self.book_ids]
        return pd.Series([scores_per_book[bid] for bid in self.book_ids], index=idx, name=f"user={user_id}")

    def _user_profile_series(self, user_id: str) -> pd.Series:
        """
        Hồ sơ người dùng theo từng thuộc tính (one-block, đã L1-normalize).
        KHÔNG còn tách khối A/C/P.
        """
        self._ensure_items_loaded()
        pairs = self.get_user_pairs_score15(user_id)
        U = self._build_user_profile(pairs)  # shape = (n_feats,)
        _, _, _, ALL = self._feature_names()
        return pd.Series(U, index=ALL, name=f"user={user_id}")

    def _score_all_books(self, user_id: str) -> pd.Series:
        """Điểm gợi ý cho TẤT CẢ sách theo cosine(U, X[i])."""
        self._ensure_items_loaded()
        pairs = self.get_user_pairs_score15(user_id)
        U = self._build_user_profile(pairs)

        rows = []
        for bid in self.book_ids:
            row = self.bookid2row[bid]
            sc = self._cosine(U, self.X[row, :])
            rows.append((bid, float(sc)))

        rows.sort(key=lambda x: x[0])  # ổn định theo book_id
        idx = [f"{bid}:{self.book_meta[bid]['title']}" for (bid, _) in rows]
        vals = [s for (_, s) in rows]
        return pd.Series(vals, index=idx, name=f"user={user_id}")

    # ===== Ghi CSV =====
    def export_item_features_csv(self, out_dir: str) -> dict:
        """
        Xuất ma trận thuộc tính sách (one-block) + danh mục cột để đối chiếu.
        File dùng UTF-8-SIG để mở Excel tiếng Việt không lỗi font.
        """
        self._ensure_items_loaded()
        os.makedirs(out_dir, exist_ok=True)
        ts = time.strftime("%Y%m%d-%H%M%S")

        dfX = self.df_item_feature()
        f_matrix = os.path.join(out_dir, f"items_features_{ts}.csv")
        dfX.to_csv(f_matrix, encoding="utf-8-sig")

        _, _, _, ALL = self._feature_names()
        f_cols = os.path.join(out_dir, f"features_columns_{ts}.csv")
        pd.DataFrame({"col_name": ALL}).to_csv(f_cols, index=False, encoding="utf-8-sig")

        return {"items_features_csv": f_matrix, "feature_columns_csv": f_cols}

    def export_user_csvs(self, out_dir: str, user_id: str) -> dict:
        """
        Xuất 3 file:
          - interactions_user_*.csv: vector tương tác 0..5 với tất cả sách
          - user_profile_features_*.csv: hồ sơ user theo từng thuộc tính (one-block)
          - recommend_scores_*.csv: điểm cosine(U, X[i]) cho toàn bộ sách
        """
        self._ensure_items_loaded()
        os.makedirs(out_dir, exist_ok=True)
        ts = time.strftime("%Y%m%d-%H%M%S")

        s_inter = self._interactions_vector(user_id)
        f_inter = os.path.join(out_dir, f"interactions_user_{user_id}_{ts}.csv")
        s_inter.to_csv(f_inter, header=True, encoding="utf-8-sig")

        s_prof = self._user_profile_series(user_id)
        f_prof = os.path.join(out_dir, f"user_profile_features_{user_id}_{ts}.csv")
        s_prof.to_csv(f_prof, header=True, encoding="utf-8-sig")

        s_scores = self._score_all_books(user_id)
        f_scores = os.path.join(out_dir, f"recommend_scores_{user_id}_{ts}.csv")
        s_scores.to_csv(f_scores, header=True, encoding="utf-8-sig")

        return {
            "interactions_csv": f_inter,
            "user_profile_csv": f_prof,
            "scores_csv": f_scores
        }
