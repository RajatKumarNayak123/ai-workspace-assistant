from unittest.mock import patch

from app.retrieval.langchain_retriever import RAGDocumentRetriever


def test_rag_document_retriever():
    fake_chunks = [
        {
            "chunk_id": "chunk_001",
            "text": "Spring Boot was used for the backend.",
            "filename": "Resume.pdf",
            "document_id": 10,
            "workspace_id": 1,
            "distance": 0.25,
        },
        {
            "chunk_id": "chunk_002",
            "text": "React.js was used for the frontend.",
            "filename": "Resume.pdf",
            "document_id": 10,
            "workspace_id": 1,
            "distance": 0.31,
        },
    ]

    with patch(
        "app.retrieval.langchain_retriever.VectorService.search",
        return_value=fake_chunks,
    ) as mock_search:

        retriever = RAGDocumentRetriever(
            workspace_id=1,
            top_k=5,
        )

        documents = retriever.invoke("What technologies were used?")

        mock_search.assert_called_once_with(
            query="What technologies were used?",
            workspace_id=1,
            top_k=5,
            document_ids=None,
        )

        assert len(documents) == 2
        assert documents[0].page_content == (
            "Spring Boot was used for the backend."
        )
        assert documents[0].metadata["chunk_id"] == "chunk_001"
        assert documents[0].metadata["filename"] == "Resume.pdf"
        assert documents[0].metadata["document_id"] == 10

        assert documents[1].page_content == (
            "React.js was used for the frontend."
        )
        assert documents[1].metadata["chunk_id"] == "chunk_002"

        print("Basic retriever test: PASS")


def test_rag_document_retriever_with_document_ids():
    fake_chunks = [
        {
            "chunk_id": "chunk_010",
            "text": "This content belongs to document 10.",
            "filename": "Document10.pdf",
            "document_id": 10,
            "workspace_id": 1,
            "distance": 0.20,
        }
    ]

    with patch(
        "app.retrieval.langchain_retriever.VectorService.search",
        return_value=fake_chunks,
    ) as mock_search:

        retriever = RAGDocumentRetriever(
            workspace_id=1,
            top_k=5,
            document_ids=[10, 20],
        )

        documents = retriever.invoke("What is in the selected documents?")

        mock_search.assert_called_once_with(
            query="What is in the selected documents?",
            workspace_id=1,
            top_k=5,
            document_ids=[10, 20],
        )

        assert len(documents) == 1
        assert documents[0].page_content == (
            "This content belongs to document 10."
        )
        assert documents[0].metadata["document_id"] == 10

        print("Document ID filtering test: PASS")


if __name__ == "__main__":
    test_rag_document_retriever()
    test_rag_document_retriever_with_document_ids()
