from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    Text,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.database import Base


class Conversation(Base):

    __tablename__ = "conversations"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # ==========================================
    # OWNER
    # ==========================================

    user_id = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    # ==========================================
    # WORKSPACE
    # ==========================================

    workspace_id = Column(
        Integer,
        ForeignKey(
            "workspaces.id",
            ondelete="CASCADE",
        ),
        nullable=True,
        index=True,
    )

    # ==========================================
    # SESSION
    # ==========================================

    session_id = Column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
    )

    # ==========================================
    # TITLE
    # ==========================================

    title = Column(
        String(255),
        nullable=False,
        default="New conversation",
    )

    # ==========================================
    # TIMESTAMPS
    # ==========================================

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    last_message_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True,
    )

    # ==========================================
    # RELATIONSHIPS
    # ==========================================

    user = relationship(
        "User",
        back_populates="conversations",
    )

    messages = relationship(
        "ConversationMessage",
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="ConversationMessage.created_at",
    )