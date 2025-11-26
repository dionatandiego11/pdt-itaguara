"""Add vote_data and vote_hash columns to votes

Revision ID: 202411241440
Revises: 202411241430
Create Date: 2024-11-24 14:40:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "202411241440"
down_revision = "202411241430"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "votes",
        sa.Column("vote_data", sa.JSON(), nullable=True),
    )
    op.add_column(
        "votes",
        sa.Column("vote_hash", sa.String(), nullable=True),
    )
    op.create_unique_constraint(
        "uq_votes_vote_hash",
        "votes",
        ["vote_hash"],
    )


def downgrade() -> None:
    op.drop_constraint("uq_votes_vote_hash", "votes", type_="unique")
    op.drop_column("votes", "vote_hash")
    op.drop_column("votes", "vote_data")
