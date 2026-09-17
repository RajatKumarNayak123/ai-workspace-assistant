from sqlalchemy.orm import Session

from app.models.workspace import Workspace
from app.models.workspace_rag_settings import (
    WorkspaceRAGSettings,
)


class WorkspaceRAGSettingsService:

    # =========================================
    # DEFAULT VALUES
    # =========================================

    DEFAULT_QUERY_REWRITING_ENABLED = False

    DEFAULT_VECTOR_ENABLED = True
    DEFAULT_VECTOR_TOP_K = 5

    DEFAULT_BM25_ENABLED = True
    DEFAULT_BM25_TOP_K = 5

    DEFAULT_RRF_ENABLED = True
    DEFAULT_RRF_TOP_K = 10

    DEFAULT_RERANKER_ENABLED = True
    DEFAULT_RERANKER_TOP_K = 4

    # =========================================
    # GET SETTINGS
    # =========================================

    @staticmethod
    def get_settings(
        db: Session,
        workspace_id: int,
    ):

        # -------------------------------------
        # Check workspace
        # -------------------------------------

        workspace = (
            db.query(Workspace)
            .filter(
                Workspace.id == workspace_id
            )
            .first()
        )

        if not workspace:

            raise ValueError(
                "Workspace not found."
            )

        # -------------------------------------
        # Find RAG settings
        # -------------------------------------

        settings = (
            db.query(WorkspaceRAGSettings)
            .filter(
                WorkspaceRAGSettings.workspace_id
                == workspace_id
            )
            .first()
        )

        # -------------------------------------
        # Create default settings if missing
        # -------------------------------------

        if not settings:

            settings = WorkspaceRAGSettings(

                workspace_id=workspace_id,

                query_rewriting_enabled=(
                    WorkspaceRAGSettingsService
                    .DEFAULT_QUERY_REWRITING_ENABLED
                ),

                vector_enabled=(
                    WorkspaceRAGSettingsService
                    .DEFAULT_VECTOR_ENABLED
                ),

                vector_top_k=(
                    WorkspaceRAGSettingsService
                    .DEFAULT_VECTOR_TOP_K
                ),

                bm25_enabled=(
                    WorkspaceRAGSettingsService
                    .DEFAULT_BM25_ENABLED
                ),

                bm25_top_k=(
                    WorkspaceRAGSettingsService
                    .DEFAULT_BM25_TOP_K
                ),

                rrf_enabled=(
                    WorkspaceRAGSettingsService
                    .DEFAULT_RRF_ENABLED
                ),

                rrf_top_k=(
                    WorkspaceRAGSettingsService
                    .DEFAULT_RRF_TOP_K
                ),

                reranker_enabled=(
                    WorkspaceRAGSettingsService
                    .DEFAULT_RERANKER_ENABLED
                ),

                reranker_top_k=(
                    WorkspaceRAGSettingsService
                    .DEFAULT_RERANKER_TOP_K
                ),
            )

            db.add(settings)

            db.commit()

            db.refresh(settings)

        return settings

    # =========================================
    # UPDATE SETTINGS
    # =========================================

    @staticmethod
    def update_settings(
        db: Session,
        workspace_id: int,
        query_rewriting_enabled: bool,
        vector_enabled: bool,
        vector_top_k: int,
        bm25_enabled: bool,
        bm25_top_k: int,
        rrf_enabled: bool,
        rrf_top_k: int,
        reranker_enabled: bool,
        reranker_top_k: int,
    ):

        # -------------------------------------
        # Check workspace
        # -------------------------------------

        workspace = (
            db.query(Workspace)
            .filter(
                Workspace.id == workspace_id
            )
            .first()
        )

        if not workspace:

            raise ValueError(
                "Workspace not found."
            )

        # -------------------------------------
        # Find existing settings
        # -------------------------------------

        settings = (
            db.query(WorkspaceRAGSettings)
            .filter(
                WorkspaceRAGSettings.workspace_id
                == workspace_id
            )
            .first()
        )

        # -------------------------------------
        # Create if missing
        # -------------------------------------

        if not settings:

            settings = WorkspaceRAGSettings(
                workspace_id=workspace_id,
            )

            db.add(settings)

        # -------------------------------------
        # Update values
        # -------------------------------------

        settings.query_rewriting_enabled = (
            query_rewriting_enabled
        )

        settings.vector_enabled = vector_enabled

        settings.vector_top_k = vector_top_k

        settings.bm25_enabled = bm25_enabled

        settings.bm25_top_k = bm25_top_k

        settings.rrf_enabled = rrf_enabled

        settings.rrf_top_k = rrf_top_k

        settings.reranker_enabled = reranker_enabled

        settings.reranker_top_k = reranker_top_k

        # -------------------------------------
        # Save
        # -------------------------------------

        db.commit()

        db.refresh(settings)

        return settings