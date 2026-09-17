from sentence_transformers import CrossEncoder


class CrossEncoderReranker:

    # Load only once
    model = CrossEncoder(
        "cross-encoder/ms-marco-MiniLM-L6-v2"
    )

    @staticmethod
    def rerank(
        query: str,
        chunks: list,
        top_k: int = 4,
    ):

        if not chunks:
            return []

        pairs = [
            (query, chunk["text"])
            for chunk in chunks
        ]

        scores = CrossEncoderReranker.model.predict(pairs)

        for chunk, score in zip(chunks, scores):
            chunk["rerank_score"] = float(score)

        chunks.sort(
            key=lambda x: x["rerank_score"],
            reverse=True,
        )

        return chunks[:top_k]