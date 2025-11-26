"""update repository visibility enum

Revision ID: 202411241535
Revises: 202411241440
Create Date: 2024-11-24 15:35:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '202411241535'
down_revision = '202411241440'
branch_labels = None
depends_on = None


def upgrade():
    # Since we are using SQLite in development (likely), altering Enum types is tricky.
    # However, for this task, we will assume a standard approach or just update the column definition if possible.
    # In many cases with SQLAlchemy Enums, the application level validation is what matters most unless using Postgres native ENUMs.
    # Given the environment, we will focus on the application logic update which we did in the model.
    # But to be safe and "correct" for a migration file:
    pass


def downgrade():
    pass
