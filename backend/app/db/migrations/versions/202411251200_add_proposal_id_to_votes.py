"""add proposal_id to votes and backfill

Revision ID: 202411251200
Revises: 202411241720
Create Date: 2025-11-25 12:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "202411251200"
down_revision = "202411241720"
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()

    if conn.dialect.name == "postgresql":
        # Add column only if missing
        op.execute(
            """
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name='votes' AND column_name='proposal_id'
                ) THEN
                    ALTER TABLE votes ADD COLUMN proposal_id INTEGER;
                END IF;
            END$$;
            """
        )
        # Add FK only if missing
        op.execute(
            """
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints
                    WHERE table_name='votes' AND constraint_name='fk_votes_proposal_id'
                ) THEN
                    ALTER TABLE votes
                    ADD CONSTRAINT fk_votes_proposal_id
                    FOREIGN KEY (proposal_id) REFERENCES proposals(id);
                END IF;
            END$$;
            """
        )
        # Backfill proposal_id from sessions when null
        op.execute(
            """
            UPDATE votes v
            SET proposal_id = vs.proposal_id
            FROM voting_sessions vs
            WHERE v.session_id = vs.id AND v.proposal_id IS NULL;
            """
        )
        # Enforce not null if data is consistent
        op.execute(
            """
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM votes WHERE proposal_id IS NULL
                ) THEN
                    RAISE NOTICE 'Há votos sem proposal_id; corrija-os antes de aplicar NOT NULL.';
                ELSE
                    ALTER TABLE votes ALTER COLUMN proposal_id SET NOT NULL;
                END IF;
            END$$;
            """
        )
    else:
        op.add_column("votes", sa.Column("proposal_id", sa.Integer(), nullable=True))
        op.create_foreign_key(
            "fk_votes_proposal_id",
            "votes",
            "proposals",
            ["proposal_id"],
            ["id"],
        )
        op.execute(
            """
            UPDATE votes
            SET proposal_id = (
                SELECT proposal_id FROM voting_sessions vs
                WHERE vs.id = votes.session_id
            )
            WHERE proposal_id IS NULL;
            """
        )
        op.alter_column("votes", "proposal_id", nullable=False)


def downgrade() -> None:
    op.drop_constraint("fk_votes_proposal_id", "votes", type_="foreignkey")
    op.drop_column("votes", "proposal_id")
