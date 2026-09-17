from sentence_transformers import SentenceTransformer


class EmbeddingService:

    model = SentenceTransformer(
        "BAAI/bge-small-en-v1.5"
    )

    @classmethod
    def create_embedding(
        cls,
        text: str,
    ):

        embedding = cls.model.encode(
            text
        )

        return embedding.tolist()