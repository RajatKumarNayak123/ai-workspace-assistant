from typing import Literal

from pydantic import BaseModel


class WorkspaceChatSettingsResponse(BaseModel):

    workspace_id: int

    conversation_history_enabled: bool

    response_preference: Literal[
        "concise",
        "balanced",
        "detailed",
    ]

    class Config:
        from_attributes = True


class WorkspaceChatSettingsUpdateRequest(BaseModel):

    conversation_history_enabled: bool = True

    response_preference: Literal[
        "concise",
        "balanced",
        "detailed",
    ] = "balanced"