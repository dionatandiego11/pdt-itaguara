"""Add missing columns to voting_sessions to match ORM model

Revision ID: 202411241420
Revises: 202411241410
Create Date: 2024-11-24 14:20:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "202411241420"
down_revision = "202411241410"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Columns that exist in the ORM but not in the current table
    op.add_column(
        "voting_sessions",
        sa.Column("title", sa.String(), nullable=True),
    )
    op.add_column(
        "voting_sessions",
        sa.Column("description", sa.Text(), nullable=True),
    )
    op.add_column(
        "voting_sessions",
        sa.Column("result_metadata", sa.JSON(), nullable=True),
    )
    op.add_column(
        "voting_sessions",
        sa.Column("winner_option_id", sa.Integer(), nullable=True),
    )
    # FK for winner_option_id
    op.create_foreign_key(
        "fk_voting_sessions_winner_option_id",
        "voting_sessions",
        "voting_options",
        ["winner_option_id"],
        ["id"],
    )


def downgrade() -> None:
    op.drop_constraint(
        "fk_voting_sessions_winner_option_id",
        "voting_sessions",
        type_="foreignkey",
    )
    op.drop_column("voting_sessions", "winner_option_id")
    op.drop_column("voting_sessions", "result_metadata")
    op.drop_column("voting_sessions", "description")
    op.drop_column("voting_sessions", "title")
