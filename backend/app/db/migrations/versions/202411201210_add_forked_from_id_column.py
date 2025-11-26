"""Add forked_from_id column to repositories

Revision ID: 202411201210
Revises: 202411201200
Create Date: 2024-11-20 12:10:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '202411201210'
down_revision = '202411201200'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('repositories', sa.Column('forked_from_id', sa.Integer(), nullable=True))
    op.create_foreign_key(
        'fk_repositories_forked_from_id',
        'repositories',
        'repositories',
        ['forked_from_id'],
        ['id'],
    )


def downgrade() -> None:
    op.drop_constraint('fk_repositories_forked_from_id', 'repositories', type_='foreignkey')
    op.drop_column('repositories', 'forked_from_id')
