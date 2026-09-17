from sqlalchemy.orm import Session

from app.models.document import Document
from app.models.workspace import Workspace

class DocumentRepository:

    @staticmethod
    def create(
        db: Session,
        document: Document,
    ):
        db.add(document)
        db.commit()
        db.refresh(document)

        return document

    @staticmethod
    def get_by_workspace(
        db: Session,
        workspace_id: int,
    ):
        return (
            db.query(Document)
            .filter(
                Document.workspace_id == workspace_id
            )
            .all()
        )

    @staticmethod
    def get_by_id(
        db: Session,
        document_id: int,
        workspace_id: int,
    ):
        return (
            db.query(Document)
            .filter(
                Document.id == document_id,
                Document.workspace_id == workspace_id,
            )
            .first()
        )

    # ==========================================================
    # GET ALL DOCUMENTS BELONGING TO USER'S WORKSPACES
    # ==========================================================

    @staticmethod
    def get_by_user(
        db: Session,
        user_id: int,
    ):

        # ======================================================
        # DEBUG: CHECK USER'S WORKSPACES
        # ======================================================

        workspaces = (
            db.query(Workspace)
            .filter(
                Workspace.owner_id == user_id
            )
            .all()
        )

        print("=" * 80)
        print("WORKSPACE DEBUG")
        print(f"Current User ID   : {user_id}")
        print(f"Workspaces Found  : {len(workspaces)}")

        for workspace in workspaces:
            print(
                f"Workspace ID: {workspace.id} | "
                f"Owner ID: {workspace.owner_id} | "
                f"Name: {workspace.name}"
            )

        print("=" * 80)

    # ======================================================
    # GET DOCUMENTS
    # ======================================================

        documents = (
            db.query(Document)
            .join(
                Workspace,
                Document.workspace_id == Workspace.id,
            )
            .filter(
                Workspace.owner_id == user_id,
            )
            .all()
        )

        print("=" * 80)
        print("DOCUMENT DEBUG")
        print(f"Documents Found : {len(documents)}")

        for document in documents:
            print(
                f"Document ID: {document.id} | "
                f"Filename: {document.filename} | "
                f"Workspace ID: {document.workspace_id}"
            )

        print("=" * 80)

        return documents

    @staticmethod
    def count_by_file_path(
        db: Session,
        file_path: str,
        exclude_document_id: int,
    ):
        return (
            db.query(Document)
            .filter(
                Document.file_path == file_path,
                Document.id != exclude_document_id,
            )
            .count()
        )

    @staticmethod
    def delete(
        db: Session,
        document: Document,
    ):
        db.delete(document)
        db.commit()



    # ==========================================================
    # SEARCH DOCUMENTS BY FILENAME
    # ==========================================================

    @staticmethod
    def search_by_filename(
        db: Session,
        workspace_id: int,
        search_term: str,
    ):

        return (
            db.query(Document)
            .filter(
                Document.workspace_id == workspace_id,
                Document.filename.ilike(
                    f"%{search_term}%"
                ),
            )
            .all()
        )   