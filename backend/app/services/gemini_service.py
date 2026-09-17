from app.services.llm.gemini_service import GeminiService


# ------------------------------------------------------
# Backward-compatible helper
# ------------------------------------------------------
#
# Existing code may still import:
#
# from app.services.gemini_service import ask_gemini
#
# Keep this helper temporarily so old code does not break
# during the LLM service migration.
# ------------------------------------------------------

_gemini_service = GeminiService()


def ask_gemini(
    session_id: str,
    question: str,
    save_user_message: str | None = None,
):
    return _gemini_service.generate(
        session_id=session_id,
        question=question,
        save_user_message=save_user_message,
    )