from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableLambda


def mock_llm(prompt_value):
   return "Received -> " + prompt_value.messages[-1].content


def test_lcel_structure():
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", "You are a helpful AI assistant."),
            ("human", "{question}"),
        ]
    )

    chain = prompt | RunnableLambda(mock_llm) | StrOutputParser()

    result = chain.invoke(
        {
            "question": "What is LangChain?"
        }
    )

    assert result == "Received -> What is LangChain?"

    print("LCEL structure test: PASS")
    print(f"Result: {result}")


if __name__ == "__main__":
    test_lcel_structure()
