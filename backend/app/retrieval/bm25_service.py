import re

from rank_bm25 import BM25Okapi


class BM25Service:

    # ==========================================================
    # TOKENIZER
    # ==========================================================

    @staticmethod
    def tokenize(text: str):

        if not text:
            return []

        text = text.lower()

        # Normalize common separators
        text = text.replace("e-mail", "email")
        text = text.replace("e mail", "email")

        # Keep useful characters inside words/emails
        tokens = re.findall(
            r"[a-z0-9]+(?:[._%+-][a-z0-9]+)*@[a-z0-9.-]+\.[a-z]{2,}"
            r"|[a-z0-9]+",
            text,
        )

        return tokens

    # ==========================================================
    # SEARCH
    # ==========================================================

    @staticmethod
    def search(
        query: str,
        chunks: list,
        top_k: int = 5,
    ):

        if not chunks:
            return []

        # ------------------------------------------------------
        # TOKENIZE DOCUMENT CHUNKS
        # ------------------------------------------------------

        corpus = [
            BM25Service.tokenize(
                chunk.get("text", "")
            )
            for chunk in chunks
        ]

        # Remove completely empty documents
        valid_chunks = []
        valid_corpus = []

        for chunk, tokens in zip(
            chunks,
            corpus,
        ):

            if tokens:

                valid_chunks.append(chunk)
                valid_corpus.append(tokens)

        if not valid_corpus:
            return []

        # ------------------------------------------------------
        # CREATE BM25 INDEX
        # ------------------------------------------------------

        bm25 = BM25Okapi(
            valid_corpus
        )

        # ------------------------------------------------------
        # TOKENIZE QUERY
        # ------------------------------------------------------

        tokenized_query = BM25Service.tokenize(
            query
        )

        if not tokenized_query:
            return []

        # ------------------------------------------------------
        # CALCULATE SCORES
        # ------------------------------------------------------

        scores = bm25.get_scores(
            tokenized_query
        )

        # ------------------------------------------------------
        # RANK RESULTS
        # ------------------------------------------------------

        ranked = sorted(
            zip(
                valid_chunks,
                scores,
            ),
            key=lambda x: x[1],
            reverse=True,
        )

        # ------------------------------------------------------
        # BUILD RESULT
        # ------------------------------------------------------

        results = []

        for chunk, score in ranked[:top_k]:

            chunk_copy = chunk.copy()

            chunk_copy["bm25_score"] = round(
                float(score),
                4,
            )

            results.append(
                chunk_copy
            )

        return results