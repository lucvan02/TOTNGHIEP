# import os
# import math
# import numpy as np
# import logging
# from typing import Dict, List, Tuple, Set, Optional
# from sqlalchemy.engine import Engine
# from .db import fetch_all

# log = logging.getLogger(__name__)

# class CBFModel:
#     """
#     CBF đơn giản, không tâm hoá:
#     - X: vector sách theo (tác giả, thể loại, NXB), L2-normalize.
#     - W không lưu; khi cần sẽ lấy tương tác của user:
#         + review: điểm 1..5 (lấy review mới nhất theo created_at,id)
#         + favorite: 5 điểm
#       Nếu cùng sách có cả review và favorite -> lấy điểm lớn hơn (tức là 5).
#     - Hồ sơ user: p = Σ(điểm * v_book); rồi L2-normalize p.
#     - Điểm gợi ý: cosine(p, v_book).
#     - Loại toàn bộ item user đã tương tác (đã review hoặc favorite).
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

#         # vectors & meta
#         self.book_vectors: Dict[int, np.ndarray] = {}   # book_id -> np.array(d,)
#         self.book_meta: Dict[int, dict] = {}            # book_id -> {title, ...}

#         # group weights
#         self.l_author = float(os.getenv("LAMBDA_AUTHOR", "0.4"))
#         self.l_cate   = float(os.getenv("LAMBDA_CATEGORY", "0.4"))
#         self.l_pub    = float(os.getenv("LAMBDA_PUBLISHER", "0.2"))

#     # ---------- Load vocabs & item vectors ----------
#     def load_vocabs(self):
#         a = fetch_all(self.engine, f"SELECT id, name FROM {self.db_book}.authors")
#         c = fetch_all(self.engine, f"SELECT id, name FROM {self.db_book}.categories")
#         p = fetch_all(self.engine, f"SELECT id, name FROM {self.db_book}.publishers")

#         self.author2idx = {row["id"]: i for i, row in enumerate(a)}
#         self.cate2idx   = {row["id"]: i for i, row in enumerate(c)}
#         self.pub2idx    = {row["id"]: i for i, row in enumerate(p)}

#         self.idx2author = {i: row["name"] for i, row in enumerate(a)}
#         self.idx2cate   = {i: row["name"] for i, row in enumerate(c)}
#         self.idx2pub    = {i: row["name"] for i, row in enumerate(p)}

#         log.info("Loaded vocab: authors=%d, categories=%d, publishers=%d",
#                  len(self.author2idx), len(self.cate2idx), len(self.pub2idx))

#     def load_item_vectors(self):
#         """Tạo vector cho từng sách: concat( sqrt(λa)*va | sqrt(λc)*vc | sqrt(λp)*vp ), rồi L2."""
#         from collections import defaultdict

#         ab = fetch_all(self.engine, f"SELECT book_id, author_id FROM {self.db_book}.author_book")
#         bc = fetch_all(self.engine, f"SELECT book_id, category_id FROM {self.db_book}.book_category")
#         bp = fetch_all(self.engine, f"SELECT id AS book_id, publisher_id, title FROM {self.db_book}.books")

#         book_authors = defaultdict(list)
#         for r in ab:
#             if r["author_id"] in self.author2idx:
#                 book_authors[r["book_id"]].append(self.author2idx[r["author_id"]])

#         book_cates = defaultdict(list)
#         for r in bc:
#             if r["category_id"] in self.cate2idx:
#                 book_cates[r["book_id"]].append(self.cate2idx[r["category_id"]])

#         book_pubs = {}
#         for r in bp:
#             if r["publisher_id"] in self.pub2idx:
#                 book_pubs[r["book_id"]] = self.pub2idx[r["publisher_id"]]
#             # lưu meta
#             self.book_meta[r["book_id"]] = {"title": r["title"]}

