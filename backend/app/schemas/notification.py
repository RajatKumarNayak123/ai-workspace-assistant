from datetime import datetime

from pydantic import BaseModel


# ==========================================================
# NOTIFICATION RESPONSE
# ==========================================================

class NotificationResponse(BaseModel):

    id: int

    type: str

    title: str

    message: str

    is_read: bool

    target_type: str | None = None

    target_id: str | None = None

    created_at: datetime


# ==========================================================
# NOTIFICATION LIST RESPONSE
# ==========================================================

class NotificationListResponse(BaseModel):

    notifications: list[NotificationResponse]

    unread_count: int


# ==========================================================
# MARK AS READ RESPONSE
# ==========================================================

class NotificationReadResponse(BaseModel):

    success: bool

    message: str