from unittest.mock import patch

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

from app.retrieval.langchain_retriever import RAGDocumentRetriever
from app.services.llm.gemini_service import GeminiService


def format_documents(documents):
    return "\n\n".join(
        f"Chunk ID: {doc.metadata['chunk_id']}\n"
        f"Filename: {doc.metadata['filename']}\n"
        f"Content: {doc.page_content}"
        for doc in documents
    )


def test_rag_lcel_gemini():
    fake_chunks = [
        {
            "chunk_id": "chunk_001",
            "text": (
                "VastraLok is an e-commerce project built using "
                "Spring Boot for the backend."
            ),
            "filename": "VastraLok Project.pdf",
            "document_id": 101,
            "workspace_id": 1,
            "distance": 0.20,
        },
        {
            "chunk_id": "chunk_002",
            "text": (
                "The frontend of VastraLok was developed using "
                "React.js and the database is MySQL."
            ),
            "filename": "VastraLok Project.pdf",
            "document_id": 101,
            "workspace_id": 1,
            "distance": 0.25,
        },
    ]

    with patch(
        "app.retrieval.langchain_retriever.VectorService.search",
        return_value=fake_chunks,
    ):

        retriever = RAGDocumentRetriever(
            workspace_id=1,
            top_k=5,
        )

        prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    "You are a document question-answering assistant.\n"
                    "Answer the user's question using only the provided context.\n"
                    "If the answer is not present in the context, say so.\n\n"
                    "Context:\n{context}",
                ),
                ("human", "{question}"),
            ]
        )

        llm = GeminiService.get_llm()

        chain = (
            {
                "context": retriever | format_documents,
                "question": lambda x: x,
            }
            | prompt
            | llm
            | StrOutputParser()
        )

        result = chain.invoke(
            "What technologies were used in the VastraLok project?"
        )

        assert isinstance(result, str)
        assert len(result.strip()) > 0

        print("RAG LCEL Gemini test: PASS")
        print("-" * 60)
        print("Gemini response:")
        print(result)
        print("-" * 60)


if __name__ == "__main__":
    test_rag_lcel_gemini()
