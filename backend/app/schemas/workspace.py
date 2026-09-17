from pydantic import BaseModel


class WorkspaceCreateRequest(BaseModel):
    name: str
    description: str | None = None


class WorkspaceResponse(BaseModel):
    id: int
    name: str
    description: str | None
    owner_id: int

    class Config:
        from_attributes = True