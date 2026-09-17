class RRFService:

    @staticmethod
    def fuse(
        vector_chunks: list,
        bm25_chunks: list,
        k: int = 60,
        top_k: int = 10,
    ):

        VECTOR_WEIGHT = 0.7
        BM25_WEIGHT = 0.3

        scores = {}

        # ---------------------------------
        # Vector Ranking
        # ---------------------------------

        for rank, chunk in enumerate(
            vector_chunks,
            start=1,
        ):

            chunk_id = chunk["chunk_id"]

            if chunk_id not in scores:

                scores[chunk_id] = chunk.copy()

                scores[chunk_id]["rrf_score"] = 0.0

            scores[chunk_id]["rrf_score"] += (
                VECTOR_WEIGHT / (k + rank)
            )

        # ---------------------------------
        # BM25 Ranking
        # ---------------------------------

        for rank, chunk in enumerate(
            bm25_chunks,
            start=1,
        ):

            chunk_id = chunk["chunk_id"]

            if chunk_id not in scores:

                scores[chunk_id] = chunk.copy()

                scores[chunk_id]["rrf_score"] = 0.0

            scores[chunk_id]["rrf_score"] += (
                BM25_WEIGHT / (k + rank)
            )

            scores[chunk_id]["bm25_score"] = chunk.get(
                "bm25_score",
                0.0,
            )

        # ---------------------------------
        # Sort
        # ---------------------------------

        fused = sorted(
            scores.values(),
            key=lambda x: x["rrf_score"],
            reverse=True,
        )

        return fused[:top_k]