#         na, nc, npub = len(self.author2idx), len(self.cate2idx), len(self.pub2idx)
#         sa, sc, sp = math.sqrt(self.l_author), math.sqrt(self.l_cate), math.sqrt(self.l_pub)

#         self.book_vectors.clear()
#         ids = [r["book_id"] for r in bp]
#         for bid in ids:
#             a_idx = book_authors.get(bid, [])
#             c_idx = book_cates.get(bid, [])
#             p_idx = book_pubs.get(bid, None)

#             va = np.zeros(na, dtype=float)
#             vc = np.zeros(nc, dtype=float)
#             vp = np.zeros(npub, dtype=float)

#             if a_idx:
#                 fill = 1.0 / len(a_idx)
#                 for i in a_idx: va[i] = fill
#             if c_idx:
#                 fill = 1.0 / len(c_idx)
#                 for i in c_idx: vc[i] = fill
#             if p_idx is not None:
#                 vp[p_idx] = 1.0

#             v = np.concatenate([sa*va, sc*vc, sp*vp])
#             n = np.linalg.norm(v)
#             if n > 0:
#                 v = v / n
#             self.book_vectors[bid] = v

#         log.info("Built item vectors: %d books", len(self.book_vectors))

#     # ---------- Interactions (latest review + favorites=5) ----------
#     def get_user_pairs_score15(self, user_id: str) -> Dict[int, float]:
#         """
#         Trả về {book_id: score(1..5)} cho user:
#         - review mới nhất mỗi (user,book)
#         - favorite = 5; nếu đã có review thì lấy max(review, 5)
#         """
#         pairs: Dict[int, float] = {}
#         book_ids_set = set(self.book_vectors.keys())

#         # MySQL 8+ window function: review mới nhất theo created_at,id
#         latest_reviews = fetch_all(self.engine, f"""
#             SELECT buyer_id AS uid, book_id, stars AS rating
#             FROM (
#                 SELECT buyer_id, book_id, stars,
#                        ROW_NUMBER() OVER (PARTITION BY buyer_id, book_id
#                                           ORDER BY created_at DESC, id DESC) AS rn
#                 FROM {self.db_order}.reviews
#                 WHERE buyer_id = :uid
#             ) t
#             WHERE rn = 1
#         """, {"uid": user_id})

#         for r in latest_reviews:
#             bid = r["book_id"]
#             if bid in book_ids_set:
#                 pairs[bid] = float(r["rating"])  # giữ nguyên 1..5

#         favs = fetch_all(self.engine, f"""
#             SELECT book_id FROM {self.db_order}.favorites WHERE buyer_id = :uid
#         """, {"uid": user_id})

#         for r in favs:
#             bid = r["book_id"]
#             if bid in book_ids_set:
#                 pairs[bid] = max(pairs.get(bid, 0.0), 5.0)  # nếu đã có review thì lấy lớn hơn

#         return pairs  # rỗng nếu user chưa tương tác

#     # ---------- Profiles & scoring ----------
#     @staticmethod
#     def _cosine(a: np.ndarray, b: np.ndarray) -> float:
#         na = np.linalg.norm(a); nb = np.linalg.norm(b)
#         if na == 0 or nb == 0: return 0.0
#         return float(a.dot(b) / (na * nb))

#     def _user_profile_from_pairs(self, pairs: Dict[int, float]) -> np.ndarray:
#         """p = Σ(score(1..5) * v_book), rồi L2-normalize."""
#         if not pairs:
#             return np.zeros_like(next(iter(self.book_vectors.values())))
#         p = None
#         for bid, score in pairs.items():
#             v = self.book_vectors.get(bid)
#             if v is None: 
#                 continue
#             if p is None:
#                 p = score * v
#             else:
#                 p += score * v
#         if p is None:
#             p = np.zeros_like(next(iter(self.book_vectors.values())))
#         n = np.linalg.norm(p)
#         return p / n if n > 0 else p

