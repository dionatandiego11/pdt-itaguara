import sys
from sqlalchemy import create_engine, inspect

if "/app" not in sys.path:
    sys.path.append("/app")

from app.core.config import settings


def main():
    engine = create_engine(settings.DATABASE_URL)
    insp = inspect(engine)
    cols = insp.get_columns("votes")
    for c in cols:
        print(f"{c['name']} | nullable={c['nullable']} | type={c['type']}")


if __name__ == "__main__":
    main()
