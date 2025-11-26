from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import uvicorn

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.router import api_router
from app.core.logging import setup_logging

# Setup logging
logger = setup_logging()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gerenciamento do ciclo de vida da aplicação"""
    # Startup
    logger.info("Iniciando CivicGit Backend...")
    
    # Criar tabelas do banco de dados
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Tabelas do banco de dados criadas com sucesso!")
    except Exception as e:
        logger.error(f"Erro ao criar tabelas: {e}")
    
    yield
    
    # Shutdown
    logger.info("Encerrando CivicGit Backend...")

# Criar a aplicação FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="CivicGit - Plataforma de Democracia Direta com Versionamento",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Configurar middlewares
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"] if settings.DEBUG else ["civicgit.local", "*.civicgit.org"]
)

# Incluir rotas da API
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    """Endpoint raiz da API"""
    return {
        "message": "Bem-vindo ao CivicGit API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health")
async def health_check():
    """Health check da aplicação"""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "debug": settings.DEBUG
    }

@app.get("/health/db")
async def database_health():
    """Health check do banco de dados"""
    try:
        from app.core.database import SessionLocal
        from sqlalchemy import text
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        return {"database": "healthy"}
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        raise HTTPException(status_code=503, detail="Database is unavailable")

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info"
    )
