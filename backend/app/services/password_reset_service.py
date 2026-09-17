import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.config.settings import settings
from app.models.user import User
from app.models.password_reset import PasswordResetRequest

from app.repositories.user_repository import UserRepository
from app.repositories.password_reset_repository import (
    PasswordResetRepository,
)

from app.security.password import hash_password
from app.core.exceptions.business_exception import BusinessException
from app.services.email_service import EmailService


class PasswordResetService:

    # ==========================================================
    # Utility Methods
    # ==========================================================

    @staticmethod
    def _hash_value(value: str) -> str:
        return hashlib.sha256(
            value.encode("utf-8")
        ).hexdigest()

    @staticmethod
    def _ensure_utc(value):
        if value is None:
            return None

        if value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)

        return value.astimezone(timezone.utc)

    # ==========================================================
    # Create + Send OTP
    # ==========================================================

    @staticmethod
    def _create_and_send_otp(
        db: Session,
        user: User,
    ):

        # Invalidate previous pending reset requests
        PasswordResetRepository.invalidate_previous_requests(
            db,
            user.id,
        )

        # Generate 6 digit OTP
        otp = f"{secrets.randbelow(1_000_000):06d}"

        # Hash OTP before storing
        otp_hash = PasswordResetService._hash_value(
            otp
        )

        # Current UTC time
        now = datetime.now(timezone.utc)

        # OTP expiry
        otp_expires_at = (
            now
            + timedelta(
                minutes=settings.PASSWORD_RESET_OTP_EXPIRE_MINUTES
            )
        )

        # Create new password reset request
        reset_request = PasswordResetRequest(
            user_id=user.id,
            otp_hash=otp_hash,
            otp_expires_at=otp_expires_at,
            otp_last_sent_at=now,
            otp_attempts=0,
            otp_verified=False,
            reset_token_hash=None,
            reset_token_expires_at=None,
            used=False,
        )

        PasswordResetRepository.create(
            db,
            reset_request,
        )

        # Send OTP email
        EmailService.send_email(
            to_email=user.email,
            subject="AI Workspace Assistant - Password Reset OTP",
            body=(
                f"Hello {user.full_name},\n\n"
                f"Your password reset OTP is: {otp}\n\n"
                f"This OTP is valid for "
                f"{settings.PASSWORD_RESET_OTP_EXPIRE_MINUTES} minutes.\n\n"
                "If you did not request a password reset, "
                "please ignore this email.\n\n"
                "AI Workspace Assistant"
            ),
        )

    # ==========================================================
    # Request Password Reset
    # ==========================================================

    @staticmethod
    def request_password_reset(
        db: Session,
        email: str,
    ):
        user = UserRepository.get_by_email(
            db,
            email,
        )

        # Do not reveal whether email exists.
        if not user:
            return {
                "message": (
                    "If the email is registered, "
                    "a password reset OTP has been sent."
                )
            }

        if not user.is_active:
            return {
                "message": (
                    "If the email is registered, "
                    "a password reset OTP has been sent."
                )
            }

        # Get latest password reset request
        reset_request = (
            PasswordResetRepository.get_latest_by_user_id(
                db,
                user.id,
            )
        )

        # Check OTP cooldown
        if reset_request:
            now = datetime.now(timezone.utc)

            last_sent_at = PasswordResetService._ensure_utc(
                reset_request.otp_last_sent_at
            )

            if last_sent_at is not None:
                cooldown_seconds = (
                    settings.PASSWORD_RESET_OTP_COOLDOWN_SECONDS
                )

                elapsed_seconds = (
                    now - last_sent_at
                ).total_seconds()

                if elapsed_seconds < cooldown_seconds:
                    remaining_seconds = int(
                        cooldown_seconds - elapsed_seconds
                    )

                    raise BusinessException(
                        f"Please wait {remaining_seconds} seconds "
                        "before requesting a new OTP."
                    )

        # Send new OTP
        PasswordResetService._create_and_send_otp(
            db,
            user,
        )

        return {
            "message": (
                "If the email is registered, "
                "a password reset OTP has been sent."
            )
        }

    # ==========================================================
    # Resend OTP
    # ==========================================================

    @staticmethod
    def resend_otp(
        db: Session,
        email: str,
    ):

        user = UserRepository.get_by_email(
            db,
            email,
        )

        # Do not reveal whether email exists
        if not user:

            return {
                "message": (
                    "If the email is registered, "
                    "a new password reset OTP has been sent."
                )
            }

        # Do not reveal inactive account
        if not user.is_active:

            return {
                "message": (
                    "If the email is registered, "
                    "a new password reset OTP has been sent."
                )
            }

        # Get latest reset request
        reset_request = (
            PasswordResetRepository.get_latest_by_user_id(
                db,
                user.id,
            )
        )

        if not reset_request:

            raise BusinessException(
                "Please request a password reset first."
            )

        # Do not allow resend after successful OTP verification
        if reset_request.otp_verified:

            raise BusinessException(
                "OTP has already been verified. "
                "Please continue with password reset."
            )

        # ======================================================
        # RESEND COOLDOWN CHECK
        # ======================================================

        now = datetime.now(timezone.utc)

        last_sent_at = PasswordResetService._ensure_utc(
            reset_request.otp_last_sent_at
        )

        if last_sent_at is not None:

            cooldown_seconds = (
                settings.PASSWORD_RESET_RESEND_COOLDOWN_SECONDS
            )

            elapsed_seconds = (
                now - last_sent_at
            ).total_seconds()

            if elapsed_seconds < cooldown_seconds:

                remaining_seconds = int(
                    cooldown_seconds - elapsed_seconds
                )

                raise BusinessException(
                    f"Please wait {remaining_seconds} seconds "
                    "before requesting a new OTP."
                )

        # ======================================================
        # SEND NEW OTP
        # ======================================================

        PasswordResetService._create_and_send_otp(
            db,
            user,
        )

        return {
            "message": (
                "If the email is registered, "
                "a new password reset OTP has been sent."
            )
        }

    # ==========================================================
    # Verify OTP
    # ==========================================================

    @staticmethod
    def verify_otp(
        db: Session,
        email: str,
        otp: str,
    ):

        user = UserRepository.get_by_email(
            db,
            email,
        )

        if not user:

            raise BusinessException(
                "Invalid or expired OTP."
            )

        reset_request = (
            PasswordResetRepository.get_latest_by_user_id(
                db,
                user.id,
            )
        )

        if not reset_request:

            raise BusinessException(
                "Invalid or expired OTP."
            )

        # Already verified
        if reset_request.otp_verified:

            raise BusinessException(
                "OTP has already been verified."
            )

        now = datetime.now(timezone.utc)

        otp_expires_at = (
            PasswordResetService._ensure_utc(
                reset_request.otp_expires_at
            )
        )

        # Check expiry
        if now > otp_expires_at:

            raise BusinessException(
                "OTP has expired."
            )

        # Check maximum attempts
        if (
            reset_request.otp_attempts
            >= settings.PASSWORD_RESET_MAX_OTP_ATTEMPTS
        ):

            raise BusinessException(
                "Maximum OTP attempts exceeded."
            )

        # Hash submitted OTP
        otp_hash = PasswordResetService._hash_value(
            otp
        )

        # Wrong OTP
        if otp_hash != reset_request.otp_hash:

            reset_request.otp_attempts += 1

            db.commit()

            remaining = (
                settings.PASSWORD_RESET_MAX_OTP_ATTEMPTS
                - reset_request.otp_attempts
            )

            if remaining <= 0:

                raise BusinessException(
                    "Maximum OTP attempts exceeded."
                )

            raise BusinessException(
                f"Invalid OTP. {remaining} attempts remaining."
            )

        # ======================================================
        # OTP CORRECT
        # ======================================================

        reset_token = secrets.token_urlsafe(32)

        reset_token_hash = (
            PasswordResetService._hash_value(
                reset_token
            )
        )

        reset_token_expires_at = (
            now
            + timedelta(
                minutes=settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES
            )
        )

        reset_request.otp_verified = True

        reset_request.reset_token_hash = (
            reset_token_hash
        )

        reset_request.reset_token_expires_at = (
            reset_token_expires_at
        )

        db.commit()

        return {
            "message": "OTP verified successfully.",
            "reset_token": reset_token,
        }

    # ==========================================================
    # Reset Password
    # ==========================================================

    @staticmethod
    def reset_password(
        db: Session,
        reset_token: str,
        new_password: str,
        confirm_password: str,
    ):

        # ======================================================
        # Confirm Password
        # ======================================================

        if new_password != confirm_password:

            raise BusinessException(
                "New password and confirm password do not match."
            )

        # ======================================================
        # Find Reset Request
        # ======================================================

        reset_token_hash = (
            PasswordResetService._hash_value(
                reset_token
            )
        )

        reset_request = (
            PasswordResetRepository.get_by_reset_token_hash(
                db,
                reset_token_hash,
            )
        )

        if not reset_request:

            raise BusinessException(
                "Invalid or expired reset token."
            )

        # OTP must be verified
        if not reset_request.otp_verified:

            raise BusinessException(
                "OTP verification required."
            )

        now = datetime.now(timezone.utc)

        reset_token_expires_at = (
            PasswordResetService._ensure_utc(
                reset_request.reset_token_expires_at
            )
        )

        # Check reset token expiry
        if (
            reset_token_expires_at is None
            or now > reset_token_expires_at
        ):

            raise BusinessException(
                "Reset token has expired."
            )

        # Already used
        if reset_request.used:

            raise BusinessException(
                "Reset token has already been used."
            )

        # ======================================================
        # Find User
        # ======================================================

        user = UserRepository.get_by_id(
            db,
            reset_request.user_id,
        )

        if not user:

            raise BusinessException(
                "User not found."
            )

        # ======================================================
        # Update Password
        # ======================================================

        user.password = hash_password(
            new_password
        )

        # Consume current reset request
        reset_request.used = True

        db.commit()

        # Invalidate any other pending reset requests
        PasswordResetRepository.invalidate_previous_requests(
            db=db,
            user_id=reset_request.user_id,
        )

        return {
            "message": "Password reset successfully."
        }