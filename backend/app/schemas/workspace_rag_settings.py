from pydantic import BaseModel, Field


class WorkspaceRAGSettingsResponse(BaseModel):

    workspace_id: int

    query_rewriting_enabled: bool

    vector_enabled: bool
    vector_top_k: int

    bm25_enabled: bool
    bm25_top_k: int

    rrf_enabled: bool
    rrf_top_k: int

    reranker_enabled: bool
    reranker_top_k: int

    class Config:
        from_attributes = True


class WorkspaceRAGSettingsUpdateRequest(BaseModel):

    query_rewriting_enabled: bool = False

    vector_enabled: bool = True

    vector_top_k: int = Field(
        default=5,
        ge=1,
        le=20,
    )

    bm25_enabled: bool = True

    bm25_top_k: int = Field(
        default=5,
        ge=1,
        le=20,
    )

    rrf_enabled: bool = True

    rrf_top_k: int = Field(
        default=10,
        ge=1,
        le=20,
    )

    reranker_enabled: bool = True

    reranker_top_k: int = Field(
        default=4,
        ge=1,
        le=10,
    )