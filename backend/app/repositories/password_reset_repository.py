from sqlalchemy.orm import Session

from app.models.password_reset import PasswordResetRequest


class PasswordResetRepository:

    @staticmethod
    def create(
        db: Session,
        request: PasswordResetRequest,
    ):
        db.add(request)
        db.commit()
        db.refresh(request)

        return request

    @staticmethod
    def invalidate_previous_requests(
        db: Session,
        user_id: int,
    ):
        (
            db.query(PasswordResetRequest)
            .filter(
                PasswordResetRequest.user_id == user_id,
                PasswordResetRequest.used.is_(False),
            )
            .update(
                {
                    PasswordResetRequest.used: True,
                },
                synchronize_session=False,
            )
        )

        db.commit()

    
    @staticmethod
    def get_latest_by_user_id(
        db: Session,
        user_id: int,
    ):
        return (
            db.query(PasswordResetRequest)
            .filter(
                PasswordResetRequest.user_id == user_id,
                PasswordResetRequest.used.is_(False),
            )
            .order_by(
                PasswordResetRequest.created_at.desc()
            )
            .first()
        )


    @staticmethod
    def get_by_reset_token_hash(
        db: Session,
        reset_token_hash: str,
    ):
        return (
            db.query(PasswordResetRequest)
            .filter(
                PasswordResetRequest.reset_token_hash
                == reset_token_hash,
                PasswordResetRequest.used.is_(False),
            )
            .first()
        )