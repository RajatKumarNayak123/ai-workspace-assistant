from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

from app.services.llm.gemini_service import GeminiService


def test_lcel_gemini():
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "You are a helpful AI assistant. "
                "Answer briefly in one sentence.",
            ),
            ("human", "{question}"),
        ]
    )

    llm = GeminiService.get_llm()

    chain = prompt | llm | StrOutputParser()

    result = chain.invoke(
        {
            "question": "What is LangChain?"
        }
    )

    assert isinstance(result, str)
    assert len(result.strip()) > 0

    print("LCEL Gemini integration test: PASS")
    print(f"Gemini response: {result}")


if __name__ == "__main__":
    test_lcel_gemini()
