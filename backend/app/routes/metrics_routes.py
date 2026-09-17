from fastapi import (
    APIRouter, Query, Depends)
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.user import User
from app.security.authentication import get_current_user
from app.services.metrics_service import MetricsService


router = APIRouter(
    prefix="/metrics",
    tags=["Retrieval Metrics"],
)


# ==========================================
# SUMMARY
# ==========================================

@router.get("/summary")
def get_metrics_summary(
    workspace_id: int = Query(...),
    current_user: User = Depends(get_current_user),
):

    return {
        "success": True,
        "data":
            MetricsService.get_summary(
                user_id=current_user.id,
                workspace_id=workspace_id,
            ),
    }


# ==========================================
# RECENT METRICS
# ==========================================

@router.get("/recent")
def get_recent_metrics(
     workspace_id: int = Query(...),
    limit: int = Query(
        20,
        ge=1,
        le=100,
    ),
    current_user: User = Depends(get_current_user),
):

    return {
        "success": True,
        "data":
            MetricsService.get_recent(
                user_id=current_user.id,
                workspace_id=workspace_id,
                limit=limit,
            ),
    }


# ==========================================
# SESSION METRICS
# ==========================================

@router.get("/session/{session_id}")
def get_session_metrics(
    session_id: str,
    current_user: User = Depends(get_current_user),
):

    return {
        "success": True,
        "data":
            MetricsService.get_session_metrics(
                user_id=current_user.id,
                session_id=session_id,
            ),
    }