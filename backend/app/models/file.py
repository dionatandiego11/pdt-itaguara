from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, LargeBinary
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class File(Base):
    __tablename__ = "files"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Identificação
    repository_id = Column(Integer, ForeignKey("repositories.id"), nullable=False)
    path = Column(String, nullable=False)  # Caminho do arquivo
    name = Column(String, nullable=False)  # Nome do arquivo
    
    # Conteúdo
    content = Column(LargeBinary, nullable=True)  # Conteúdo binário
    content_text = Column(Text, nullable=True)  # Conteúdo texto
    
    # Metadados
    size = Column(Integer, default=0)  # Tamanho em bytes
    mime_type = Column(String, nullable=True)  # Tipo MIME
    encoding = Column(String, default="utf-8")  # Codificação
    
    # Versão
    version = Column(Integer, default=1)  # Versão do arquivo
    is_current = Column(Boolean, default=True)  # Versão atual?
    
    # Hash para integridade
    content_hash = Column(String, nullable=False)  # Hash SHA256 do conteúdo
    
    # Autor da última modificação
    last_modified_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    repository = relationship("Repository", back_populates="files")
    last_modified_by = relationship("User")
    
    def __repr__(self):
        return f"<File(id={self.id}, path='{self.path}', name='{self.name}', version={self.version})>"
    
    @property
    def extension(self):
        """Retorna a extensão do arquivo"""
        import os
        return os.path.splitext(self.name)[1].lower()
    
    @property
    def is_text_file(self):
        """Verifica se é um arquivo de texto"""
        text_extensions = ['.txt', '.md', '.json', '.xml', '.yaml', '.yml', '.csv']
        return self.extension in text_extensions
    
    @property
    def is_markdown(self):
        """Verifica se é um arquivo Markdown"""
        return self.extension in ['.md', '.markdown']
    
    @property
    def is_legislation_file(self):
        """Verifica se é um arquivo de legislação"""
        legislation_extensions = ['.md', '.txt', '.pdf', '.doc', '.docx']
        return self.extension in legislation_extensions