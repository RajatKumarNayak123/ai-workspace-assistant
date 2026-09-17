from sqlalchemy import (
    Boolean,
    Column,
    ForeignKey,
    Integer,
)
from sqlalchemy.orm import relationship

from app.database.database import Base


class NotificationPreferences(Base):

    __tablename__ = "notification_preferences"

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
        unique=True,
        index=True,
    )

    # =====================================================
    # EMAIL NOTIFICATIONS
    # =====================================================

    email_security_alerts = Column(
        Boolean,
        default=True,
        nullable=False,
    )

    email_account_activity = Column(
        Boolean,
        default=True,
        nullable=False,
    )

    email_workspace_activity = Column(
        Boolean,
        default=True,
        nullable=False,
    )

    email_document_processing = Column(
        Boolean,
        default=True,
        nullable=False,
    )

    email_product_updates = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    # =====================================================
    # IN-APP NOTIFICATIONS
    # =====================================================

    in_app_chat = Column(
        Boolean,
        default=True,
        nullable=False,
    )

    in_app_workspace_activity = Column(
        Boolean,
        default=True,
        nullable=False,
    )

    in_app_document_processing = Column(
        Boolean,
        default=True,
        nullable=False,
    )

    in_app_system = Column(
        Boolean,
        default=True,
        nullable=False,
    )

    # =====================================================
    # DO NOT DISTURB
    # =====================================================

    do_not_disturb = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    # =====================================================
    # QUIET HOURS
    # =====================================================

    quiet_hours_enabled = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    # =====================================================
    # RELATIONSHIP
    # =====================================================

    user = relationship(
        "User",
        back_populates="notification_preferences",
    )