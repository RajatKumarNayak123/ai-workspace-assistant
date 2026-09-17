from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import DateTime
from sqlalchemy.sql import func
from sqlalchemy import Boolean
from app.database.database import Base
from sqlalchemy import Enum
from app.core.enums import UserRole
from sqlalchemy.orm import relationship
from app.models.user_session import UserSession

class User(Base):

    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    full_name = Column(
        String(100),
        nullable=False,
    )

    email = Column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )

    password = Column(
        String(255),
        nullable=False,
    )

    is_active = Column(
    Boolean,
    default=True,
    nullable=False,
    )

    role = Column(
    Enum(UserRole),
    nullable=False,
    default=UserRole.USER,
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


    workspaces = relationship(
    "Workspace",
    back_populates="owner",
    cascade="all, delete-orphan",
    )

    conversations = relationship(
    "Conversation",
    back_populates="user",
    cascade="all, delete-orphan",
    )

    notification_preferences = relationship(
    "NotificationPreferences",
    back_populates="user",
    uselist=False,
    cascade="all, delete-orphan",
    )

    notifications = relationship(
    "Notification",
    back_populates="user",
    cascade="all, delete-orphan",
    )

    sessions = relationship(
    "UserSession",
    back_populates="user",
    cascade="all, delete-orphan",
    )