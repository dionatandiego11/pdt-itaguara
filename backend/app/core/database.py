from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Criar engine do banco de dados
connect_args = {}
if "sqlite" in settings.DATABASE_URL:
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True if "postgresql" in settings.DATABASE_URL else False,
    pool_size=10 if "postgresql" in settings.DATABASE_URL else 1,
    max_overflow=20 if "postgresql" in settings.DATABASE_URL else 0
)

# Criar sessão do banco de dados
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para modelos
Base = declarative_base()

# Dependency para obter DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()