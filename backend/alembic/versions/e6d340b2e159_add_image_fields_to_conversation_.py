"""add image fields to conversation messages

Revision ID: e6d340b2e159
Revises: ced075fd3272
Create Date: 2026-09-08 17:32:46.822900

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "e6d340b2e159"

down_revision: Union[str, Sequence[str], None] = "ced075fd3272"

branch_labels: Union[str, Sequence[str], None] = None

depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add image-related fields to conversation messages."""

    op.add_column(
        "conversation_messages",
        sa.Column(
            "message_type",
            sa.String(length=20),
            nullable=False,
            server_default="text",
        ),
    )

    op.add_column(
        "conversation_messages",
        sa.Column(
            "image_url",
            sa.String(length=1000),
            nullable=True,
        ),
    )

    op.add_column(
        "conversation_messages",
        sa.Column(
            "image_prompt",
            sa.Text(),
            nullable=True,
        ),
    )

    op.add_column(
        "conversation_messages",
        sa.Column(
            "image_model",
            sa.String(length=100),
            nullable=True,
        ),
    )


def downgrade() -> None:
    """Remove image-related fields from conversation messages."""

    op.drop_column(
        "conversation_messages",
        "image_model",
    )

    op.drop_column(
        "conversation_messages",
        "image_prompt",
    )

    op.drop_column(
        "conversation_messages",
        "image_url",
    )

    op.drop_column(
        "conversation_messages",
        "message_type",
    )