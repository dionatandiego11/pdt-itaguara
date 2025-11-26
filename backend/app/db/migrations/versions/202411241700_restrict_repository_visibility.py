"""restrict repository visibility to affiliates/public

Revision ID: 202411241700
Revises: 202411241535
Create Date: 2024-11-24 17:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "202411241700"
down_revision = "202411241535"
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()

    if conn.dialect.name == "postgresql":
        # 1) converte a coluna para texto, normalizando para minúsculo
        op.execute(
            """
            ALTER TABLE repositories
            ALTER COLUMN visibility TYPE text
            USING lower(visibility::text);
            """
        )
        # 2) remove o tipo antigo
        op.execute("DROP TYPE repositoryvisibility;")
        # 3) cria o novo tipo com apenas dois valores
        op.execute(
            "CREATE TYPE repositoryvisibility AS ENUM ('public','affiliates_only');"
        )
        # 4) ajusta legado "private" -> "affiliates_only"
        op.execute(
            "UPDATE repositories SET visibility='affiliates_only' WHERE visibility='private';"
        )
        # 5) aplica o novo tipo à coluna
        op.execute(
            """
            ALTER TABLE repositories
            ALTER COLUMN visibility TYPE repositoryvisibility
            USING visibility::repositoryvisibility;
            """
        )
    else:
        # SQLite/outros: apenas normaliza valores legados
        op.execute(
            "UPDATE repositories SET visibility='affiliates_only' WHERE visibility='private';"
        )


def downgrade():
    conn = op.get_bind()

    if conn.dialect.name == "postgresql":
        op.execute(
            """
            ALTER TABLE repositories
            ALTER COLUMN visibility TYPE text
            USING visibility::text;
            """
        )
        op.execute("DROP TYPE repositoryvisibility;")
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
