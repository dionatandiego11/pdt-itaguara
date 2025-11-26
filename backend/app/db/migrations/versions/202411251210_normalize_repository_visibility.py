"""normalize repository visibility values to lowercase

Revision ID: 202411251210
Revises: 202411251200
Create Date: 2025-11-25 12:10:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "202411251210"
down_revision = "202411251200"
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()

    if conn.dialect.name == "postgresql":
        # Move to text before normalization when enum exists
        op.execute(
            """
            DO $$
            BEGIN
                IF EXISTS (SELECT 1 FROM pg_type WHERE typname='repositoryvisibility') THEN
                    ALTER TABLE repositories
                    ALTER COLUMN visibility TYPE text
                    USING visibility::text;
                END IF;
            END$$;
            """
        )
        # Normalize values
        op.execute(
            "UPDATE repositories SET visibility=lower(visibility) WHERE visibility IS NOT NULL;"
        )
        op.execute(
            "UPDATE repositories SET visibility='affiliates_only' WHERE visibility='private';"
        )
        # Replace enum safely
        op.execute(
            """
            DO $$
            BEGIN
                IF EXISTS (SELECT 1 FROM pg_type WHERE typname='repositoryvisibility') THEN
                    DROP TYPE repositoryvisibility;
                END IF;
                CREATE TYPE repositoryvisibility AS ENUM ('public','affiliates_only');
                ALTER TABLE repositories
                ALTER COLUMN visibility TYPE repositoryvisibility
                USING visibility::repositoryvisibility;
            END$$;
            """
        )
    else:
        op.execute(
            "UPDATE repositories SET visibility='affiliates_only' WHERE visibility='private';"
        )
        op.execute(
            "UPDATE repositories SET visibility=lower(visibility) WHERE visibility IS NOT NULL;"
        )


def downgrade():
    conn = op.get_bind()

    if conn.dialect.name == "postgresql":
        op.execute(
            """
            ALTER TABLE repositories
            ALTER COLUMN visibility TYPE text
            USING lower(visibility::text);
            """
        )
        op.execute("DROP TYPE IF EXISTS repositoryvisibility;")
        op.execute(
            "CREATE TYPE repositoryvisibility AS ENUM ('public','affiliates_only','private');"
        )
        op.execute(
            """
            ALTER TABLE repositories
            ALTER COLUMN visibility TYPE repositoryvisibility
            USING visibility::repositoryvisibility;
            """
        )
    else:
        op.execute(
            "UPDATE repositories SET visibility='private' WHERE visibility='affiliates_only';"
        )
