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


class ConversationMessage(Base):

    __tablename__ = "conversation_messages"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # ==========================================
    # CONVERSATION
    # ==========================================

    conversation_id = Column(
        Integer,
        ForeignKey(
            "conversations.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    # ==========================================
    # MESSAGE ROLE
    # ==========================================

    role = Column(
        String(20),
        nullable=False,
    )

    # user / assistant / system

    # ==========================================
    # CONTENT
    # ==========================================

    content = Column(
        Text,
        nullable=False,
    )

    # ==========================================
    # CITATIONS
    # ==========================================

    citations = Column(
        Text,
        nullable=True,
    )

    message_type = Column(
        String(20),
        nullable=False,
        default="text",
    )

    image_url = Column(
        String(1000),
        nullable=True,
    )

    image_prompt = Column(
        Text,
        nullable=True,
    )

    image_model = Column(
        String(100),
        nullable=True,
    )

    # JSON string for now.
    # Example:
    #
    # [
    #   {
    #       "filename": "resume.pdf",
    #       "chunk_id": 12
    #   }
    # ]

    # ==========================================
    # CREATED
    # ==========================================

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True,
    )

    # ==========================================
    # RELATIONSHIP
    # ==========================================

    conversation = relationship(
        "Conversation",
        back_populates="messages",
    )