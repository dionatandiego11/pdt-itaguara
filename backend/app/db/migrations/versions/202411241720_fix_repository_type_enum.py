"""fix repository type enum values

Revision ID: 202411241720
Revises: 202411241710
Create Date: 2024-11-24 17:20:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "202411241720"
down_revision = "202411241710"
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()

    if conn.dialect.name == "postgresql":
        # Normalize legacy values then recreate enum with the canonical options
        op.execute(
            """
            ALTER TABLE repositories
            ALTER COLUMN type TYPE text
            USING lower(type::text);
            """
        )
        # Adjust possible legacy values without underscore
        op.execute(
            "UPDATE repositories SET type='policy_area' WHERE type IN ('policyarea', 'policy area');"
        )
        op.execute("DROP TYPE IF EXISTS repositorytype;")
        op.execute(
            "CREATE TYPE repositorytype AS ENUM ('jurisdiction','policy_area','budget');"
        )
        op.execute(
            """
            ALTER TABLE repositories
            ALTER COLUMN type TYPE repositorytype
            USING type::repositorytype;
            """
        )
    else:
        # SQLite/outros: apenas normaliza valores
        op.execute(
            "UPDATE repositories SET type='policy_area' WHERE type IN ('policyarea', 'policy area');"
        )


def downgrade():
    conn = op.get_bind()

    if conn.dialect.name == "postgresql":
        op.execute(
            """
            ALTER TABLE repositories
            ALTER COLUMN type TYPE text
            USING lower(type::text);
            """
        )
        op.execute("DROP TYPE IF EXISTS repositorytype;")
        op.execute(
            "CREATE TYPE repositorytype AS ENUM ('jurisdiction','budget');"
        )
        op.execute(
            """
            ALTER TABLE repositories
            ALTER COLUMN type TYPE repositorytype
            USING type::repositorytype;
            """
        )
    else:
        op.execute(
            "UPDATE repositories SET type='budget' WHERE type='policy_area';"
        )
