from unittest.mock import patch

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableLambda

from app.retrieval.langchain_retriever import RAGDocumentRetriever


def format_documents(documents):
    return "\n\n".join(
        f"Chunk ID: {doc.metadata['chunk_id']}\n"
        f"Filename: {doc.metadata['filename']}\n"
        f"Document ID: {doc.metadata['document_id']}\n"
        f"Content: {doc.page_content}"
        for doc in documents
    )


def mock_llm(prompt_value):
    messages = prompt_value.messages

    system_message = messages[0].content
    question = messages[-1].content

    return (
        "MOCK ANSWER\n"
        f"Question: {question}\n"
        f"Prompt contains context: {'Context:' in system_message}\n"
        f"Spring Boot present: {'Spring Boot' in system_message}\n"
        f"React.js present: {'React.js' in system_message}\n"
        f"MySQL present: {'MySQL' in system_message}\n"
        f"Chunk ID present: {'chunk_001' in system_message}"
    )


def test_rag_lcel_context_flow():
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
            "text": "React.js was used for the frontend and MySQL was used as the database.",
            "filename": "VastraLok.pdf",
            "document_id": 101,
            "workspace_id": 1,
            "distance": 0.25,
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

        prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    "Answer using only the provided document context.\n\n"
                    "Context:\n{context}",
                ),
                ("human", "{question}"),
            ]
        )

        chain = (
            {
                "context": retriever | RunnableLambda(format_documents),
                "question": lambda x: x,
            }
            | prompt
            | RunnableLambda(mock_llm)
            | StrOutputParser()
        )

        result = chain.invoke(
            "What technologies were used in VastraLok?"
        )

        mock_search.assert_called_once_with(
            query="What technologies were used in VastraLok?",
            workspace_id=1,
            top_k=5,
            document_ids=None,
        )

        assert "MOCK ANSWER" in result
        assert "Question: What technologies were used in VastraLok?" in result
        assert "Prompt contains context: True" in result
        assert "Spring Boot present: True" in result
        assert "React.js present: True" in result
        assert "MySQL present: True" in result
        assert "Chunk ID present: True" in result

        print("RAG LCEL context flow test: PASS")
        print("-" * 60)
        print(result)
        print("-" * 60)


if __name__ == "__main__":
    test_rag_lcel_context_flow()
