from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship, backref
from datetime import datetime
import enum
from app.core.database import Base

class RepositoryType(str, enum.Enum):
    JURISDICTION = "jurisdiction"  # Ex: "Município de São Paulo"
    POLICY_AREA = "policy_area"    # Ex: "Código Sanitário"
    BUDGET = "budget"              # Ex: "Orçamento Federal 2026"

class RepositoryVisibility(str, enum.Enum):
    PUBLIC = "public"  # Público em geral
    AFFILIATES_ONLY = "affiliates_only"  # Apenas filiados (PDT Itaguara)


class Repository(Base):
    __tablename__ = "repositories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    slug = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    is_fork = Column(Boolean, default=False)
    forked_from_id = Column(Integer, ForeignKey("repositories.id"), nullable=True)
    
    # Tipo e visibilidade
    type = Column(
        Enum(
            RepositoryType,
            name="repositorytype",
            values_callable=lambda e: [member.value for member in e],
        ),
        nullable=False,
    )
    visibility = Column(
        Enum(
            RepositoryVisibility,
            name="repositoryvisibility",
            values_callable=lambda e: [member.value for member in e],
        ),
        default=RepositoryVisibility.PUBLIC,
        nullable=False,
    )
    
    # Informações da entidade responsável
    jurisdiction_name = Column(String, nullable=True)  # Ex: "Prefeitura de São Paulo"
    jurisdiction_type = Column(String, nullable=True)  # Ex: "Municipal", "Estadual", "Federal"
    
    # Configurações de votação
    quorum_percentage = Column(Integer, default=10)
    voting_period_days = Column(Integer, default=7)
    min_signatures_for_voting = Column(Integer, default=500)
    
    # Permissões
    allow_public_proposals = Column(Boolean, default=True)
    allow_public_voting = Column(Boolean, default=True)
    require_verification_for_voting = Column(Boolean, default=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_archived = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Estatísticas
    proposals_count = Column(Integer, default=0)
    issues_count = Column(Integer, default=0)
    contributors_count = Column(Integer, default=0)
    
    # Relacionamentos
    proposals = relationship("Proposal", back_populates="repository")
    issues = relationship("Issue", back_populates="repository")
    files = relationship("File", back_populates="repository")
    parent = relationship(
        "Repository",
        remote_side=[id],
        backref=backref("forks", lazy="dynamic"),
    )
    voting_sessions = relationship("VotingSession", back_populates="repository")
    owner_record = relationship(
        "RepositoryOwner",
        back_populates="repository",
        cascade="all, delete-orphan",
        uselist=False,
    )
    
    def __repr__(self):
        return f"<Repository(id={self.id}, name='{self.name}', slug='{self.slug}')>"
    
    @property
    def full_name(self):
        if self.jurisdiction_name:
            return f"{self.jurisdiction_name} - {self.name}"
        return self.name
    
    @property
    def url(self):
        return f"/repos/{self.slug}"

    @property
    def owner_id(self):
        return self.owner_record.user_id if self.owner_record else None

    @property
    def owner(self):
        """Retorna os dados completos do proprietário do repositório"""
        if self.owner_record and self.owner_record.user:
            return self.owner_record.user
        return None

    @property
    def is_root(self):
        return self.forked_from_id is None



class RepositoryOwner(Base):
    __tablename__ = "repository_owners"

    repository_id = Column(Integer, ForeignKey("repositories.id"), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    repository = relationship("Repository", back_populates="owner_record")
    user = relationship("User", foreign_keys=[user_id])
