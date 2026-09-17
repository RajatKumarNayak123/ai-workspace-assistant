from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Boolean,
    ForeignKey,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.database import Base


class UserSession(Base):

    __tablename__ = "user_sessions"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Unique identifier for this login session.
    # This ID will also be stored inside JWT as "sid".
    session_id = Column(
        String(64),
        unique=True,
        nullable=False,
        index=True,
    )

    device_type = Column(
        String(50),
        nullable=True,
    )

    device_name = Column(
        String(255),
        nullable=True,
    )

    browser = Column(
        String(100),
        nullable=True,
    )

    operating_system = Column(
        String(100),
        nullable=True,
    )

    ip_address = Column(
        String(100),
        nullable=True,
    )

    user_agent = Column(
        String(1000),
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    last_active_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    expires_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    is_revoked = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    user = relationship(
        "User",
        back_populates="sessions",
    )