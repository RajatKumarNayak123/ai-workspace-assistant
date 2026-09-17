from sqlalchemy.orm import Session

from app.models.document import Document
from app.models.workspace import Workspace
from app.models.conversation import Conversation
from app.models.conversation_message import ConversationMessage


class GlobalSearchService:

    @staticmethod
    def search(
        db: Session,
        user_id: int,
        query: str,
    ):

        query = query.strip()

        if not query:
            return {
                "query": "",
                "results": [],
                "total": 0,
            }

        search_pattern = f"%{query}%"

        results = []

        # ======================================================
        # DOCUMENTS
        # ======================================================

        documents = (
            db.query(Document)
            .join(
                Workspace,
                Document.workspace_id == Workspace.id,
            )
            .filter(
                Workspace.owner_id == user_id,
                Document.filename.ilike(search_pattern),
            )
            .order_by(
                Document.created_at.desc(),
            )
            .limit(10)
            .all()
        )

        for document in documents:

            results.append(
                {
                    "type": "document",
                    "id": document.id,
                    "title": document.filename,
                    "subtitle": document.file_type,
                    "workspace_id": document.workspace_id,
                    "url": None,
                }
            )

        # ======================================================
        # WORKSPACES
        # ======================================================

        workspaces = (
            db.query(Workspace)
            .filter(
                Workspace.owner_id == user_id,
                (
                    Workspace.name.ilike(search_pattern)
                    |
                    Workspace.description.ilike(
                        search_pattern
                    )
                ),
            )
            .order_by(
                Workspace.updated_at.desc(),
            )
            .limit(10)
            .all()
        )

        for workspace in workspaces:

            results.append(
                {
                    "type": "workspace",
                    "id": workspace.id,
                    "title": workspace.name,
                    "subtitle": (
                        workspace.description
                        or "Workspace"
                    ),
                    "workspace_id": workspace.id,
                    "url": None,
                }
            )

        # ======================================================
        # CHAT MESSAGES
        # ======================================================

        messages = (
            db.query(
                ConversationMessage,
                Conversation,
            )
            .join(
                Conversation,
                ConversationMessage.conversation_id
                == Conversation.id,
            )
            .filter(
                Conversation.user_id == user_id,
                ConversationMessage.content.ilike(
                    search_pattern
                ),
            )
            .order_by(
                ConversationMessage.created_at.desc(),
            )
            .limit(20)
            .all()
        )

        for message, conversation in messages:

            content = message.content or ""

            # Keep search result readable.
            # Remove excessive whitespace.
            preview = " ".join(
                content.split()
            )

            if len(preview) > 100:
                preview = (
                    preview[:100]
                    + "..."
                )

            results.append(
                {
                    "type": "message",
                    "id": message.id,

                    # Conversation title
                    "title": (
                        conversation.title
                        or "Conversation"
                    ),

                    # Matching message preview
                    "subtitle": preview,

                    "workspace_id": (
                        conversation.workspace_id
                    ),

                    "session_id": (
                        conversation.session_id
                    ),

                    # IMPORTANT
                    "message_id": message.id,

                    "role": message.role,

                    "url": None,
                }
            )

        # ======================================================
        # FINAL RESPONSE
        # ======================================================

        return {
            "query": query,
            "results": results,
            "total": len(results),
        }