from typing import Optional

from pydantic import BaseModel, Field


class ImageChatResponse(BaseModel):
    session_id: str
    message_id: int
    answer: str

    message_type: str = "image"

    image_url: str
    image_prompt: str
    image_model: str