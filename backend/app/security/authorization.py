from fastapi import Depends
from fastapi import HTTPException
from fastapi import status

from app.models.user import User
from app.security.authentication import get_current_user
from app.core.enums import UserRole


def require_admin(
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )

    return current_user


def require_user(
    current_user: User = Depends(get_current_user),
):
    return current_user