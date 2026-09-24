from langchain_core.documents import Document
from langchain_core.retrievers import BaseRetriever

from app.vectorstore.vector_service import VectorService


class RAGDocumentRetriever(BaseRetriever):
    """
    LangChain adapter around the existing VectorService.

    This class does NOT replace or modify VectorService.
    It simply converts VectorService's dictionary results
    into LangChain Document objects.
    """

    workspace_id: int
    top_k: int = 5
    document_ids: list[int] | None = None

    def _get_relevant_documents(self, query: str, *, run_manager) -> list[Document]:
        chunks = VectorService.search(
            query=query,
            workspace_id=self.workspace_id,
            top_k=self.top_k,
            document_ids=self.document_ids,
        )

        documents = []

        for chunk in chunks:
            documents.append(
                Document(
                    page_content=chunk["text"],
                    metadata={
                        "chunk_id": chunk["chunk_id"],
                        "filename": chunk["filename"],
                        "document_id": chunk["document_id"],
                        "workspace_id": chunk["workspace_id"],
                        "distance": chunk.get("distance"),
                    },
                )
            )

        return documents
