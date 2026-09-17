from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Text,
    DateTime,
    JSON,
    ForeignKey,
)

from app.database.database import Base


class RetrievalMetric(Base):

    __tablename__ = "retrieval_metrics"

    # ==========================================
    # Primary Key
    # ==========================================

    id = Column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True,
    )

    user_id = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,  
    )

    # ==========================================
    # Conversation Information
    # ==========================================

    session_id = Column(
        String(255),
        nullable=False,
        index=True,
    )

    workspace_id = Column(
        Integer,
        nullable=False,
        index=True,
    )

    question = Column(
        Text,
        nullable=False,
    )

    # ==========================================
    # Retrieval Pipeline
    # ==========================================

    vector_hits = Column(
        Integer,
        default=0,
        nullable=False,
    )

    bm25_hits = Column(
        Integer,
        default=0,
        nullable=False,
    )

    rrf_selected = Column(
        Integer,
        default=0,
        nullable=False,
    )

    reranked = Column(
        Integer,
        default=0,
        nullable=False,
    )

    # ==========================================
    # Detailed Retrieval Results
    # ==========================================

    retrieved_chunks = Column(
        JSON,
        nullable=True,
    )

    # ==========================================
    # Performance
    # ==========================================

    response_time = Column(
        Float,
        nullable=True,
    )

    # ==========================================
    # AI Model
    # ==========================================

    llm_model = Column(
        String(100),
        nullable=True,
    )

    # ==========================================
    # Status
    # ==========================================

    status = Column(
        String(30),
        default="success",
        nullable=False,
    )

    error_message = Column(
        Text,
        nullable=True,
    )

    # ==========================================
    # Timestamp
    # ==========================================

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True,
    )