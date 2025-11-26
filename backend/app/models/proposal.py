from datetime import datetime
import enum

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
    Enum,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class ProposalStatus(enum.Enum):
    DRAFT = "draft"  # Rascunho
    DISCUSSION = "discussion"  # Em discussão pública
    AWAITING_REVIEW = "awaiting_review"  # Aguardando parecer técnico
    THRESHOLD_REACHED = "threshold_reached"  # Atingiu limiar de assinaturas
    VOTING = "voting"  # Em votação
    APPROVED = "approved"  # Aprovada
    REJECTED = "rejected"  # Rejeitada
    WITHDRAWN = "withdrawn"  # Retirada pelo autor


class ProposalType(enum.Enum):
    AMENDMENT = "amendment"  # Emenda
    NEW_LAW = "new_law"  # Nova lei
    REPEAL = "repeal"  # Revogação
    BUDGET_ALTERATION = "budget_alteration"  # Alteração orçamentária


class Proposal(Base):
    __tablename__ = "proposals"

    id = Column(Integer, primary_key=True, index=True)
    number = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)

    # Conteúdo
    summary = Column(Text, nullable=False)  # Resumo da proposta
    justification = Column(Text, nullable=False)  # Justificativa
    full_text = Column(Text, nullable=False)  # Texto completo da proposta

    # Metadados
    type = Column(Enum(ProposalType), nullable=False)
    status = Column(Enum(ProposalStatus), default=ProposalStatus.DRAFT)

    # Relacionamentos
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    repository_id = Column(Integer, ForeignKey("repositories.id"), nullable=False)

    # Branch e merge
    branch_name = Column(String, nullable=False)  # Nome da branch
    target_branch = Column(String, default="main")  # Branch alvo
    merged_at = Column(DateTime, nullable=True)
    merged_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Estatísticas
    signatures_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    votes_count = Column(Integer, default=0)

    # Configurações de votação
    voting_method = Column(String, default="simple")  # simple, qualified, ranked
    quorum_required = Column(Integer, nullable=True)
    threshold_percentage = Column(Integer, nullable=True)  # Para votação qualificada

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )
    submitted_at = Column(
        DateTime,
        nullable=True,
    )  # Quando foi submetida para discussão
    voting_started_at = Column(DateTime, nullable=True)
    voting_ended_at = Column(DateTime, nullable=True)

    # Relacionamentos
    author = relationship(
        "User",
        foreign_keys=[author_id],
        back_populates="proposals",
    )
    merged_by = relationship(
        "User",
        foreign_keys=[merged_by_id],
    )
    repository = relationship(
        "Repository",
        back_populates="proposals",
    )
    signatures = relationship(
        "ProposalSignature",
        back_populates="proposal",
    )
    voting_sessions = relationship(
        "VotingSession",
        back_populates="proposal",
    )
    commits = relationship(
        "Commit",
        back_populates="proposal",
    )

    def __repr__(self) -> str:
        return (
            f"<Proposal(id={self.id}, number='{self.number}', "
            f"title='{self.title}', status={self.status})>"
        )

    @property
    def url(self) -> str:
        return f"/repos/{self.repository.slug}/pulls/{self.number}"

    @property
    def is_voting_period_active(self) -> bool:
        if not self.voting_started_at or not self.voting_ended_at:
            return False
        now = datetime.utcnow()
        return self.voting_started_at <= now <= self.voting_ended_at


class ProposalSignature(Base):
    __tablename__ = "proposal_signatures"

    id = Column(Integer, primary_key=True, index=True)
    proposal_id = Column(Integer, ForeignKey("proposals.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Informações da assinatura
    signed_at = Column(DateTime, default=datetime.utcnow)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)

    # Comentário opcional ao assinar
    comment = Column(Text, nullable=True)

    # Relacionamentos
    proposal = relationship(
        "Proposal",
        back_populates="signatures",
    )
    user = relationship(
        "User",
        back_populates="signatures",
    )

    def __repr__(self) -> str:
        return (
            f"<ProposalSignature(id={self.id}, "
            f"proposal_id={self.proposal_id}, user_id={self.user_id})>"
        )

    __table_args__ = (
        UniqueConstraint("proposal_id", "user_id", name="uq_proposal_signature"),
        {"sqlite_autoincrement": True},
    )
