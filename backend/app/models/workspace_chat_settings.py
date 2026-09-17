from sqlalchemy import (
    Column,
    Integer,
    Boolean,
    String,
    DateTime,
    ForeignKey,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.database import Base


class WorkspaceChatSettings(Base):

    __tablename__ = "workspace_chat_settings"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # =====================================================
    # WORKSPACE
    # =====================================================

    workspace_id = Column(
        Integer,
        ForeignKey(
            "workspaces.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        unique=True,
        index=True,
    )

    # =====================================================
    # CONVERSATION HISTORY
    # =====================================================

    conversation_history_enabled = Column(
        Boolean,
        nullable=False,
        default=True,
    )

    # =====================================================
    # RESPONSE PREFERENCE
    # =====================================================

    response_preference = Column(
        String(20),
        nullable=False,
        default="balanced",
    )

    # =====================================================
    # TIMESTAMPS
    # =====================================================

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    # =====================================================
    # RELATIONSHIP
    # =====================================================

    workspace = relationship(
        "Workspace",
        back_populates="chat_settings",
    )