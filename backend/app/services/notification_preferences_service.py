from sqlalchemy.orm import Session

from app.models.notification_preferences import (
    NotificationPreferences,
)
from app.schemas.notification_preferences import (
    NotificationPreferencesUpdateRequest,
)


class NotificationPreferencesService:

    # ======================================================
    # DEFAULT PREFERENCES
    # ======================================================

    @staticmethod
    def create_default_preferences(
        db: Session,
        user_id: int,
    ) -> NotificationPreferences:

        preferences = NotificationPreferences(
            user_id=user_id,

            # ------------------------------------------------
            # EMAIL
            # ------------------------------------------------

            email_security_alerts=True,
            email_account_activity=True,
            email_workspace_activity=True,
            email_document_processing=True,
            email_product_updates=False,

            # ------------------------------------------------
            # IN-APP
            # ------------------------------------------------

            in_app_chat=True,
            in_app_workspace_activity=True,
            in_app_document_processing=True,
            in_app_system=True,

            # ------------------------------------------------
            # PRIVACY / AVAILABILITY
            # ------------------------------------------------

            do_not_disturb=False,
            quiet_hours_enabled=False,
        )

        db.add(preferences)
        db.commit()
        db.refresh(preferences)

        return preferences


    # ======================================================
    # GET USER PREFERENCES
    # ======================================================

    @staticmethod
    def get_preferences(
        db: Session,
        user_id: int,
    ) -> NotificationPreferences:

        preferences = (
            db.query(NotificationPreferences)
            .filter(
                NotificationPreferences.user_id
                == user_id
            )
            .first()
        )

        # --------------------------------------------------
        # CREATE DEFAULTS IF NOT FOUND
        # --------------------------------------------------

        if preferences is None:

            preferences = (
                NotificationPreferencesService
                .create_default_preferences(
                    db=db,
                    user_id=user_id,
                )
            )

        return preferences


    # ======================================================
    # UPDATE USER PREFERENCES
    # ======================================================

    @staticmethod
    def update_preferences(
        db: Session,
        user_id: int,
        request: NotificationPreferencesUpdateRequest,
    ) -> NotificationPreferences:

        preferences = (
            NotificationPreferencesService
            .get_preferences(
                db=db,
                user_id=user_id,
            )
        )

        # ==================================================
        # EMAIL NOTIFICATIONS
        # ==================================================

        if request.email_security_alerts is not None:

            preferences.email_security_alerts = (
                request.email_security_alerts
            )

        if request.email_account_activity is not None:

            preferences.email_account_activity = (
                request.email_account_activity
            )

        if request.email_workspace_activity is not None:

            preferences.email_workspace_activity = (
                request.email_workspace_activity
            )

        if request.email_document_processing is not None:

            preferences.email_document_processing = (
                request.email_document_processing
            )

        if request.email_product_updates is not None:

            preferences.email_product_updates = (
                request.email_product_updates
            )

        # ==================================================
        # IN-APP NOTIFICATIONS
        # ==================================================

        if request.in_app_chat is not None:

            preferences.in_app_chat = (
                request.in_app_chat
            )

        if request.in_app_workspace_activity is not None:

            preferences.in_app_workspace_activity = (
                request.in_app_workspace_activity
            )

        if request.in_app_document_processing is not None:

            preferences.in_app_document_processing = (
                request.in_app_document_processing
            )

        if request.in_app_system is not None:

            preferences.in_app_system = (
                request.in_app_system
            )

        # ==================================================
        # DO NOT DISTURB
        # ==================================================

        if request.do_not_disturb is not None:

            preferences.do_not_disturb = (
                request.do_not_disturb
            )

        # ==================================================
        # QUIET HOURS
        # ==================================================

        if request.quiet_hours_enabled is not None:

            preferences.quiet_hours_enabled = (
                request.quiet_hours_enabled
            )

        # ==================================================
        # SAVE
        # ==================================================

        db.commit()
        db.refresh(preferences)

        return preferences