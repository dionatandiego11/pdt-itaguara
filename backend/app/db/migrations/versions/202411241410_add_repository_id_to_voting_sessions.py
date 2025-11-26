"""Add repository_id to voting_sessions

Revision ID: 202411241410
Revises: 202411201210
Create Date: 2024-11-24 14:10:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "202411241410"
down_revision = "202411201210"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "voting_sessions",
        sa.Column("repository_id", sa.Integer(), nullable=True),
    )
    op.create_foreign_key(
        "fk_voting_sessions_repository_id",
        "voting_sessions",
        "repositories",
        ["repository_id"],
        ["id"],
    )


def downgrade() -> None:
    op.drop_constraint(
        "fk_voting_sessions_repository_id",
        "voting_sessions",
        type_="foreignkey",
    )
    op.drop_column("voting_sessions", "repository_id")