#     def recommend_for_user(self, user_id: str, top_k: int = 12, exclude_interacted: bool = True):
#         """
#         Trả về [(book_id, score)], score = cosine(p, v_book), 
#         loại các sách user đã review/favorite nếu exclude_interacted=True.
#         """
#         pairs = self.get_user_pairs_score15(user_id)
#         p = self._user_profile_from_pairs(pairs)

#         interacted_ids: Set[int] = set(pairs.keys()) if exclude_interacted else set()

#         rows: List[Tuple[int, float]] = []
#         pn = np.linalg.norm(p)
#         for bid, v in self.book_vectors.items():
#             if bid in interacted_ids:
#                 continue
#             sc = 0.0 if pn == 0 else float(p.dot(v))  # v đã L2; p đã L2 -> cosine
#             rows.append((bid, sc))
#         rows.sort(key=lambda x: x[1], reverse=True)
#         return rows[:top_k]

#     # ---------- Debug ----------
#     def item_breakdown(self, book_id: int) -> Optional[dict]:
#         """Trả về top đặc trưng cho một sách (để debug/giải thích)."""
#         v = self.book_vectors.get(book_id)
#         if v is None:
#             return None
#         na, nc, npub = len(self.author2idx), len(self.cate2idx), len(self.pub2idx)
#         a = v[:na]; c = v[na:na+nc]; p = v[na+nc:na+nc+npub]
#         authors = sorted([(self.idx2author[i], float(a[i])) for i in np.nonzero(a)[0]],
#                          key=lambda x: -abs(x[1]))
#         cates   = sorted([(self.idx2cate[i],   float(c[i])) for i in np.nonzero(c)[0]],
#                          key=lambda x: -abs(x[1]))
#         pubs    = [(self.idx2pub[i], float(p[i])) for i in np.nonzero(p)[0]]
#         return {"authors": authors, "categories": cates, "publishers": pubs}

#     # ---------- Maintenance ----------
#     def reload_all(self):
#         """Reload vocab + vectors (dùng khi có sách/thuộc tính mới)."""
#         self.load_vocabs()
#         self.load_item_vectors()










import os
import numpy as np
import logging
import math
from typing import Dict, List, Tuple, Set, Optional
from sqlalchemy.engine import Engine
from .db import fetch_all

log = logging.getLogger(__name__)


