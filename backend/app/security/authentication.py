from fastapi import Depends
from fastapi import HTTPException
from fastapi.security import HTTPBearer
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.repositories.user_repository import UserRepository
from app.security.jwt_handler import verify_access_token

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    token = credentials.credentials

    payload = verify_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid token",
        )

    email = payload.get("sub")

    if email is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid token",
        )

    session_id = payload.get("sid")

    if session_id is None:
        raise HTTPException(
            status_code=401,
            detail="Session ID missing from token.",
        )

    # =========================================
    # CHECK SESSION
    # =========================================

    from app.models.user_session import UserSession

    session = (
        db.query(UserSession)
        .filter(
            UserSession.session_id == session_id,
            UserSession.is_revoked == False,
        )
        .first()
    )

    if session is None:
        raise HTTPException(
            status_code=401,
            detail="Session is invalid or revoked.",
        )

    # =========================================
    # GET USER
    # =========================================

    user = UserRepository.get_by_email(
        db,
        email,
    )

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="User not found",
        )

    # =========================================
    # SECURITY CHECK
    # =========================================

    if session.user_id != user.id:
        raise HTTPException(
            status_code=401,
            detail="Session does not belong to this user.",
        )

    return user


def get_current_session(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):

    token = credentials.credentials

    payload = verify_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid token",
        )

    session_id = payload.get("sid")

    if session_id is None:
        raise HTTPException(
            status_code=401,
            detail="Session ID missing from token.",
        )

    from app.models.user_session import UserSession

    session = (
        db.query(UserSession)
        .filter(
            UserSession.session_id == session_id,
            UserSession.is_revoked == False,
        )
        .first()
    )

    if session is None:
        raise HTTPException(
            status_code=401,
            detail="Session is invalid or revoked.",
        )

    return session