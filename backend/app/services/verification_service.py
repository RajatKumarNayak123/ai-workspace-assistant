import json

from app.prompts.verification_prompt import VERIFICATION_PROMPT
from app.services.gemini_service import GeminiService


class VerificationService:

    @staticmethod
    def verify(
        question: str,
        context: str,
        answer: str,
    ):

        prompt = f"""
{VERIFICATION_PROMPT}

========================

Question:

{question}

========================

Retrieved Context:

{context}

========================

Generated Answer:

{answer}

"""

        gemini=GeminiService()
        response = gemini.generate(
            session_id="verification",
            question=prompt,
        )

        # Gemini error
        if response.startswith("⚠️"):

            return {
                "confidence": None,
                "grounded": None,
                "hallucination": None,
                "explanation": response,
            }

        response = (
            response
            .replace("```json", "")
            .replace("```", "")
            .strip()
        )

        try:

            return json.loads(response)

        except Exception:

            return {
                "confidence": None,
                "grounded": None,
                "hallucination": None,
                "explanation": "Verification parsing failed.",
            }