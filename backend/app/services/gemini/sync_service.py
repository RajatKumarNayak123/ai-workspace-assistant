from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import (
    HumanMessage,
    AIMessage,
    SystemMessage,
)

from app.services.gemini.base import BaseLLMService
from app.prompts.system_prompt import SYSTEM_PROMPT
from app.config.settings import settings

from app.memory.conversation_memory import (
    add_message,
    get_history,
)

from app.utils.logger import logger

import uuid
import logging
import httpx
import time

from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
    before_sleep_log,
)


llm = ChatGoogleGenerativeAI(
    model=settings.GEMINI_MODEL,
    google_api_key=settings.GOOGLE_API_KEY,
    temperature=settings.GEMINI_TEMPERATURE,
)

class GeminiSyncService(BaseLLMService):

    @retry(
        stop=stop_after_attempt(settings.GEMINI_RETRY_ATTEMPTS),
        wait=wait_exponential(
            multiplier=2,
            min=settings.GEMINI_RETRY_MIN_WAIT,
            max=settings.GEMINI_RETRY_MAX_WAIT,
        ),
        retry=retry_if_exception_type(Exception),
        before_sleep=before_sleep_log(logger, logging.WARNING),
        reraise=True,
    )
    def invoke_gemini(
        self,
        messages,
        request_id,
    ):

        logger.info(f"[{request_id}] Calling Gemini API...")

        try:

            response = llm.invoke(messages)

            logger.info(
                f"[{request_id}] Gemini Response Received"
            )

            return response

        except Exception as e:

            error = str(e)

            if (
                "429" in error
                or
                "RESOURCE_EXHAUSTED" in error
            ):

                raise RuntimeError(
                    "QUOTA_EXCEEDED"
                )

            raise

    def generate(
        self,
        session_id: str,
        question: str,
        save_user_message: str | None = None,
    ):

        start_time = time.time()

        request_id = str(uuid.uuid4())[:8]

        history = get_history(session_id)

        history = history[-settings.MAX_HISTORY_MESSAGES:]

        messages = [
            SystemMessage(content=SYSTEM_PROMPT)
        ]

        for msg in history:

            if msg["role"] == "user":

                messages.append(
                    HumanMessage(content=msg["content"])
                )

            else:

                messages.append(
                    AIMessage(content=msg["content"])
                )

        messages.append(
            HumanMessage(content=question)
        )

        logger.info(f"Request ID = {request_id}")
        logger.info(f"Session = {session_id}")
        logger.info(f"Question = {question}")
        logger.info(f"History Count Sent To Gemini = {len(history)}"
        )
        logger.info(f"Total Messages = {len(messages)}"
        )

        # Gemini call yahan aayega
        try:

            response = self.invoke_gemini(
                messages,
                request_id,
            )

            gemini_time = time.time() - start_time

            logger.info(f"Gemini Response Time = {gemini_time:.2f} seconds"
            )

        except Exception as e:

            logger.exception(
                f"[{request_id}] Gemini API Error"
            )

            if str(e) == "QUOTA_EXCEEDED":

                return (
                "⚠️ AI quota exceeded.\n"
                "Please try again after a minute."
                )

            error = str(e)

            if "503" in error:

                return (
                "⚠️ AI service is temporarily unavailable.\n"
                "Please try again later."
                )

            elif isinstance(
                e,
                httpx.TimeoutException,
            ):

                return (
                "⚠️ Request timed out.\n"
                "Please try again."
                )

            else:

                return (
                "⚠️ Something went wrong while contacting the AI service."
                )

# ======================================================
# Response Parsing
# ======================================================

        if isinstance(response.content, str):

            answer = response.content

        elif isinstance(response.content, list):

            first = response.content[0]

            if isinstance(first, dict):

                answer = first.get("text", "")

            else:

                answer = getattr(first, "text", str(first))

        else:

            answer = str(response.content)

# ======================================================
# Save Conversation
# ======================================================

        if save_user_message is None:

            save_user_message = question

        add_message(
                session_id,
                "user",
                save_user_message,
        )

        add_message(
                session_id,
                "assistant",
                answer,
        )

        logger.info(
                f"[{request_id}] Conversation Saved Successfully"
        )

        total_time = time.time() - start_time

        logger.info(
                f"Total Request Time = {total_time:.2f} seconds"
        )

        return answer



    def stream(
        self,
        session_id: str,
        question: str,
        save_user_message: str | None = None,
    ):
        pass