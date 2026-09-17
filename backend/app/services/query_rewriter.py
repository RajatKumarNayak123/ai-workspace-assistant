from app.memory.conversation_memory import get_history


def rewrite_query(
    session_id: str,
    question: str,
) -> str:

    """
    Lightweight query rewriting.

    IMPORTANT:
    This function does NOT call Gemini.

    Simple questions are returned unchanged.
    Context-dependent questions are resolved using
    recent conversation history only when possible.
    """

    question = question.strip()

    if not question:
        return question

    history = get_history(session_id)

    if not history:
        return question

    recent_history = history[-6:]

    # --------------------------------------------------
    # For now, do not rewrite normal standalone questions
    # --------------------------------------------------

    standalone_indicators = (
        "what is",
        "what are",
        "who is",
        "where is",
        "when is",
        "how many",
        "how much",
        "which",
        "what technologies",
        "what technology",
        "what projects",
    )

    lowered = question.lower()

    if lowered.startswith(standalone_indicators):
        return question

    # --------------------------------------------------
    # Conservative fallback
    #
    # We deliberately return the original question
    # rather than using another Gemini API call.
    # --------------------------------------------------

    return question