from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)

from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.database import Base


class Notification(Base):

    __tablename__ = "notifications"

    # =====================================================
    # PRIMARY KEY
    # =====================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # =====================================================
    # USER
    # =====================================================

    user_id = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    # =====================================================
    # NOTIFICATION TYPE
    # =====================================================

    type = Column(
        String(50),
        nullable=False,
        index=True,
    )

    # Examples:
    #
    # chat
    # workspace
    # document
    # system
    # security

    # =====================================================
    # TITLE
    # =====================================================

    title = Column(
        String(255),
        nullable=False,
    )

    # =====================================================
    # MESSAGE
    # =====================================================

    message = Column(
        Text,
        nullable=False,
    )

    # =====================================================
    # READ STATUS
    # =====================================================

    is_read = Column(
        Boolean,
        default=False,
        nullable=False,
        index=True,
    )

    # =====================================================
    # OPTIONAL LINK / TARGET
    # =====================================================

    target_type = Column(
        String(50),
        nullable=True,
    )

    target_id = Column(
        String(100),
        nullable=True,
    )

    # =====================================================
    # CREATED
    # =====================================================

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True,
    )

    # =====================================================
    # RELATIONSHIP
    # =====================================================

    user = relationship(
        "User",
        back_populates="notifications",
    )