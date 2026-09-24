from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableLambda

from app.retrieval.langchain_retriever import RAGDocumentRetriever
from app.services.llm.gemini_service import GeminiService


def format_documents(documents):
    return "\n\n".join(
        f"Chunk ID: {doc.metadata['chunk_id']}\n"
        f"Filename: {doc.metadata['filename']}\n"
        f"Document ID: {doc.metadata['document_id']}\n"
        f"Content: {doc.page_content}"
        for doc in documents
    )


def build_rag_lcel_chain(
    workspace_id: int,
    top_k: int = 5,
    document_ids: list[int] | None = None,
):
    retriever = RAGDocumentRetriever(
        workspace_id=workspace_id,
        top_k=top_k,
        document_ids=document_ids,
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
            "context": retriever | RunnableLambda(format_documents),
            "question": lambda x: x,
        }
        | prompt
        | llm
        | StrOutputParser()
    )

    return chain
