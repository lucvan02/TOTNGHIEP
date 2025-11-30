from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
import os

def get_mysql_engine() -> Engine:
    host = os.getenv("MYSQL_HOST", "localhost")
    port = os.getenv("MYSQL_PORT", "3306")
    user = os.getenv("MYSQL_USER", "root")
    pw   = os.getenv("MYSQL_PASSWORD", "")
    # Không set database ở DSN để có thể query cross-db bằng prefix bookweb_xxx.{table}
    dsn = f"mysql+pymysql://{user}:{pw}@{host}:{port}"
    engine = create_engine(dsn, pool_pre_ping=True, pool_recycle=1800)
    return engine

# Helper: chạy query và trả list dict
def fetch_all(engine: Engine, sql: str, params: dict | None = None):
    with engine.connect() as conn:
        res = conn.execute(text(sql), params or {})
        cols = res.keys()
        return [dict(zip(cols, row)) for row in res.fetchall()]
