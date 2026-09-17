from sqlalchemy.orm import Session

from app.models.workspace import Workspace
from app.models.workspace_chat_settings import (
    WorkspaceChatSettings,
)


class WorkspaceChatSettingsService:

    # =========================================
    # DEFAULT VALUES
    # =========================================

    DEFAULT_CONVERSATION_HISTORY_ENABLED = True

    DEFAULT_RESPONSE_PREFERENCE = "balanced"

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
        # Find Chat settings
        # -------------------------------------

        settings = (
            db.query(WorkspaceChatSettings)
            .filter(
                WorkspaceChatSettings.workspace_id
                == workspace_id
            )
            .first()
        )

        # -------------------------------------
        # Create default settings if missing
        # -------------------------------------

        if not settings:

            settings = WorkspaceChatSettings(

                workspace_id=workspace_id,

                conversation_history_enabled=(
                    WorkspaceChatSettingsService
                    .DEFAULT_CONVERSATION_HISTORY_ENABLED
                ),

                response_preference=(
                    WorkspaceChatSettingsService
                    .DEFAULT_RESPONSE_PREFERENCE
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
        conversation_history_enabled: bool,
        response_preference: str,
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
            db.query(WorkspaceChatSettings)
            .filter(
                WorkspaceChatSettings.workspace_id
                == workspace_id
            )
            .first()
        )

        # -------------------------------------
        # Create if missing
        # -------------------------------------

        if not settings:

            settings = WorkspaceChatSettings(
                workspace_id=workspace_id,
            )

            db.add(settings)

        # -------------------------------------
        # Update values
        # -------------------------------------

        settings.conversation_history_enabled = (
            conversation_history_enabled
        )

        settings.response_preference = (
            response_preference
        )

        # -------------------------------------
        # Save
        # -------------------------------------

        db.commit()

        db.refresh(settings)

        return settings