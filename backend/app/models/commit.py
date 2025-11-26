from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Commit(Base):
    __tablename__ = "commits"
    
    id = Column(Integer, primary_key=True, index=True)
    hash = Column(String, unique=True, index=True, nullable=False)  # Git-like hash
    
    # Autor
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    author_name = Column(String, nullable=False)
    author_email = Column(String, nullable=False)
    
    # Informações do commit
    message = Column(Text, nullable=False)  # Mensagem do commit
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Referência à proposta
    proposal_id = Column(Integer, ForeignKey("proposals.id"), nullable=False)
    
    # Dados do commit (para versionamento)
    parent_hash = Column(String, nullable=True)  # Commit anterior
    tree_hash = Column(String, nullable=True)    # Árvore de arquivos
    
    # Estatísticas
    additions = Column(Integer, default=0)  # Linhas adicionadas
    deletions = Column(Integer, default=0)  # Linhas removidas
    files_changed = Column(Integer, default=0)  # Arquivos modificados
    
    # Relacionamentos
    author = relationship("User", back_populates="commits")
    proposal = relationship("Proposal", back_populates="commits")
    
    def __repr__(self):
        return f"<Commit(id={self.id}, hash='{self.hash[:8]}', author='{self.author_name}')>"
    
    @property
    def short_hash(self):
        return self.hash[:8]
    
    @property
    def net_changes(self):
        return self.additions - self.deletions