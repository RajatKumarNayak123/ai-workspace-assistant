from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Float
from sqlalchemy import Text
from sqlalchemy import ForeignKey
from sqlalchemy import DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.database import Base


class WorkspaceAISettings(Base):

    __tablename__ = "workspace_ai_settings"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    workspace_id = Column(
        Integer,
        ForeignKey("workspaces.id"),
        nullable=False,
        unique=True,
    )

    model = Column(
        String(100),
        nullable=False,
        default="gemini-flash-latest",
    )

    temperature = Column(
        Float,
        nullable=False,
        default=0.2,
    )

    max_tokens = Column(
        Integer,
        nullable=False,
        default=1024,
    )

    system_prompt = Column(
        Text,
        nullable=False,
        default=(
            "You are a helpful AI workspace assistant. "
            "Answer questions accurately using the provided context."
        ),
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

    workspace = relationship(
        "Workspace",
        back_populates="ai_settings",
    )