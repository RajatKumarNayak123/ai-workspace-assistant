from sqlalchemy import (
    Column,
    Integer,
    Boolean,
    DateTime,
    ForeignKey,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.database import Base


class WorkspaceRAGSettings(Base):

    __tablename__ = "workspace_rag_settings"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    workspace_id = Column(
        Integer,
        ForeignKey(
            "workspaces.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        unique=True,
        index=True,
    )

    # =====================================================
    # QUERY REWRITING
    # =====================================================

    query_rewriting_enabled = Column(
        Boolean,
        nullable=False,
        default=False,
    )

    # =====================================================
    # VECTOR SEARCH
    # =====================================================

    vector_enabled = Column(
        Boolean,
        nullable=False,
        default=True,
    )

    vector_top_k = Column(
        Integer,
        nullable=False,
        default=5,
    )

    # =====================================================
    # BM25 SEARCH
    # =====================================================

    bm25_enabled = Column(
        Boolean,
        nullable=False,
        default=True,
    )

    bm25_top_k = Column(
        Integer,
        nullable=False,
        default=5,
    )

    # =====================================================
    # RECIPROCAL RANK FUSION
    # =====================================================

    rrf_enabled = Column(
        Boolean,
        nullable=False,
        default=True,
    )

    rrf_top_k = Column(
        Integer,
        nullable=False,
        default=10,
    )

    # =====================================================
    # CROSS ENCODER RERANKER
    # =====================================================

    reranker_enabled = Column(
        Boolean,
        nullable=False,
        default=True,
    )

    reranker_top_k = Column(
        Integer,
        nullable=False,
        default=4,
    )

    # =====================================================
    # TIMESTAMPS
    # =====================================================

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    # =====================================================
    # RELATIONSHIP
    # =====================================================

    workspace = relationship(
        "Workspace",
        back_populates="rag_settings",
    )