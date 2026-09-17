from pydantic import BaseModel


class RagPipelineResponse(BaseModel):

    original_query: str

    rewritten_query: str

    vector_hits: int

    bm25_hits: int

    rrf_selected: int

    reranked: int

    llm_model: str