class CBFModel:
    """
    Content-Based Filtering (blockwise cosine, no lambda weights):
    - Item vectors tách 3 khối:
        A_items (books x #authors)  multi-hot (0/1)
        C_items (books x #categories) multi-hot (0/1)
        P_items (books x #publishers) one-hot (0/1)
      -> KHÔNG chia 1/k, KHÔNG áp dụng sqrt(lambda).
    - Interactions:
        + review: điểm 1..5 (lấy review mới nhất theo created_at, id)
        + favorite: 5 điểm
      Nếu cùng sách có cả review và favorite -> lấy max (tức là 5).
    - User profile từng khối (thô): U_raw_block = sum(score * item_block_row)
      Sau đó CHUẨN HOÁ THEO TỔNG (L1): U_block = U_raw_block / sum(U_raw_block) (nếu tổng=0 giữ nguyên 0).
    - Scoring:
        cos_A = cosine(U_A, A_items[i])
        cos_C = cosine(U_C, C_items[i])
        cos_P = cosine(U_P, P_items[i])
        score = (cos_A + cos_C + cos_P) / 3
    - Loại item user đã tương tác (review/favorite) khi recommend.
    """

    def __init__(self, engine: Engine, db_user: str, db_book: str, db_order: str):
        self.engine = engine
        self.db_user = db_user
        self.db_book = db_book
        self.db_order = db_order

        # vocab maps
        self.author2idx: Dict[int, int] = {}
        self.cate2idx: Dict[int, int] = {}
        self.pub2idx: Dict[int, int] = {}
        self.idx2author: Dict[int, str] = {}
        self.idx2cate: Dict[int, str] = {}
        self.idx2pub: Dict[int, str] = {}

        # book list & meta
        self.book_ids: List[int] = []
        self.bookid2row: Dict[int, int] = {}
        self.book_meta: Dict[int, dict] = {}

        # item matrices (numpy)
        self.A_items: Optional[np.ndarray] = None  # (n_books, n_authors)
        self.C_items: Optional[np.ndarray] = None  # (n_books, n_categories)
        self.P_items: Optional[np.ndarray] = None  # (n_books, n_publishers)

        # giữ cho /health tương thích (không dùng đến)
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

    # ---------- Load vocabs & item matrices ----------
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

        log.info(
            "Loaded vocab: authors=%d, categories=%d, publishers=%d",
            len(self.author2idx), len(self.cate2idx), len(self.pub2idx)
        )

    def load_item_matrices(self):
        """Tạo 3 ma trận nhị phân A_items, C_items, P_items; lưu book_ids, meta, index map."""
        from collections import defaultdict

        ab = fetch_all(self.engine, f"SELECT book_id, author_id FROM {self.db_book}.author_book")
        bc = fetch_all(self.engine, f"SELECT book_id, category_id FROM {self.db_book}.book_category")
        bp = fetch_all(self.engine, f"SELECT id AS book_id, publisher_id, title FROM {self.db_book}.books")

        # danh sách sách + meta
        self.book_ids = [r["book_id"] for r in bp]
        self.bookid2row = {bid: i for i, bid in enumerate(self.book_ids)}
        self.book_meta = {r["book_id"]: {"title": r["title"]} for r in bp}

        n_books = len(self.book_ids)
        na, nc, npub = len(self.author2idx), len(self.cate2idx), len(self.pub2idx)
        A = np.zeros((n_books, na), dtype=float)
        C = np.zeros((n_books, nc), dtype=float)
        P = np.zeros((n_books, npub), dtype=float)

        # authors multi-hot
        for r in ab:
            bid = r["book_id"]
            ai_raw = r["author_id"]
            if ai_raw in self.author2idx and bid in self.bookid2row:
                A[self.bookid2row[bid], self.author2idx[ai_raw]] = 1.0

        # categories multi-hot
        for r in bc:
            bid = r["book_id"]
            ci_raw = r["category_id"]
            if ci_raw in self.cate2idx and bid in self.bookid2row:
                C[self.bookid2row[bid], self.cate2idx[ci_raw]] = 1.0

        # publishers one-hot
        for r in bp:
            bid = r["book_id"]
            pj_raw = r["publisher_id"]
            if pj_raw in self.pub2idx and bid in self.bookid2row:
                P[self.bookid2row[bid], self.pub2idx[pj_raw]] = 1.0

        self.A_items, self.C_items, self.P_items = A, C, P
        log.info(
            "Built item matrices: A=%s, C=%s, P=%s (books=%d)",
            A.shape, C.shape, P.shape, n_books
        )

    # ---------- Interactions (latest review + favorites=5) ----------
    def get_user_pairs_score15(self, user_id: str) -> Dict[int, float]:
        """
        Trả về {book_id: score(1..5)} cho user:
          - review mới nhất mỗi (user,book)
          - favorite = 5; nếu đã có review thì lấy max(review, 5)
        """
        pairs: Dict[int, float] = {}
        book_ids_set = set(self.book_ids)

        # MySQL 8+ window function: review mới nhất theo created_at, id
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

    # ---------- Build user profiles (A_user, C_user, P_user) ----------
    def _build_user_block_profiles(self, pairs: Dict[int, float]) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """
        Trả về (A_user, C_user, P_user) dạng L1-normalized (vector 1D cho user).
        Nếu pairs rỗng -> 3 vector 0.
        """
        na, nc, npub = len(self.author2idx), len(self.cate2idx), len(self.pub2idx)
        uA = np.zeros(na, dtype=float)
        uC = np.zeros(nc, dtype=float)
        uP = np.zeros(npub, dtype=float)

        if not pairs:
            return uA, uC, uP

        for bid, score in pairs.items():
            row = self.bookid2row.get(bid)
            if row is None:
                continue
            # cộng dồn theo điểm
            uA += score * self.A_items[row, :]
            uC += score * self.C_items[row, :]
            uP += score * self.P_items[row, :]

        # L1-normalize theo TỪNG KHỐI
        uA = self._l1_normalize(uA)
        uC = self._l1_normalize(uC)
        uP = self._l1_normalize(uP)
        return uA, uC, uP

    # ---------- Recommend / Similar ----------
    def recommend_for_user(self, user_id: str, top_k: int = 12, exclude_interacted: bool = True):
        """
        Trả về [(book_id, score)], score = average cosine theo 3 khối (A/C/P).
        - Hồ sơ người dùng lấy từ review(1..5) + favorite(=5), sau đó L1-normalize từng khối.
        - Loại các sách user đã tương tác nếu exclude_interacted=True.
        """
        if self.A_items is None:
            # phòng hờ
            self.load_vocabs()
            self.load_item_matrices()

        pairs = self.get_user_pairs_score15(user_id)
        uA, uC, uP = self._build_user_block_profiles(pairs)

        interacted_ids: Set[int] = set(pairs.keys()) if exclude_interacted else set()

        rows: List[Tuple[int, float]] = []
        for bid in self.book_ids:
            if bid in interacted_ids:
                continue
            row = self.bookid2row[bid]
            sA = self._cosine(uA, self.A_items[row, :])
            sC = self._cosine(uC, self.C_items[row, :])
            sP = self._cosine(uP, self.P_items[row, :])
            sc = (sA + sC + sP) / 3.0
            rows.append((bid, float(sc)))
        rows.sort(key=lambda x: x[1], reverse=True)
        return rows[:top_k]

    def item_breakdown(self, book_id: int) -> Optional[dict]:
        """Trả về các thuộc tính ON (1.0) cho 1 sách để giải thích."""
        if self.A_items is None:
            return None
        row = self.bookid2row.get(book_id)
        if row is None:
            return None
        # liệt kê tên thuộc tính có giá trị 1
        authors = [self.idx2author[i] for i in np.where(self.A_items[row, :] != 0)[0]]
        cates = [self.idx2cate[i] for i in np.where(self.C_items[row, :] != 0)[0]]
        pubs_idx = np.where(self.P_items[row, :] != 0)[0]
        pubs = [self.idx2pub[int(pubs_idx[0])]] if pubs_idx.size > 0 else []
        return {"authors": authors, "categories": cates, "publishers": pubs}

    def similar_items(self, book_id: int, top_k: int = 12):
        """
        Tính tương tự giữa item và các item khác bằng cách
        trung bình 3 cosine theo từng khối (A/C/P) như recommend.
        """
        if self.A_items is None:
            return []

        row0 = self.bookid2row.get(book_id)
        if row0 is None:
            return []

        sims: List[Tuple[int, float]] = []
        for bid in self.book_ids:
            if bid == book_id:
                continue
            row = self.bookid2row[bid]
            sA = self._cosine(self.A_items[row0, :], self.A_items[row, :])
            sC = self._cosine(self.C_items[row0, :], self.C_items[row, :])
            sP = self._cosine(self.P_items[row0, :], self.P_items[row, :])
            sc = (sA + sC + sP) / 3.0
            sims.append((bid, float(sc)))
        sims.sort(key=lambda x: x[1], reverse=True)
        return sims[:top_k]

    # ---------- Maintenance ----------
    def reload_all(self):
        """Reload toàn bộ vocab + item matrices (dùng khi thêm sách/thuộc tính)."""
        self.load_vocabs()
        self.load_item_matrices()
