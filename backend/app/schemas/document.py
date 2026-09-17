from pydantic import BaseModel
from datetime import datetime


class DocumentResponse(BaseModel):
    id: int
    filename: str
    file_type: str
    workspace_id: int
    created_at: datetime

    model_config = {
        "from_attributes": True
    }