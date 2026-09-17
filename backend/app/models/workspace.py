from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import ForeignKey
from sqlalchemy import DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.database import Base


class Workspace(Base):

    __tablename__ = "workspaces"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    name = Column(
        String(200),
        nullable=False,
    )

    description = Column(
        String(1000),
        nullable=True,
    )

    owner_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    owner = relationship(
        "User",
        back_populates="workspaces",
    )

    documents = relationship(
        "Document",
        back_populates="workspace",
        cascade="all, delete-orphan",
    )

    ai_settings = relationship(
        "WorkspaceAISettings",
        back_populates="workspace",
        uselist=False,
        cascade="all, delete-orphan",
    )

    rag_settings = relationship(
        "WorkspaceRAGSettings",
        back_populates="workspace",
        uselist=False,
        cascade="all, delete-orphan",
    )

    chat_settings = relationship(
        "WorkspaceChatSettings",
        back_populates="workspace",
        uselist=False,
        cascade="all, delete-orphan",
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )