import sys
from sqlalchemy import create_engine, text

# Garantir que /app está no PYTHONPATH quando rodar via docker exec
if "/app" not in sys.path:
    sys.path.append("/app")

from app.core.config import settings


def main():
    engine = create_engine(settings.DATABASE_URL)
    stmts = [
        "ALTER TABLE votes ALTER COLUMN voting_session_id DROP NOT NULL",
        "UPDATE votes SET voting_session_id = session_id WHERE voting_session_id IS NULL",
        "ALTER TABLE votes ALTER COLUMN choice TYPE text USING choice::text",
        "ALTER TABLE votes ALTER COLUMN choice DROP NOT NULL",
        "UPDATE votes SET choice = COALESCE(choice, (vote_data::json ->> 'value'))",
    ]
    with engine.begin() as conn:
        for stmt in stmts:
            conn.execute(text(stmt))
    print("voting_session_id and choice normalized")


if __name__ == "__main__":
    main()
