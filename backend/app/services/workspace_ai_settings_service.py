from sqlalchemy.orm import Session

from app.models.workspace import Workspace
from app.models.workspace_ai_settings import WorkspaceAISettings


class WorkspaceAISettingsService:

    DEFAULT_MODEL = "gemini-flash-latest"

    DEFAULT_TEMPERATURE = 0.2

    DEFAULT_MAX_TOKENS = 1024

    DEFAULT_SYSTEM_PROMPT = (
        "You are a helpful AI workspace assistant. "
        "Answer questions accurately using the provided context."
    )

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
        # Find AI settings
        # -------------------------------------

        settings = (
            db.query(WorkspaceAISettings)
            .filter(
                WorkspaceAISettings.workspace_id
                == workspace_id
            )
            .first()
        )

        # -------------------------------------
        # Create default settings if missing
        # -------------------------------------

        if not settings:

            settings = WorkspaceAISettings(

                workspace_id=workspace_id,

                model=(
                    WorkspaceAISettingsService
                    .DEFAULT_MODEL
                ),

                temperature=(
                    WorkspaceAISettingsService
                    .DEFAULT_TEMPERATURE
                ),

                max_tokens=(
                    WorkspaceAISettingsService
                    .DEFAULT_MAX_TOKENS
                ),

                system_prompt=(
                    WorkspaceAISettingsService
                    .DEFAULT_SYSTEM_PROMPT
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
        model: str,
        temperature: float,
        max_tokens: int,
        system_prompt: str,
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
            db.query(WorkspaceAISettings)
            .filter(
                WorkspaceAISettings.workspace_id
                == workspace_id
            )
            .first()
        )

        # -------------------------------------
        # Create if missing
        # -------------------------------------

        if not settings:

            settings = WorkspaceAISettings(
                workspace_id=workspace_id,
            )

            db.add(settings)

        # -------------------------------------
        # Update values
        # -------------------------------------

        settings.model = model

        settings.temperature = temperature

        settings.max_tokens = max_tokens

        settings.system_prompt = system_prompt

        # -------------------------------------
        # Save
        # -------------------------------------

        db.commit()

        db.refresh(settings)

        return settings