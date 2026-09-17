from app.services.gemini_service import GeminiService


class LLMContextCompressor:

    @staticmethod
    def compress(
        query: str,
        chunks: list,
    ):

        compressed_chunks = []

        for chunk in chunks:

            prompt = f"""
You are a Context Compression AI.

Your task is to keep ONLY the information that helps answer the user's question.

Delete everything else.

Rules:

- Keep exact wording.
- Do NOT summarize.
- Do NOT explain.
- Remove unrelated information.
- If nothing is relevant, return exactly:

NO_RELEVANT_INFORMATION

====================

Question:

{query}

====================

Context:

{chunk["text"]}

====================

Relevant Context:
"""
            gemini=GeminiService()
            response = gemini.generate(
                session_id="context_compressor",
                question=prompt,
            )

            # Gemini fail hua to original chunk use karo
            if response.startswith("⚠️"):

                new_chunk = chunk.copy()
                compressed_chunks.append(new_chunk)
                continue

            if response.strip() == "NO_RELEVANT_INFORMATION":
                continue

            new_chunk = chunk.copy()
            new_chunk["text"] = response.strip()

            compressed_chunks.append(new_chunk)

        return compressed_chunks