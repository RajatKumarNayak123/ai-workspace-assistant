from unittest.mock import patch

from langchain_core.runnables import RunnableLambda

from app.services.llm.lcel_rag_chain import build_rag_lcel_chain


def mock_gemini(prompt_value):
    messages = prompt_value.messages

    system_message = messages[0].content
    question = messages[-1].content

    return (
        f"Question: {question}\n"
        f"Spring Boot present: {'Spring Boot' in system_message}\n"
        f"React.js present: {'React.js' in system_message}\n"
        f"MySQL present: {'MySQL' in system_message}\n"
        f"Chunk ID present: {'chunk_001' in system_message}"
    )


def test_build_rag_lcel_chain_with_document_ids():
    fake_chunks = [
        {
            "chunk_id": "chunk_001",
            "text": "Spring Boot was used for the backend.",
            "filename": "VastraLok.pdf",
            "document_id": 101,
            "workspace_id": 1,
            "distance": 0.20,
        },
        {
            "chunk_id": "chunk_002",
            "text": (
                "React.js was used for the frontend and "
                "MySQL was used as the database."
            ),
            "filename": "VastraLok.pdf",
            "document_id": 101,
            "workspace_id": 1,
            "distance": 0.25,
        },
    ]

    mock_llm = RunnableLambda(mock_gemini)

    with patch(
        "app.retrieval.langchain_retriever.VectorService.search",
        return_value=fake_chunks,
    ) as mock_search, patch(
        "app.services.llm.lcel_rag_chain.GeminiService.get_llm",
        return_value=mock_llm,
    ):

        chain = build_rag_lcel_chain(
            workspace_id=1,
            top_k=5,
            document_ids=[101],
        )

        result = chain.invoke(
            "What technologies were used in VastraLok?"
        )

        mock_search.assert_called_once_with(
            query="What technologies were used in VastraLok?",
            workspace_id=1,
            top_k=5,
            document_ids=[101],
        )

        assert "What technologies were used in VastraLok?" in result
        assert "Spring Boot present: True" in result
        assert "React.js present: True" in result
        assert "MySQL present: True" in result
        assert "Chunk ID present: True" in result

        print("RAG LCEL document_ids test: PASS")
        print("-" * 60)
        print(result)
        print("-" * 60)


if __name__ == "__main__":
    test_build_rag_lcel_chain_with_document_ids()
