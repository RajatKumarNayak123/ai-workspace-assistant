import json

from sqlalchemy.orm import Session

from app.models.conversation import Conversation
from app.models.conversation_message import ConversationMessage


class ConversationRepository:

    # ==========================================================
    # CREATE CONVERSATION
    # ==========================================================

    @staticmethod
    def create_conversation(
        db: Session,
        user_id: int,
        session_id: str,
        title: str = "New conversation",
        workspace_id: int | None = None,
    ):

        conversation = Conversation(
            user_id=user_id,
            session_id=session_id,
            title=title,
            workspace_id=workspace_id,
        )

        db.add(conversation)

        db.flush()

        return conversation

    # ==========================================================
    # GET CONVERSATION BY USER + SESSION
    # ==========================================================

    @staticmethod
    def get_by_session(
        db: Session,
        user_id: int,
        session_id: str,
    ):

        return (
            db.query(Conversation)
            .filter(
                Conversation.user_id == user_id,
                Conversation.session_id == session_id,
            )
            .first()
        )

    # ==========================================================
    # GET ALL USER CONVERSATIONS
    # ==========================================================

    @staticmethod
    def get_user_conversations(
        db: Session,
        user_id: int,
    ):

        return (
            db.query(Conversation)
            .filter(
                Conversation.user_id == user_id,
            )
            .order_by(
                Conversation.last_message_at.desc(),
                Conversation.created_at.desc(),
                Conversation.id.desc(),
            )
            .all()
        )

    # ==========================================================
    # ADD MESSAGE
    # ==========================================================

    @staticmethod
    def add_message(
        db: Session,
        conversation: Conversation,
        role: str,
        content: str,
        citations=None,
        message_type: str = "text",
        image_url: str | None = None,
        image_prompt: str | None = None,
        image_model: str | None = None,
    ):

        citations_json = None

        if citations is not None:
            citations_json = json.dumps(
                citations,
                ensure_ascii=False,
            )

        message = ConversationMessage(
            conversation_id=conversation.id,
            role=role,
            content=content,
            citations=citations_json,
            message_type=message_type,
            image_url=image_url,
            image_prompt=image_prompt,
            image_model=image_model,
        )

        db.add(message)

        # ------------------------------------------------------
        # Flush so SQLAlchemy sends the INSERT before we update
        # the conversation activity timestamp.
        # ------------------------------------------------------

        db.flush()

        # ------------------------------------------------------
        # Use database-generated message timestamp.
        # ------------------------------------------------------

        if message.created_at is not None:
            conversation.last_message_at = message.created_at

        return message

    # ==========================================================
    # GET MESSAGES
    # ==========================================================

    @staticmethod
    def get_messages(
        db: Session,
        conversation: Conversation,
    ):

        return (
            db.query(ConversationMessage)
            .filter(
                ConversationMessage.conversation_id
                == conversation.id,
            )
            .order_by(
                ConversationMessage.created_at.asc(),
                ConversationMessage.id.asc(),
            )
            .all()
        )

    # ==========================================================
    # UPDATE TITLE
    # ==========================================================

    @staticmethod
    def update_title(
        db: Session,
        conversation: Conversation,
        title: str,
    ):

        conversation.title = title

        db.flush()

        return conversation



    # ==========================================================
    # GET ALL CONVERSATIONS BELONGING TO USER
    # ==========================================================

    @staticmethod
    def get_by_user(
        db: Session,
        user_id: int,
    ):

        return (
            db.query(Conversation)
            .filter(
                Conversation.user_id == user_id
            )
            .all()
        )

    # ==========================================================
    # DELETE CONVERSATION
    # ==========================================================

    @staticmethod
    def delete(
        db: Session,
        conversation: Conversation,
    ):

        db.delete(conversation)


# ==========================================================
# DELETE ALL USER CONVERSATIONS
# ==========================================================

    @staticmethod
    def delete_all_user_conversations(
        db: Session,
        user_id: int,
    ):

        conversations = (
            db.query(Conversation)
            .filter(
                Conversation.user_id == user_id,
            )
            .all()
        )

        conversations_deleted = len(
            conversations
        )

        messages_deleted = 0

    # ------------------------------------------------------
    # DELETE CONVERSATIONS
    # ------------------------------------------------------

        for conversation in conversations:

        # Count messages before deletion
            messages_deleted += len(
                conversation.messages
            )

            db.delete(conversation)

    # ------------------------------------------------------
    # FLUSH
    # ------------------------------------------------------

        db.flush()

        return {
            "conversations_deleted": conversations_deleted,
            "messages_deleted": messages_deleted,
        }    