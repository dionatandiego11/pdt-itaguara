import logging
import sys
from typing import Any

def setup_logging() -> logging.Logger:
    """Configura o sistema de logging da aplicação"""
    
    # Configuração do formato de log
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # Configurar o logging
    logging.basicConfig(
        level=logging.INFO,
        format=log_format,
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler("civicgit.log", encoding="utf-8")
        ]
    )
    
    # Criar logger para a aplicação
    logger = logging.getLogger("civicgit")
    logger.setLevel(logging.INFO)
    
    return logger

def get_logger(name: str) -> logging.Logger:
    """Obtém um logger com o nome especificado"""
    return logging.getLogger(f"civicgit.{name}")