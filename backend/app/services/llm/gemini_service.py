from langchain_google_genai import ChatGoogleGenerativeAI

import uuid
import time
import httpx

from app.config.settings import settings
from app.prompts.system_prompt import SYSTEM_PROMPT
from app.utils.logger import logger
from app.services.llm.base import BaseLLMService


class GeminiService(BaseLLMService):

    # ==========================================================
    # SHARED GEMINI CLIENT
    # ==========================================================

    _llm_cache = {}

    @classmethod
    def get_llm(cls, model=None):

        selected_model = (
            model or settings.GEMINI_MODEL
        )

        if selected_model not in cls._llm_cache:

            cls._llm_cache[selected_model] = (
                ChatGoogleGenerativeAI(
                    model=selected_model,
                    google_api_key=settings.GOOGLE_API_KEY,
                    temperature=settings.GEMINI_TEMPERATURE,
                    max_retries=0,
                    # Gemini/LangChain automatic retry disabled.
                    # Retry/error handling is controlled by this service.
                
                )
            )    

            logger.info("=" * 60)

            logger.info(
                "Gemini Client Initialized"
            )

            logger.info(
                f"Model : {selected_model}"
            )

            logger.info(
                "Gemini automatic retries : DISABLED"
            )

            logger.info("=" * 60)

        return cls._llm_cache[selected_model]

    # ==========================================================
    # INITIALIZATION
    # ==========================================================

    def __init__(self, model=None):

        self.model = (
            model or settings.GEMINI_MODEL
        )
        self.llm = self.get_llm(self.model)

    # ==========================================================
    # SINGLE GEMINI API CALL
    # ==========================================================

    def invoke_gemini(
        self,
        messages,
        request_id,
    ):

        logger.info(
            f"[{request_id}] Calling Gemini..."
        )

        try:

            # --------------------------------------------------
            # ONLY GEMINI API CALL
            # --------------------------------------------------

            response = self.llm.invoke(
                messages
            )

            logger.info(
                f"[{request_id}] "
                "Gemini Response Received"
            )

            return response

        except Exception as e:

            error = str(e)
            upper_error = error.upper()

            logger.error(
                f"[{request_id}] "
                f"Gemini API Error: {error}"
            )

            # --------------------------------------------------
            # QUOTA / RESOURCE EXHAUSTED
            # --------------------------------------------------

            if (
                "RESOURCE_EXHAUSTED" in upper_error
                or "QUOTA_EXCEEDED" in upper_error
                or "QUOTA" in upper_error
            ):

                raise RuntimeError(
                    "QUOTA_EXCEEDED"
                )

            # --------------------------------------------------
            # RE-RAISE ORIGINAL ERROR
            # --------------------------------------------------

            raise

    # ==========================================================
    # RESPONSE TEXT EXTRACTION
    # ==========================================================

    @staticmethod
    def extract_response_text(response):

        if response is None:

            return ""

        content = getattr(
            response,
            "content",
            "",
        )

        # ------------------------------------------------------
        # NORMAL STRING RESPONSE
        # ------------------------------------------------------

        if isinstance(
            content,
            str,
        ):

            return content.strip()

        # ------------------------------------------------------
        # LIST RESPONSE
        # ------------------------------------------------------

        if isinstance(
            content,
            list,
        ):

            if not content:

                return ""

            text_parts = []

            for item in content:

                if isinstance(
                    item,
                    dict,
                ):

                    text = item.get(
                        "text",
                        "",
                    )

                    if text:

                        text_parts.append(
                            str(text)
                        )

                else:

                    text = getattr(
                        item,
                        "text",
                        None,
                    )

                    if text:

                        text_parts.append(
                            str(text)
                        )

                    elif item:

                        text_parts.append(
                            str(item)
                        )

            return "\n".join(
                text_parts
            ).strip()

        # ------------------------------------------------------
        # FALLBACK
        # ------------------------------------------------------

        return str(
            content
        ).strip()

    # ==========================================================
    # GENERATE
    # ==========================================================

    def generate(
        self,
        session_id: str,
        question: str,
        save_user_message: str | None = None,
        save_history: bool = True,
        model: str | None = None,
    ):

        start_time = time.time()

        request_id = str(
            uuid.uuid4()
        )[:8]

    # ======================================================
    # SELECT GEMINI MODEL
    # ======================================================

        selected_model = (
            model or self.model
        )

        self.llm = self.get_llm(
            selected_model
        )

        logger.info(
            f"[{request_id}] Selected Gemini Model: "
            f"{selected_model}"
        )

        # ======================================================
        # IMPORTANT ARCHITECTURE CHANGE
        # ======================================================
        #
        # GeminiService NO LONGER manages conversation history.
        #
        # Conversation persistence is handled by RagService
        # + ConversationRepository.
        #
        # This prevents:
        #
        #   - in-memory history disappearing after refresh
        #   - duplicate history systems
        #   - session/user mismatch
        #   - old conversation_memory conflicts
        #
        # The parameters save_user_message and save_history are
        # retained for backward compatibility with existing code.
        #
        # They are intentionally NOT used here.
        # ======================================================

        messages = [

            {
                "role": "system",
                "content": SYSTEM_PROMPT,
            },

            {
                "role": "user",
                "content": question,
            },

        ]

        # ------------------------------------------------------
        # Convert dictionaries to LangChain message objects
        # ------------------------------------------------------

        from langchain_core.messages import (
            HumanMessage,
            SystemMessage,
        )

        langchain_messages = [

            SystemMessage(
                content=SYSTEM_PROMPT
            ),

            HumanMessage(
                content=question
            ),

        ]

        # ======================================================
        # LOGGING
        # ======================================================

        logger.info("=" * 80)

        logger.info(
            f"Request ID : {request_id}"
        )

        logger.info(
            f"Session    : {session_id}"
        )

        logger.info(
            "History    : 0"
        )

        logger.info(
            f"Messages   : {len(langchain_messages)}"
        )

        logger.info("=" * 80)

        # ======================================================
        # SINGLE GEMINI API CALL
        # ======================================================

        try:

            response = self.invoke_gemini(
                langchain_messages,
                request_id,
            )

            gemini_time = (
                time.time()
                - start_time
            )

            logger.info(
                f"[{request_id}] "
                f"Gemini Response Time = "
                f"{gemini_time:.2f} sec"
            )

        except Exception as e:

            error = str(e)
            upper_error = error.upper()

            logger.exception(
                f"[{request_id}] Gemini Error"
            )

            # ==================================================
            # QUOTA / RESOURCE EXHAUSTED
            # ==================================================

            if (
                error == "QUOTA_EXCEEDED"
                or "RESOURCE_EXHAUSTED" in upper_error
                or "QUOTA_EXCEEDED" in upper_error
            ):

                logger.warning(
                    f"[{request_id}] "
                    "Gemini quota/resource limit reached."
                )

                return (
                    "⚠️ AI quota exceeded. "
                    "Please try again later."
                )

            # ==================================================
            # TEMPORARY SERVER ERROR
            # ==================================================

            if any(
                code in error
                for code in (
                    "500",
                    "502",
                    "503",
                    "504",
                )
            ):

                return (
                    "⚠️ AI service is temporarily "
                    "unavailable. Please try again."
                )

            # ==================================================
            # TIMEOUT
            # ==================================================

            if isinstance(
                e,
                httpx.TimeoutException,
            ):

                return (
                    "⚠️ Gemini request timed out. "
                    "Please try again."
                )

            # --------------------------------------------------
            # Windows socket timeout
            # --------------------------------------------------

            if (
                "WINERROR 10060" in upper_error
                or "READTIMEOUT" in upper_error
                or "TIMED OUT" in upper_error
            ):

                return (
                    "⚠️ Gemini request timed out. "
                    "Please check your internet connection "
                    "and try again."
                )

            # ==================================================
            # GENERIC ERROR
            # ==================================================

            return (
                "⚠️ Something went wrong while "
                "contacting the AI service."
            )

        # ======================================================
        # RESPONSE PARSING
        # ======================================================

        answer = (
            self.extract_response_text(
                response
            )
        )

        # ======================================================
        # TOTAL TIME
        # ======================================================

        total_time = (
            time.time()
            - start_time
        )

        logger.info(
            f"[{request_id}] "
            f"Total Request Time = "
            f"{total_time:.2f} sec"
        )

        # ======================================================
        # RETURN ONLY GEMINI ANSWER
        # ======================================================

        return answer