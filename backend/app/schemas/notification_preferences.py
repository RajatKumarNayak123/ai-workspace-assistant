from pydantic import BaseModel


class NotificationPreferencesResponse(BaseModel):

    email_security_alerts: bool
    email_account_activity: bool
    email_workspace_activity: bool
    email_document_processing: bool
    email_product_updates: bool

    in_app_chat: bool
    in_app_workspace_activity: bool
    in_app_document_processing: bool
    in_app_system: bool

    do_not_disturb: bool
    quiet_hours_enabled: bool


class NotificationPreferencesUpdateRequest(BaseModel):

    email_security_alerts: bool | None = None
    email_account_activity: bool | None = None
    email_workspace_activity: bool | None = None
    email_document_processing: bool | None = None
    email_product_updates: bool | None = None

    in_app_chat: bool | None = None
    in_app_workspace_activity: bool | None = None
    in_app_document_processing: bool | None = None
    in_app_system: bool | None = None

    do_not_disturb: bool | None = None
    quiet_hours_enabled: bool | None = None