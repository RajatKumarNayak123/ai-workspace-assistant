from pydantic import BaseModel, Field


class WorkspaceAISettingsResponse(BaseModel):

    workspace_id: int

    model: str

    temperature: float

    max_tokens: int

    system_prompt: str

    class Config:
        from_attributes = True


class WorkspaceAISettingsUpdateRequest(BaseModel):

    model: str = Field(
        default="gemini-flash-latest",
        min_length=1,
        max_length=100,
    )

    temperature: float = Field(
        default=0.2,
        ge=0.0,
        le=1.0,
    )

    max_tokens: int = Field(
        default=1024,
        ge=128,
        le=8192,
    )

    system_prompt: str = Field(
        default=(
            "You are a helpful AI workspace assistant. "
            "Answer questions accurately using the provided context."
        ),
        min_length=1,
        max_length=10000,
    )