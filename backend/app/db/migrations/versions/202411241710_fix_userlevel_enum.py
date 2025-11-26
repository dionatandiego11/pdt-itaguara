"""ensure userlevel enum has filiado

Revision ID: 202411241710
Revises: 202411241700
Create Date: 2024-11-24 17:10:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "202411241710"
down_revision = "202411241700"
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()

    if conn.dialect.name == "postgresql":
        # Converte coluna para texto, normaliza para maiúsculo e recria o enum com os quatro valores
        op.execute(
            """
            ALTER TABLE users
            ALTER COLUMN level TYPE text
            USING upper(level::text);
            """
        )
        # Normaliza valor legado
        op.execute("UPDATE users SET level='FILIADO' WHERE level='VERIFIED';")
        op.execute("DROP TYPE IF EXISTS userlevel;")
        op.execute(
            "CREATE TYPE userlevel AS ENUM ('ANONYMOUS','REGISTERED','FILIADO','SPECIAL');"
        )
        op.execute(
            """
            ALTER TABLE users
            ALTER COLUMN level TYPE userlevel
            USING level::userlevel;
            """
        )
    else:
        # SQLite/outros: apenas normaliza para uppercase
        op.execute(
            "UPDATE users SET level=upper(level) WHERE level IS NOT NULL;"
        )


def downgrade():
    conn = op.get_bind()
    if conn.dialect.name == "postgresql":
        op.execute(
            """
            ALTER TABLE users
            ALTER COLUMN level TYPE text
            USING upper(level::text);
            """
        )
        op.execute("DROP TYPE IF EXISTS userlevel;")
        op.execute(
            "CREATE TYPE userlevel AS ENUM ('ANONYMOUS','REGISTERED','SPECIAL');"
        )
        op.execute(
            """
            ALTER TABLE users
            ALTER COLUMN level TYPE userlevel
            USING level::userlevel;
            """
        )
    else:
        op.execute(
            "UPDATE users SET level='REGISTERED' WHERE level='FILIADO';"
        )
