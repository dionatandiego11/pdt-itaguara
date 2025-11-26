import sys
from sqlalchemy import create_engine, text

if "/app" not in sys.path:
    sys.path.append("/app")

from app.core.config import settings


def main(username: str):
    engine = create_engine(settings.DATABASE_URL)
    stmt = text(
        "UPDATE users SET level='FILIADO', is_verified=true WHERE username=:u"
    )
    with engine.begin() as conn:
        result = conn.execute(stmt, {"u": username})
    print(f"updated {result.rowcount} rows for user {username}")


if __name__ == "__main__":
    user = sys.argv[1] if len(sys.argv) > 1 else "votetester"
    main(user)
