"""Add is_fork column to repositories

Revision ID: 202411201200
Revises: 
Create Date: 2024-11-20 12:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '202411201200'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        'repositories',
        sa.Column('is_fork', sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.alter_column('repositories', 'is_fork', server_default=None)


def downgrade() -> None:
    op.drop_column('repositories', 'is_fork')
