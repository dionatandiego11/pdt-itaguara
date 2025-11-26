"""Add session_id column to votes to align with ORM

Revision ID: 202411241430
Revises: 202411241420
Create Date: 2024-11-24 14:30:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "202411241430"
down_revision = "202411241420"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add nullable column first
    op.add_column(
        "votes",
        sa.Column("session_id", sa.Integer(), nullable=True),
    )
    # Backfill from existing column voting_session_id when present
    op.execute(
        "UPDATE votes SET session_id = voting_session_id WHERE session_id IS NULL"
    )
    # Enforce not null and FK
    op.alter_column("votes", "session_id", nullable=False)
    op.create_foreign_key(
        "fk_votes_session_id",
        "votes",
        "voting_sessions",
        ["session_id"],
        ["id"],
    )
    # Unique constraint matching ORM expectation
    op.create_unique_constraint(
        "uq_votes_session_user",
        "votes",
        ["session_id", "user_id"],
    )


def downgrade() -> None:
    op.drop_constraint("uq_votes_session_user", "votes", type_="unique")
    op.drop_constraint("fk_votes_session_id", "votes", type_="foreignkey")
    op.drop_column("votes", "session_id")
