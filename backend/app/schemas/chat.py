from pydantic import BaseModel, Field, field_validator


class ChatRequest(BaseModel):
    session_id: str = Field(
        ...,
        min_length=3,
        max_length=50,
        description="Unique Session ID"
    )

    workspace_id: int = Field(
        ...,
        gt=0,
        description="Workspace ID"
    )

    question: str = Field(
        ...,
        min_length=1,
        max_length=3000,
        description="User Question"
    )

    model: str | None = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Gemini model"
    )

    # ======================================================
    # ATTACHMENT FLAG
    # ======================================================

    has_attachments: bool = Field(
        default=False,
        description="Whether the user attached documents"
    )

    attachment_document_ids: list[int] = Field(
        default_factory=list,
        description="Document IDs of attached documents"
    )


    @field_validator("question")
    @classmethod
    def validate_question(cls, value: str):

        if not value.strip():
           raise ValueError("Question cannot be empty or whitespace.")

        return value


class ChatResponse(BaseModel):
    answer: str