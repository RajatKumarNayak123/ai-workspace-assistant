from sqlalchemy.orm import Session

from app.models.user_session import UserSession


class UserSessionRepository:

    @staticmethod
    def get_by_session_id(
        db: Session,
        session_id: str,
    ):
        return (
            db.query(UserSession)
            .filter(
                UserSession.session_id == session_id
            )
            .first()
        )


    @staticmethod
    def get_active_sessions_by_user_id(
        db: Session,
        user_id: int,
    ):
        return (
            db.query(UserSession)
            .filter(
                UserSession.user_id == user_id,
                UserSession.is_revoked == False,
            )
            .order_by(
                UserSession.last_active_at.desc()
            )
            .all()
        )


    @staticmethod
    def revoke_session(
        db: Session,
        session: UserSession,
    ):

        session.is_revoked = True

        db.commit()

        db.refresh(session)

        return session