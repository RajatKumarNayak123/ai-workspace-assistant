"""add user id to retrieval metrics

Revision ID: 746550a9e32e
Revises: e6d340b2e159
Create Date: 2026-09-15 07:27:16.270963

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '746550a9e32e'
down_revision: Union[str, Sequence[str], None] = 'e6d340b2e159'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # ---------------------------------------------------------
    # 1. Add user_id temporarily as nullable
    # ---------------------------------------------------------
    op.add_column(
        "retrieval_metrics",
        sa.Column(
            "user_id",
            sa.Integer(),
            nullable=True,
        ),
    )

    # ---------------------------------------------------------
    # 2. Make sure every existing metric can be mapped
    #    to a workspace owner.
    # ---------------------------------------------------------
    connection = op.get_bind()

    missing_owner_count = connection.execute(
        sa.text(
            """
            SELECT COUNT(*)
            FROM retrieval_metrics rm
            LEFT JOIN workspaces w
                ON rm.workspace_id = w.id
            WHERE rm.user_id IS NULL
              AND (
                    w.id IS NULL
                    OR w.owner_id IS NULL
                  )
            """
        )
    ).scalar()

    if missing_owner_count and missing_owner_count > 0:
        raise RuntimeError(
            "Migration stopped: some existing retrieval_metrics "
            "records cannot be mapped to a workspace owner."
        )

    # ---------------------------------------------------------
    # 3. Backfill user_id from workspace owner
    # ---------------------------------------------------------
    connection.execute(
        sa.text(
            """
            UPDATE retrieval_metrics rm
            INNER JOIN workspaces w
                ON rm.workspace_id = w.id
            SET rm.user_id = w.owner_id
            WHERE rm.user_id IS NULL
            """
        )
    )

    # ---------------------------------------------------------
    # 4. user_id is now guaranteed for existing records
    #    Make the column NOT NULL.
    # ---------------------------------------------------------
    op.alter_column(
        "retrieval_metrics",
        "user_id",
        existing_type=sa.Integer(),
        nullable=False,
    )

    # ---------------------------------------------------------
    # 5. Add foreign key -> users.id
    # ---------------------------------------------------------
    op.create_foreign_key(
        "fk_retrieval_metrics_user_id_users",
        "retrieval_metrics",
        "users",
        ["user_id"],
        ["id"],
        ondelete="CASCADE",
    )

    # ---------------------------------------------------------
    # 6. Add index for user-based metric filtering
    # ---------------------------------------------------------
    op.create_index(
        "ix_retrieval_metrics_user_id",
        "retrieval_metrics",
        ["user_id"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""

    # Remove index
    op.drop_index(
        "ix_retrieval_metrics_user_id",
        table_name="retrieval_metrics",
    )

    # Remove foreign key
    op.drop_constraint(
        "fk_retrieval_metrics_user_id_users",
        "retrieval_metrics",
        type_="foreignkey",
    )

    # Remove column
    op.drop_column(
        "retrieval_metrics",
        "user_id",
    )