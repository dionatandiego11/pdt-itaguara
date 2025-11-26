from datetime import datetime
import enum

from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    Enum,
    Text,
    UniqueConstraint,
    JSON,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class VotingMethod(enum.Enum):
    SIMPLE = "simple"
    RANKED = "ranked"
    APPROVAL = "approval"
    QUADRATIC = "quadratic"


class VotingStatus(enum.Enum):
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    ACTIVE = "active"
    TALLYING = "tallying"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class VotingSession(Base):
    __tablename__ = "voting_sessions"

    id = Column(Integer, primary_key=True, index=True)
    proposal_id = Column(Integer, ForeignKey("proposals.id"), nullable=True)
    repository_id = Column(Integer, ForeignKey("repositories.id"), nullable=True)

    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)

    method = Column(Enum(VotingMethod), default=VotingMethod.SIMPLE)
    quorum_required = Column(Integer, default=0)
    starts_at = Column(DateTime, default=datetime.utcnow)
    ends_at = Column(DateTime, nullable=False)
    status = Column(Enum(VotingStatus), default=VotingStatus.DRAFT)

    result_calculated_at = Column(DateTime, nullable=True)
    result_metadata = Column(JSON, nullable=True)
    winner_option_id = Column(Integer, ForeignKey("voting_options.id"), nullable=True)
    total_votes = Column(Integer, default=0)

    proposal = relationship("Proposal", back_populates="voting_sessions")
    repository = relationship("Repository", back_populates="voting_sessions")
    options = relationship(
        "VotingOption",
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="VotingOption.order",
        foreign_keys="VotingOption.session_id",
    )
    votes = relationship(
        "Vote", back_populates="session", cascade="all, delete-orphan"
    )
    winner_option = relationship(
        "VotingOption", foreign_keys=[winner_option_id], post_update=True
    )

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<VotingSession(id={self.id}, method={self.method}, status={self.status})>"


class VotingOption(Base):
    __tablename__ = "voting_options"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("voting_sessions.id"), nullable=False)

    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    order = Column(Integer, default=0)
    value = Column(String, nullable=True)

    linked_proposal_id = Column(Integer, ForeignKey("proposals.id"), nullable=True)
    linked_repository_id = Column(Integer, ForeignKey("repositories.id"), nullable=True)

    session = relationship(
        "VotingSession",
        back_populates="options",
        foreign_keys=[session_id],
    )

    def __repr__(self):
        return f"<VotingOption(id={self.id}, title='{self.title}')>"


class Vote(Base):
    __tablename__ = "votes"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("voting_sessions.id"), nullable=False)
    proposal_id = Column(Integer, ForeignKey("proposals.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    choice = Column(String, nullable=True)
    vote_data = Column(JSON, nullable=False)
    vote_hash = Column(String, index=True, unique=True, nullable=True)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    voted_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("VotingSession", back_populates="votes")
    user = relationship("User", back_populates="votes")

    __table_args__ = (
        UniqueConstraint("session_id", "user_id", name="uq_session_user_vote"),
    )

    def __repr__(self):
        return f"<Vote(id={self.id}, user={self.user_id}, session={self.session_id})>"
