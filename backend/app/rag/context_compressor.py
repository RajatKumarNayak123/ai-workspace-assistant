import re


class ContextCompressor:

    @staticmethod
    def compress(chunks, query):
        """
        Keep only the most relevant sentences from each chunk.
        """

        keywords = re.findall(r"\w+", query.lower())

        compressed = []

        for chunk in chunks:

            sentences = re.split(
                r'(?<=[.!?])\s+',
                chunk["text"]
            )

            selected = []

            for sentence in sentences:

                lower = sentence.lower()

                if any(word in lower for word in keywords):
                    selected.append(sentence)

            if not selected:
                selected = sentences[:2]

            new_chunk = chunk.copy()

            new_chunk["text"] = " ".join(selected)

            compressed.append(new_chunk)

        return compressed

    