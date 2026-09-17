import json
import time

from app.vectorstore.vector_service import VectorService
from app.retrieval.bm25_service import BM25Service
from app.retrieval.rrf_service import RRFService
from app.retrieval.reranker import CrossEncoderReranker

from app.services.llm.gemini_service import GeminiService
from app.services.query_classifier import (
    QueryClassifier,
    QueryIntent,
)

from app.config.settings import settings

from app.database.database import SessionLocal
from app.models.retrieval_metric import RetrievalMetric

from app.repositories.conversation_repository import (
    ConversationRepository,
)

from app.services.workspace_rag_settings_service import (
    WorkspaceRAGSettingsService,
)


class RagService:

    # ==========================================================
    # BROAD DOCUMENT QUESTION DETECTION
    # ==========================================================

    @staticmethod
    def is_broad_document_question(question: str) -> bool:
        """
        Detect questions where the user wants an overview,
        summary, or general understanding of the attached
        document.

        These questions should use ALL chunks from the
        selected attachment instead of only the top-ranked
        chunks.
        """

        if not question:
            return False

        normalized = (
            question
            .strip()
            .lower()
        )

        # Remove common punctuation.
        normalized = (
            normalized
            .replace("?", "")
            .replace("!", "")
            .replace(".", "")
            .replace(",", "")
        )

        broad_questions = {

            # --------------------------------------------------
            # English
            # --------------------------------------------------

            "what is this document about",
            "what is this document",
            "what does this document contain",
            "what does this document talk about",
            "what is the document about",
            "what does the document contain",
            "what does the document talk about",

            "summarize this document",
            "summarise this document",
            "summarize the document",
            "summarise the document",

            "give me a summary of this document",
            "give me a summary of the document",

            "give me an overview of this document",
            "give me an overview of the document",

            "explain this document",
            "explain the document",

            "describe this document",
            "describe the document",

            "tell me about this document",
            "tell me about the document",

            "give me an overview",
            "give me a summary",

            # --------------------------------------------------
            # Common conversational variants
            # --------------------------------------------------

            "what's this document about",
            "whats this document about",

            "what is this file about",
            "what does this file contain",
            "what does this file talk about",

            "summarize this file",
            "summarise this file",

            "give me a summary of this file",
            "give me an overview of this file",

            "explain this file",
            "describe this file",
            "tell me about this file",
        }

        if normalized in broad_questions:
            return True

        # ======================================================
        # PHRASE-BASED FALLBACK
        # ======================================================

        broad_phrases = [

            "what is this document about",
            "what does this document contain",
            "what does this document talk about",

            "summarize this document",
            "summarise this document",

            "summary of this document",
            "overview of this document",

            "explain this document",
            "describe this document",

            "tell me about this document",

            "what is this file about",
            "what does this file contain",
            "what does this file talk about",

            "summarize this file",
            "summarise this file",

            "summary of this file",
            "overview of this file",
        ]

        return any(
            phrase in normalized
            for phrase in broad_phrases
        )

    # ==========================================================
    # SAVE CONVERSATION
    # ==========================================================

    @staticmethod
    def save_conversation(
        user_id: int,
        session_id: str,
        workspace_id: int,
        question: str,
        answer: str,
        citations=None,
    ):
        """
        Centralized conversation persistence.

        This keeps general questions, empty retrieval
        responses, and normal RAG responses consistent.
        """

        citations = (
            citations
            if isinstance(citations, list)
            else []
        )

        db = SessionLocal()

        try:

            conversation = (
                ConversationRepository.get_by_session(
                    db=db,
                    user_id=user_id,
                    session_id=session_id,
                )
            )

            if conversation is None:

                conversation = (
                    ConversationRepository.create_conversation(
                        db=db,
                        user_id=user_id,
                        session_id=session_id,
                        title=(
                            question[:255]
                            if question
                            else "New conversation"
                        ),
                        workspace_id=workspace_id,
                    )
                )

                print(
                    "Created new conversation:",
                    session_id,
                )

            ConversationRepository.add_message(
                db=db,
                conversation=conversation,
                role="user",
                content=question,
            )

            ConversationRepository.add_message(
                db=db,
                conversation=conversation,
                role="assistant",
                content=answer,
                citations=citations,
            )

            if (
                conversation.title
                == "New conversation"
            ):

                title = (
                    question[:255]
                    if question
                    else "New conversation"
                )

                ConversationRepository.update_title(
                    db=db,
                    conversation=conversation,
                    title=title,
                )

            db.commit()

            print(
                "Conversation history saved to MySQL:",
                session_id,
            )

        except Exception as e:

            db.rollback()

            print(
                "Failed to save conversation history:",
                str(e),
            )

        finally:

            db.close()

    # ==========================================================
    # MAIN RAG METHOD
    # ==========================================================

    @staticmethod
    def ask_question(
        user_id: int,
        session_id: str,
        workspace_id: int,
        question: str,
        model: str | None = None,
        force_document: bool = False,
        has_attachments: bool = False,
        attachment_document_ids: list[int] | None = None,
    ):

        # ==========================================================
        # START TIMER
        # ==========================================================

        start_time = time.perf_counter()

        # ==========================================================
        # NORMALIZE ATTACHMENT IDS
        # ==========================================================

        attachment_document_ids = (
            attachment_document_ids or []
        )

        normalized_attachment_ids = []

        for document_id in attachment_document_ids:

            try:

                if document_id is None:
                    continue

                normalized_attachment_ids.append(
                    int(document_id)
                )

            except (
                TypeError,
                ValueError,
            ):

                print(
                    "Ignoring invalid attachment document ID:",
                    document_id,
                )

        # Remove duplicates while preserving order.
        attachment_document_ids = list(
            dict.fromkeys(
                normalized_attachment_ids
            )
        )

        # ==========================================================
        # ATTACHMENT MODE
        # ==========================================================

        attachment_mode = (
            has_attachments
            and len(
                attachment_document_ids
            ) > 0
        )

        print("=" * 80)
        print("ATTACHMENT MODE")
        print(
            "Has Attachments :",
            has_attachments,
        )
        print(
            "Attachment IDs  :",
            attachment_document_ids,
        )
        print(
            "Attachment Mode :",
            attachment_mode,
        )
        print("=" * 80)

        # ==========================================================
        # QUERY CLASSIFICATION
        # ==========================================================

        original_intent = (
            QueryClassifier.classify(
                question
            )
        )

        intent = original_intent

        # Attachment mode or explicit document mode
        # always forces document retrieval.
        if (
            force_document
            or attachment_mode
        ):

            intent = QueryIntent.DOCUMENT

        # ==========================================================
        # BROAD DOCUMENT QUESTION
        # ==========================================================

        broad_document_question = (
            attachment_mode
            and RagService.is_broad_document_question(
                question
            )
        )

        print("=" * 80)
        print("QUERY CLASSIFICATION")
        print(
            "Question        :",
            question,
        )
        print(
            "Original Intent :",
            original_intent.value,
        )
        print(
            "Final Intent    :",
            intent.value,
        )
        print(
            "Force Doc       :",
            force_document,
        )
        print(
            "Attachment Mode :",
            attachment_mode,
        )
        print(
            "Broad Document Question:",
            broad_document_question,
        )
        print("=" * 80)

        # ==========================================================
        # GENERAL QUESTION
        # ==========================================================

        if (
            intent == QueryIntent.GENERAL
            and not attachment_mode
        ):

            gemini = GeminiService(
                model=model,
            )

            answer = gemini.generate(
                session_id=session_id,
                question=question,
                save_user_message=None,
                save_history=False,
                model=model,
            )

            if answer is None:
                answer = ""

            # ------------------------------------------------------
            # SAVE GENERAL CONVERSATION
            # ------------------------------------------------------

            RagService.save_conversation(
                user_id=user_id,
                session_id=session_id,
                workspace_id=workspace_id,
                question=question,
                answer=answer,
                citations=[],
            )

            response_time = (
                time.perf_counter()
                - start_time
            )

            return {
                "answer": answer,
                "citations": [],
                "retrieved_chunks": [],
                "verification": {
                    "verified": None,
                    "message": (
                        "RAG skipped because "
                        "query was classified as general."
                    ),
                },
                "pipeline": {
                    "original_query": question,
                    "rewritten_query": question,
                    "intent": intent.value,
                    "attachment_mode": False,
                    "attachment_document_ids": [],
                    "vector_hits": 0,
                    "bm25_hits": 0,
                    "rrf_selected": 0,
                    "reranked": 0,
                    "llm_model": (
                        model
                        or settings.GEMINI_MODEL
                    ),
                    "response_time": round(
                        response_time,
                        4,
                    ),
                },
            }

        # ==========================================================
        # ATTACHMENT ERROR
        # ==========================================================

        # Never allow attachment mode to accidentally search
        # every document in the workspace.

        if (
            has_attachments
            and not attachment_document_ids
        ):

            print("=" * 80)
            print("ATTACHMENT ERROR")
            print(
                "has_attachments=True but no "
                "attachment_document_ids were provided."
            )
            print("=" * 80)

            answer = (
                "I couldn't find the attached document."
            )

            RagService.save_conversation(
                user_id=user_id,
                session_id=session_id,
                workspace_id=workspace_id,
                question=question,
                answer=answer,
                citations=[],
            )

            response_time = (
                time.perf_counter()
                - start_time
            )

            return {
                "answer": answer,
                "citations": [],
                "retrieved_chunks": [],
                "verification": {
                    "verified": False,
                    "message": (
                        "Attachment document IDs "
                        "were not provided."
                    ),
                },
                "pipeline": {
                    "original_query": question,
                    "rewritten_query": question,
                    "intent": QueryIntent.DOCUMENT.value,
                    "attachment_mode": True,
                    "attachment_document_ids": [],
                    "vector_hits": 0,
                    "bm25_hits": 0,
                    "rrf_selected": 0,
                    "reranked": 0,
                    "llm_model": (
                        model
                        or settings.GEMINI_MODEL
                    ),
                    "response_time": round(
                        response_time,
                        4,
                    ),
                },
            }

        # ==========================================================
        # LOAD WORKSPACE RAG SETTINGS
        # ==========================================================

        settings_db = SessionLocal()

        try:

            rag_settings = (
                WorkspaceRAGSettingsService.get_settings(
                    db=settings_db,
                    workspace_id=workspace_id,
                )
            )

        finally:

            settings_db.close()

        # ==========================================================
        # 1. QUERY REWRITING
        # ==========================================================

        if rag_settings.query_rewriting_enabled:

            # Future query rewriting implementation.
            rewritten_question = question

        else:

            rewritten_question = question

        print("=" * 80)
        print("QUESTION")
        print(
            rewritten_question
        )
        print("=" * 80)

        # ==========================================================
        # 2. VECTOR SEARCH
        # ==========================================================

        vector_chunks = []

        if rag_settings.vector_enabled:

            vector_chunks = (
                VectorService.search(
                    query=rewritten_question,
                    workspace_id=workspace_id,
                    top_k=rag_settings.vector_top_k,

                    # Attachment mode searches only
                    # selected document IDs.
                    document_ids=(
                        attachment_document_ids
                        if attachment_mode
                        else None
                    ),
                )
            )

        vector_hit_count = len(
            vector_chunks
        )

        # ==========================================================
        # 3. GET ALL CHUNKS FOR BM25
        # ==========================================================

        all_chunks = (
            VectorService.get_all_chunks(
                workspace_id=workspace_id,

                # Same restriction must be used
                # for BM25.
                document_ids=(
                    attachment_document_ids
                    if attachment_mode
                    else None
                ),
            )
        )

        print("=" * 80)
        print("ALL CHUNKS FOR BM25")
        print(
            "Attachment Mode :",
            attachment_mode,
        )
        print(
            "Document IDs    :",
            attachment_document_ids,
        )
        print(
            "Total chunks    :",
            len(all_chunks),
        )

        for chunk in all_chunks:

            print(
                chunk["chunk_id"],
                "=>",
                chunk["text"][:300],
            )

        print("=" * 80)

        # ==========================================================
        # 4. BM25 SEARCH
        # ==========================================================

        bm25_chunks = []

        if rag_settings.bm25_enabled:

            bm25_chunks = (
                BM25Service.search(
                    query=rewritten_question,
                    chunks=all_chunks,
                    top_k=rag_settings.bm25_top_k,
                )
            )

        bm25_hit_count = len(
            bm25_chunks
        )

        # ==========================================================
        # 5. RECIPROCAL RANK FUSION
        # ==========================================================

        if rag_settings.rrf_enabled:

            rrf_chunks = (
                RRFService.fuse(
                    vector_chunks=vector_chunks,
                    bm25_chunks=bm25_chunks,
                    top_k=rag_settings.rrf_top_k,
                )
            )

        else:

            rrf_chunks = (
                vector_chunks
                if vector_chunks
                else bm25_chunks
            )

        rrf_hit_count = len(
            rrf_chunks
        )

        # ==========================================================
        # 6. CROSS ENCODER RERANKING
        # ==========================================================

        if broad_document_question:

            # ======================================================
            # BROAD DOCUMENT MODE
            #
            # Questions such as:
            #
            # "What is this document about?"
            # "Summarize this document."
            # "Give me an overview."
            #
            # require understanding the complete uploaded
            # document instead of only the most semantically
            # similar chunks.
            #
            # all_chunks is already restricted to the selected
            # attachment document IDs.
            # ======================================================

            chunks = list(
                all_chunks
            )

            print("=" * 80)
            print("BROAD DOCUMENT MODE")
            print(
                "Using ALL attachment chunks:",
                len(chunks),
            )

            for chunk in chunks:

                print(
                    "Included:",
                    chunk["chunk_id"],
                    chunk.get("filename"),
                    chunk.get("document_id"),
                )

            print("=" * 80)

        elif rag_settings.reranker_enabled:

            chunks = (
                CrossEncoderReranker.rerank(
                    query=rewritten_question,
                    chunks=rrf_chunks,
                    top_k=rag_settings.reranker_top_k,
                )
            )

        else:

            chunks = rrf_chunks

        rerank_count = len(
            chunks
        )

        # ==========================================================
        # 7. DEBUG RETRIEVAL RESULTS
        # ==========================================================

        print("=" * 80)
        print("VECTOR RESULTS")

        for chunk in vector_chunks:

            print(
                chunk["chunk_id"],
                chunk.get("distance"),
                chunk.get("filename"),
                chunk.get("document_id"),
            )

        print("=" * 80)

        print("BM25 RESULTS")

        for chunk in bm25_chunks:

            print(
                chunk["chunk_id"],
                chunk.get("bm25_score"),
                chunk.get("filename"),
                chunk.get("document_id"),
            )

        print("=" * 80)

        print("RRF RESULTS")

        for chunk in rrf_chunks:

            print(
                chunk["chunk_id"],
                round(
                    chunk.get(
                        "rrf_score",
                        0,
                    ),
                    6,
                ),
                chunk.get("filename"),
            )

        print("=" * 80)

        print("FINAL CONTEXT CHUNKS")

        for chunk in chunks:

            print(
                chunk["chunk_id"],
                chunk.get("filename"),
                chunk.get("document_id"),
            )

        print("=" * 80)

        # ==========================================================
        # 8. NO RETRIEVAL RESULT
        # ==========================================================

        if not chunks:

            answer = (
                "I couldn't find that information "
                "in the uploaded documents."
            )

            RagService.save_conversation(
                user_id=user_id,
                session_id=session_id,
                workspace_id=workspace_id,
                question=question,
                answer=answer,
                citations=[],
            )

            response_time = (
                time.perf_counter()
                - start_time
            )

            return {
                "answer": answer,
                "citations": [],
                "retrieved_chunks": [],
                "verification": {
                    "verified": False,
                    "message": (
                        "No relevant document chunks "
                        "were retrieved."
                    ),
                },
                "pipeline": {
                    "original_query": question,
                    "rewritten_query": rewritten_question,
                    "intent": intent.value,
                    "attachment_mode": attachment_mode,
                    "attachment_document_ids": (
                        attachment_document_ids
                    ),
                    "vector_hits": vector_hit_count,
                    "bm25_hits": bm25_hit_count,
                    "rrf_selected": rrf_hit_count,
                    "reranked": rerank_count,
                    "llm_model": (
                        model
                        or settings.GEMINI_MODEL
                    ),
                    "response_time": round(
                        response_time,
                        4,
                    ),
                },
            }

        # ==========================================================
        # 9. BUILD RAG CONTEXT
        # ==========================================================

        context_parts = []

        for chunk in chunks:

            context_parts.append(
                f"Chunk ID : {chunk['chunk_id']}\n"
                f"Filename : {chunk['filename']}\n"
                f"Document ID : {chunk['document_id']}\n\n"
                f"{chunk['text']}\n"
                "----------------------------------------\n"
            )

        context = "\n".join(
            context_parts
        )

        # ==========================================================
        # 10. RAG PROMPT
        # ==========================================================

        rag_question = f"""
You are a Retrieval-Augmented Generation (RAG) assistant.

Answer the user's question ONLY using the provided document context.

IMPORTANT RULES:

1. Do not use outside knowledge.

2. Do not guess or invent information.

3. If the answer is not present in the context, reply exactly:

I couldn't find that information in the uploaded documents.

4. Use all relevant context sections when necessary.

5. Return only the chunk IDs that actually support the answer.

6. If multiple sections contain different parts of the answer, include all relevant chunk IDs.

7. Keep the answer concise but complete.

8. Do not mention the retrieval process.

9. You may perform simple calculations or derive values directly from explicit information contained in the document.

10. If the document provides the information required to calculate an answer, do not treat the answer as missing merely because the calculated value is not explicitly written.

11. When the document gives a project name, company name, job title, degree name, institution name, technology name, or other proper name explicitly, preserve the exact name from the document whenever possible.

12. For project-related questions, prefer information explicitly associated with that project in the project section.

13. If the question asks for the technologies used in a specific project, include the technologies explicitly listed next to that project name and any additional technology that the document explicitly states was used to build or implement that same project.

14. Do not infer that every technology in the candidate's Technical Skills section was used in every project.

15. When listing multiple projects, preserve each project's explicit name exactly as written in the document.

16. For project questions, the project name is mandatory when the project name is explicitly present in the document.

17. Never replace an explicit project name with a generic description.

18. When answering which projects the candidate worked on, identify each project using its exact project name from the document.

19. If an exact project name is available in the context, use that exact project name.

20. Always answer the user's question in a complete natural-language sentence.

21. For simple factual questions, answer directly in one complete sentence.

22. When returning an email address, preserve the exact email address from the document and format it as a Markdown mailto link.

23. Do not output the email address alone when the user asks a question about the candidate's email address.

24. Use the exact wording from the document for factual values, but place that value naturally inside a complete sentence.

25. When attachments are provided, treat the provided document context as the ONLY source for answering the question.

26. Never use information from another document that is not present in the provided context.

27. If the user asks a broad question such as "What is this document about?", summarize the actual uploaded document represented by the provided context.

28. For broad document questions, use the complete provided context to identify the document's main subject, purpose, major sections, and important contents.

29. Do not describe the document using only one retrieved section when multiple context sections are available.

30. When summarizing an attached document, prioritize the document's actual content and structure rather than making assumptions based on the filename alone.

31. If the context contains resume information, answer resume-related questions using the resume content only.

32. Do not confuse one uploaded document with another document.

33. For broad document questions, consider all provided chunks belonging to the selected attachment before forming the answer.

34. For broad document questions, return citations for the chunks that support the summary.

35. Never cite a chunk that does not actually support the answer.

36. Return ONLY valid JSON.

Return exactly this format:

{{
    "answer": "",
    "citations": []
}}

DOCUMENT CONTEXT:

{context}

USER QUESTION:

{question}
"""

        # ==========================================================
        # 11. GEMINI GENERATION
        # ==========================================================

        gemini = GeminiService(
            model=model,
        )

        response = gemini.generate(
            session_id=session_id,
            question=rag_question,
            save_user_message=None,
            save_history=False,
            model=model,
        )

        # ==========================================================
        # 12. CLEAN GEMINI RESPONSE
        # ==========================================================

        if response is None:

            response = ""

        response = (
            response
            .replace("```json", "")
            .replace("```JSON", "")
            .replace("```", "")
            .strip()
        )

        # ==========================================================
        # 13. PARSE JSON
        # ==========================================================

        try:

            parsed = json.loads(
                response
            )

            if not isinstance(
                parsed,
                dict,
            ):

                raise ValueError(
                    "Gemini response JSON is not an object."
                )

            answer = parsed.get(
                "answer",
                "",
            )

            llm_chunk_ids = parsed.get(
                "citations",
                [],
            )

            if not isinstance(
                answer,
                str,
            ):

                answer = str(
                    answer
                    or ""
                )

            if not isinstance(
                llm_chunk_ids,
                list,
            ):

                llm_chunk_ids = []

        except (
            json.JSONDecodeError,
            TypeError,
            ValueError,
        ):

            print(
                "Gemini returned invalid JSON."
            )

            answer = response

            llm_chunk_ids = []

        # ==========================================================
        # 14. SAVE CONVERSATION
        # ==========================================================

        # Validate citation IDs before saving them.
        valid_chunk_ids = {
            chunk["chunk_id"]
            for chunk in chunks
        }

        valid_llm_chunk_ids = []

        for chunk_id in llm_chunk_ids:

            if chunk_id in valid_chunk_ids:

                valid_llm_chunk_ids.append(
                    chunk_id
                )

        RagService.save_conversation(
            user_id=user_id,
            session_id=session_id,
            workspace_id=workspace_id,
            question=question,
            answer=answer,
            citations=valid_llm_chunk_ids,
        )

        # ==========================================================
        # 15. VERIFICATION
        # ==========================================================

        verification = {
            "verified": None,
            "message": (
                "Verification disabled to reduce API calls."
            ),
        }

        # ==========================================================
        # 16. RETRIEVED CHUNK METADATA
        # ==========================================================

        retrieved_chunks = []

        for chunk in chunks:

            retrieved_chunks.append(
                {
                    "chunk_id": chunk["chunk_id"],
                    "filename": chunk["filename"],
                    "document_id": chunk["document_id"],
                    "distance": round(
                        chunk.get(
                            "distance",
                            0,
                        ),
                        4,
                    ),
                    "bm25_score": round(
                        chunk.get(
                            "bm25_score",
                            0,
                        ),
                        4,
                    ),
                    "rrf_score": round(
                        chunk.get(
                            "rrf_score",
                            0,
                        ),
                        6,
                    ),
                    "rerank_score": round(
                        chunk.get(
                            "rerank_score",
                            0,
                        ),
                        4,
                    ),
                }
            )

        # ==========================================================
        # 17. RESPONSE TIME
        # ==========================================================

        response_time = (
            time.perf_counter()
            - start_time
        )

        # ==========================================================
        # 18. VALIDATE CITATIONS
        # ==========================================================

        citations = []

        seen_files = set()

        for chunk_id in valid_llm_chunk_ids:

            for chunk in chunks:

                if (
                    chunk["chunk_id"]
                    != chunk_id
                ):
                    continue

                filename = chunk[
                    "filename"
                ]

                # Keep one citation chip per filename.
                if filename in seen_files:
                    break

                citations.append(
                    {
                        "filename": filename,
                        "chunk_id": (
                            chunk["chunk_id"]
                        ),
                    }
                )

                seen_files.add(
                    filename
                )

                break

        # ==========================================================
        # 19. SAVE RETRIEVAL METRICS
        # ==========================================================

        metrics_db = SessionLocal()

        try:

            metric = RetrievalMetric(
                user_id=user_id,
                session_id=session_id,
                workspace_id=workspace_id,
                question=question,

                vector_hits=vector_hit_count,
                bm25_hits=bm25_hit_count,
                rrf_selected=rrf_hit_count,
                reranked=rerank_count,

                retrieved_chunks=retrieved_chunks,

                response_time=round(
                    response_time,
                    4,
                ),

                llm_model=(
                    model
                    or settings.GEMINI_MODEL
                ),

                status="success",
            )

            metrics_db.add(
                metric
            )

            metrics_db.commit()

            metrics_db.refresh(
                metric
            )

            print(
                f"Retrieval metric saved: {metric.id}"
            )

        except Exception as e:

            metrics_db.rollback()

            print(
                "Failed to save retrieval metric:",
                str(e),
            )

        finally:

            metrics_db.close()

        # ==========================================================
        # 20. FINAL RESPONSE
        # ==========================================================

        return {
            "answer": answer,

            "citations": citations,

            "retrieved_chunks": retrieved_chunks,

            "verification": verification,

            "pipeline": {

                "original_query": question,

                "rewritten_query": rewritten_question,

                "intent": intent.value,

                "attachment_mode": attachment_mode,

                "attachment_document_ids": (
                    attachment_document_ids
                ),

                "vector_hits": vector_hit_count,

                "bm25_hits": bm25_hit_count,

                "rrf_selected": rrf_hit_count,

                "reranked": rerank_count,

                "llm_model": (
                    model
                    or settings.GEMINI_MODEL
                ),

                "response_time": round(
                    response_time,
                    4,
                ),

            },

        }