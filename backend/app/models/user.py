from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base


class UserLevel(enum.Enum):
    ANONYMOUS = 0
    REGISTERED = 1  # Simpatizante/registrado
    FILIADO = 2     # Filiado validado (ex-verificado)
    SPECIAL = 3     # Coordenação/diretório local (admin)


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)
    full_name = Column(String, nullable=True)
    
    # Nível de acesso
    level = Column(Enum(UserLevel), default=UserLevel.REGISTERED, nullable=False)
    
    # Verificação (legado). Mantido para compatibilidade, mas a regra de negócio usa level == FILIADO.
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String, nullable=True)
    verified_at = Column(DateTime, nullable=True)
    
    # Gov.br integration
    gov_br_id = Column(String, unique=True, nullable=True)
    cpf = Column(String, unique=True, nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    
    # Perfil
    bio = Column(Text, nullable=True)
    location = Column(String, nullable=True)
    website = Column(String, nullable=True)
    
    # Reputação
    reputation_score = Column(Integer, default=0)
    contributions_count = Column(Integer, default=0)
    
    # Relacionamentos
    proposals = relationship(
        "Proposal",
        back_populates="author",
        foreign_keys="Proposal.author_id",
    )
    issues = relationship(
        "Issue",
        back_populates="author",
        foreign_keys="Issue.author_id",
    )
    votes = relationship("Vote", back_populates="user")
    signatures = relationship("ProposalSignature", back_populates="user")
    comments = relationship(
        "IssueComment",
        back_populates="author",
        foreign_keys="IssueComment.author_id",
    )
    commits = relationship(
        "Commit",
        back_populates="author",
        foreign_keys="Commit.author_id",
    )
    
    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', level={self.level})>"
    
    @property
    def is_affiliate(self):
        """Indica se o usuário é filiado (PDT Itaguara)."""
        return (
            self.level in [UserLevel.FILIADO, UserLevel.SPECIAL]
            or self.is_superuser
            or self.is_verified  # compatibilidade com flag legado
        )

    @property
    def is_filiado(self):
        # Alias explícito para linguagem de negócio
        return self.is_affiliate
    
    @property
    def is_registered(self):
        return (
            self.level in [UserLevel.REGISTERED, UserLevel.FILIADO, UserLevel.SPECIAL]
            or self.is_superuser
        )
    
    @property
    def can_create_proposals(self):
        # Registrados podem propor em repositórios públicos; filiados em todos os níveis autorizados.
        return self.is_registered
    
    @property
    def can_vote(self):
        return self.level in [UserLevel.FILIADO, UserLevel.SPECIAL] or self.is_superuser
    
    @property
    def can_moderate(self):
        return self.level == UserLevel.SPECIAL or self.is_superuser
