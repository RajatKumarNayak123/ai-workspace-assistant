from app.vectorstore.chroma_client import collection
from app.vectorstore.embedding_service import EmbeddingService


class VectorService:

    # ==========================================================
    # ADD DOCUMENT
    # ==========================================================

    @staticmethod
    def add_document(
        chunk: str,
        document_id: str,
        workspace_id: int,
        document_db_id: int,
        filename: str,
    ):

        embedding = EmbeddingService.create_embedding(
            chunk
        )

        collection.add(
            ids=[document_id],
            documents=[chunk],
            embeddings=[embedding],
            metadatas=[
                {
                    "workspace_id": workspace_id,
                    "document_id": document_db_id,
                    "filename": filename,
                }
            ],
        )

        print("=" * 80)
        print("VECTOR STORED")
        print(f"Document ID : {document_id}")
        print(f"Workspace ID: {workspace_id}")
        print(f"Filename    : {filename}")
        print("=" * 80)

    # ==========================================================
    # SEARCH
    # ==========================================================

    @staticmethod
    def search(
        query: str,
        workspace_id: int,
        top_k: int = 5,
        document_ids: list[int] | None = None,
    ):

        query_embedding = (
            EmbeddingService.create_embedding(
                query
            )
        )

        # ======================================================
        # BUILD CHROMA FILTER
        # ======================================================

        if document_ids:

            where = {
                "$and": [
                    {
                        "workspace_id": workspace_id
                    },
                    {
                        "document_id": {
                            "$in": document_ids
                        }
                    },
                ]
            }

        else:

            where = {
                "workspace_id": workspace_id
            }

        print("=" * 80)
        print("VECTOR SEARCH FILTER")
        print("Workspace ID :", workspace_id)
        print("Document IDs :", document_ids)
        print("Where        :", where)
        print("=" * 80)

        # ======================================================
        # CHROMA SEARCH
        # ======================================================

        results = collection.query(
            query_embeddings=[
                query_embedding
            ],
            n_results=top_k,
            where=where,
        )

        print("=" * 80)
        print("RAW CHROMA RESULT")
        print(results)
        print("=" * 80)

        # ======================================================
        # NO RESULTS
        # ======================================================

        if (
            not results.get("ids")
            or not results["ids"][0]
        ):

            return []

        ids = results["ids"][0]

        documents = results["documents"][0]

        metadatas = results["metadatas"][0]

        distances = results["distances"][0]

        retrieved_chunks = []

        SIMILARITY_THRESHOLD = 1.10

        # ======================================================
        # PROCESS RESULTS
        # ======================================================

        for (
            chunk_id,
            doc,
            metadata,
            distance,
        ) in zip(
            ids,
            documents,
            metadatas,
            distances,
        ):

            if distance <= SIMILARITY_THRESHOLD:

                print(
                    f"Accepted: "
                    f"{metadata['filename']} | "
                    f"Document ID = "
                    f"{metadata['document_id']} | "
                    f"Distance = "
                    f"{distance:.4f}"
                )

                retrieved_chunks.append(
                    {
                        "chunk_id": chunk_id,
                        "text": doc,
                        "filename": metadata["filename"],
                        "document_id": metadata["document_id"],
                        "workspace_id": metadata["workspace_id"],
                        "distance": distance,
                    }
                )

            else:

                print(
                    f"Rejected: "
                    f"{metadata['filename']} | "
                    f"Distance = "
                    f"{distance:.4f}"
                )

        return retrieved_chunks

    # ==========================================================
    # GET ALL CHUNKS
    # ==========================================================

    @staticmethod
    def get_all_chunks(
        workspace_id: int,
        document_ids: list[int] | None = None,
    ):

        # ======================================================
        # BUILD FILTER
        # ======================================================

        if document_ids:

            where = {
                "$and": [
                    {
                        "workspace_id": workspace_id
                    },
                    {
                        "document_id": {
                            "$in": document_ids
                        }
                    },
                ]
            }

        else:

            where = {
                "workspace_id": workspace_id
            }

        print("=" * 80)
        print("GET ALL CHUNKS FILTER")
        print("Workspace ID :", workspace_id)
        print("Document IDs :", document_ids)
        print("Where        :", where)
        print("=" * 80)

        results = collection.get(
            where=where
        )

        chunks = []

        ids = results.get(
            "ids",
            []
        )

        docs = results.get(
            "documents",
            []
        )

        metas = results.get(
            "metadatas",
            []
        )

        for (
            chunk_id,
            doc,
            meta,
        ) in zip(
            ids,
            docs,
            metas,
        ):

            chunks.append(
                {
                    "chunk_id": chunk_id,
                    "text": doc,
                    "filename": meta["filename"],
                    "document_id": meta["document_id"],
                    "workspace_id": meta["workspace_id"],
                }
            )

        return chunks

    # ==========================================================
    # DELETE DOCUMENT VECTORS
    # ==========================================================

    @staticmethod
    def delete_document_vectors(
        document_db_id: int,
    ):

        results = collection.get(
            where={
                "document_id": document_db_id
            }
        )

        ids = results.get(
            "ids",
            []
        )

        if not ids:

            print("=" * 80)
            print("NO VECTOR CHUNKS FOUND")
            print(
                f"Document DB ID : "
                f"{document_db_id}"
            )
            print("=" * 80)

            return 0

        collection.delete(
            ids=ids
        )

        print("=" * 80)
        print("VECTOR CLEANUP SUCCESSFUL")
        print(
            f"Document DB ID : "
            f"{document_db_id}"
        )
        print(
            f"Deleted Vectors: "
            f"{len(ids)}"
        )
        print("=" * 80)

        return len(ids)