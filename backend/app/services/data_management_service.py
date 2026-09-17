from sqlalchemy.orm import Session

from app.repositories.conversation_repository import (
    ConversationRepository,
)


class DataManagementService:

    # ==========================================================
    # DELETE ALL USER CONVERSATIONS
    # ==========================================================

    @staticmethod
    def delete_all_conversations(
        db: Session,
        user_id: int,
    ):

        result = (
            ConversationRepository
            .delete_all_user_conversations(
                db=db,
                user_id=user_id,
            )
        )

        db.commit()

        return result