from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Boolean,
    ForeignKey,
)
from sqlalchemy.sql import func
from app.database.database import Base


class PasswordResetRequest(Base):

    __tablename__ = "password_reset_requests"

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

    # Hashed OTP
    otp_hash = Column(
        String(255),
        nullable=False,
    )

    # OTP expiry
    otp_expires_at = Column(
        DateTime(timezone=True),
        nullable=False,
    )

    # Number of wrong OTP attempts
    otp_attempts = Column(
        Integer,
        nullable=False,
        default=0,
    )

    # Becomes True after correct OTP verification
    otp_verified = Column(
        Boolean,
        nullable=False,
        default=False,
    )

    # Hashed temporary reset token
    reset_token_hash = Column(
        String(255),
        nullable=True,
    )

    # Reset token expiry
    reset_token_expires_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    # Becomes True after password has actually been changed
    used = Column(
        Boolean,
        nullable=False,
        default=False,
    )

    otp_last_sent_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )