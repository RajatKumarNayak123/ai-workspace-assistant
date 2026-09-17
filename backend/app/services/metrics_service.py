from sqlalchemy import func

from app.database.database import SessionLocal
from app.models.retrieval_metric import RetrievalMetric


class MetricsService:

    # ==========================================
    # SUMMARY
    # ==========================================

    @staticmethod
    def get_summary(user_id: int, workspace_id: int):

        db = SessionLocal()

        try:

            total_queries = (
                db.query(
                    func.count(RetrievalMetric.id)
                )
                .filter(
                    RetrievalMetric.user_id == user_id,
                    RetrievalMetric.workspace_id
                    == workspace_id
                )
                .scalar()
                or 0
            )

            avg_response_time = (
                db.query(
                    func.avg(
                        RetrievalMetric.response_time
                    )
                )
                .filter(
                    RetrievalMetric.user_id == user_id,
                    RetrievalMetric.workspace_id
                    == workspace_id
                )
                .scalar()
            )

            avg_vector_hits = (
                db.query(
                    func.avg(
                        RetrievalMetric.vector_hits
                    )
                )
                .filter(
                    RetrievalMetric.user_id == user_id,
                    RetrievalMetric.workspace_id
                    == workspace_id
                )
                .scalar()
            )

            avg_bm25_hits = (
                db.query(
                    func.avg(
                        RetrievalMetric.bm25_hits
                    )
                )
                .filter(
                    RetrievalMetric.user_id == user_id,
                    RetrievalMetric.workspace_id
                    == workspace_id
                )
                .scalar()
            )

            avg_rrf_selected = (
                db.query(
                    func.avg(
                        RetrievalMetric.rrf_selected
                    )
                )
                .filter(
                    RetrievalMetric.user_id == user_id,
                    RetrievalMetric.workspace_id
                    == workspace_id
                )
                .scalar()
            )

            avg_reranked = (
                db.query(
                    func.avg(
                        RetrievalMetric.reranked
                    )
                )
                .filter(
                    RetrievalMetric.user_id == user_id,
                    RetrievalMetric.workspace_id
                    == workspace_id
                )
                .scalar()
            )

            successful_queries = (
                db.query(
                    func.count(RetrievalMetric.id)
                )
                .filter(
                    RetrievalMetric.user_id == user_id,
                    RetrievalMetric.workspace_id
                    == workspace_id,
                    RetrievalMetric.status
                    == "success",
                )
                .scalar()
                or 0
            )

            failed_queries = (
                db.query(
                    func.count(RetrievalMetric.id)
                )
                .filter(
                    RetrievalMetric.user_id == user_id,
                    RetrievalMetric.workspace_id
                    == workspace_id,
                    RetrievalMetric.status
                    != "success",
                )
                .scalar()
                or 0
            )

            return {
                "total_queries": total_queries,

                "successful_queries":
                    successful_queries,

                "failed_queries":
                    failed_queries,

                "average_response_time":
                    round(
                        float(
                            avg_response_time or 0
                        ),
                        2,
                    ),

                "average_vector_hits":
                    round(
                        float(
                            avg_vector_hits or 0
                        ),
                        2,
                    ),

                "average_bm25_hits":
                    round(
                        float(
                            avg_bm25_hits or 0
                        ),
                        2,
                    ),

                "average_rrf_selected":
                    round(
                        float(
                            avg_rrf_selected or 0
                        ),
                        2,
                    ),

                "average_reranked":
                    round(
                        float(
                            avg_reranked or 0
                        ),
                        2,
                    ),
            }

        finally:

            db.close()

    # ==========================================
    # RECENT METRICS
    # ==========================================

    @staticmethod
    def get_recent(
        user_id: int,
        workspace_id: int,
        limit: int = 20,
    ):

        db = SessionLocal()

        try:

            metrics = (
                db.query(
                    RetrievalMetric
                )
                .filter(
                    RetrievalMetric.user_id == user_id,
                    RetrievalMetric.workspace_id
                    == workspace_id
                )
                .order_by(
                    RetrievalMetric.created_at.desc()
                )
                .limit(limit)
                .all()
            )

            return [
                {
                    "id": metric.id,

                    "session_id":
                        metric.session_id,

                    "question":
                        metric.question,

                    "vector_hits":
                        metric.vector_hits,

                    "bm25_hits":
                        metric.bm25_hits,

                    "rrf_selected":
                        metric.rrf_selected,

                    "reranked":
                        metric.reranked,

                    "retrieved_chunks":
                        metric.retrieved_chunks,

                    "response_time":
                        metric.response_time,

                    "llm_model":
                        metric.llm_model,

                    "status":
                        metric.status,

                    "error_message":
                        metric.error_message,

                    "created_at":
                        metric.created_at,
                }

                for metric in metrics
            ]

        finally:

            db.close()

    # ==========================================
    # SESSION METRICS
    # ==========================================

    @staticmethod
    def get_session_metrics(
         user_id: int,
        session_id: str,
    ):

        db = SessionLocal()

        try:

            metrics = (
                db.query(
                    RetrievalMetric
                )
                .filter(
                    RetrievalMetric.user_id == user_id,
                    RetrievalMetric.session_id
                    == session_id
                )
                .order_by(
                    RetrievalMetric.created_at.asc()
                )
                .all()
            )

            return [
                {
                    "id": metric.id,

                    "question":
                        metric.question,

                    "vector_hits":
                        metric.vector_hits,

                    "bm25_hits":
                        metric.bm25_hits,

                    "rrf_selected":
                        metric.rrf_selected,

                    "reranked":
                        metric.reranked,

                    "response_time":
                        metric.response_time,

                    "llm_model":
                        metric.llm_model,

                    "status":
                        metric.status,

                    "created_at":
                        metric.created_at,
                }

                for metric in metrics
            ]

        finally:

            db.close()