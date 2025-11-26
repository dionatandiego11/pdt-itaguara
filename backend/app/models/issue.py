from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base

class IssueStatus(enum.Enum):
    OPEN = "open"                    # Aberta
    IN_PROGRESS = "in_progress"      # Em progresso
    RESOLVED = "resolved"            # Resolvida
    CLOSED = "closed"                # Fechada
    DUPLICATE = "duplicate"          # Duplicada

class IssuePriority(enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class IssueType(enum.Enum):
    BUG = "bug"                      # Bug/Problema
    FEATURE = "feature"              # Nova funcionalidade
    IMPROVEMENT = "improvement"      # Melhoria
    POLICY = "policy"                # Política pública
    INFRASTRUCTURE = "infrastructure" # Infraestrutura
    SERVICE = "service"              # Serviço público

class Issue(Base):
    __tablename__ = "issues"
    
    id = Column(Integer, primary_key=True, index=True)
    number = Column(Integer, nullable=False)  # Número sequencial no repositório
    title = Column(String, nullable=False)
    slug = Column(String, nullable=False)
    
    # Conteúdo
    description = Column(Text, nullable=False)
    
    # Categorização
    type = Column(Enum(IssueType), default=IssueType.BUG)
    priority = Column(Enum(IssuePriority), default=IssuePriority.MEDIUM)
    status = Column(Enum(IssueStatus), default=IssueStatus.OPEN)
    
    # Localização (para issues de infraestrutura/serviços)
    location = Column(String, nullable=True)  # Endereço ou coordenadas
    tags = Column(String, nullable=True)  # Tags separadas por vírgula
    
    # Relacionamentos
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    repository_id = Column(Integer, ForeignKey("repositories.id"), nullable=False)
    
    # Atribuição
    assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Orçamento (para issues com impacto financeiro)
    estimated_cost = Column(Integer, nullable=True)
    budget_category = Column(String, nullable=True)
    
    # Estatísticas
    comments_count = Column(Integer, default=0)
    reactions_count = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    closed_at = Column(DateTime, nullable=True)
    
    # Relacionamentos
    author = relationship("User", foreign_keys=[author_id], back_populates="issues")
    assigned_to = relationship("User", foreign_keys=[assigned_to_id])
    repository = relationship("Repository", back_populates="issues")
    comments = relationship("IssueComment", back_populates="issue")
    
    def __repr__(self):
        return f"<Issue(id={self.id}, number={self.number}, title='{self.title}', status={self.status})>"
    
    @property
    def url(self):
        return f"/repos/{self.repository.slug}/issues/{self.number}"
    
    @property
    def is_open(self):
        return self.status in [IssueStatus.OPEN, IssueStatus.IN_PROGRESS]

class IssueComment(Base):
    __tablename__ = "issue_comments"
    
    id = Column(Integer, primary_key=True, index=True)
    issue_id = Column(Integer, ForeignKey("issues.id"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Conteúdo
    content = Column(Text, nullable=False)
    
    # Comentário resposta
    parent_id = Column(Integer, ForeignKey("issue_comments.id"), nullable=True)
    
    # Edição
    is_edited = Column(Boolean, default=False)
    edited_at = Column(DateTime, nullable=True)
    
    # Reações
    reactions_count = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    issue = relationship("Issue", back_populates="comments")
    author = relationship("User", back_populates="comments")
    parent = relationship("IssueComment", remote_side=[id])
    replies = relationship("IssueComment", back_populates="parent")
    
    def __repr__(self):
        return f"<IssueComment(id={self.id}, issue_id={self.issue_id}, author_id={self.author_id})>"
    
    @property
    def url(self):
        return f"/repos/{self.issue.repository.slug}/issues/{self.issue.number}#issuecomment-{self.id}"