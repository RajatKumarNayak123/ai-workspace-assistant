from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import re


class SemanticContextCompressor:

    model = SentenceTransformer("all-MiniLM-L6-v2")

    @staticmethod
    def compress(
        query: str,
        chunks: list,
        top_sentences: int = 5,
    ):

        compressed_chunks = []

        query_embedding = SemanticContextCompressor.model.encode(query)

        for chunk in chunks:

            sentences = re.split(
                r'(?<=[.!?])\s+',
                chunk["text"]
            )

            sentences = [
                s.strip()
                for s in sentences
                if s.strip()
            ]

            if len(sentences) == 0:
                continue

            sentence_embeddings = SemanticContextCompressor.model.encode(
                sentences
            )

            similarities = cosine_similarity(
                [query_embedding],
                sentence_embeddings
            )[0]

            ranked = sorted(
                zip(sentences, similarities),
                key=lambda x: x[1],
                reverse=True,
            )

            best_sentences = [
                sentence
                for sentence, score in ranked[:top_sentences]
            ]

            new_chunk = chunk.copy()

            new_chunk["text"] = "\n".join(best_sentences)

            compressed_chunks.append(new_chunk)

        return compressed_chunks