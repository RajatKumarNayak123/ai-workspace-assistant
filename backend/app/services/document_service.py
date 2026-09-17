import os

from fastapi import UploadFile
from sqlalchemy.orm import Session
from app.models.workspace import Workspace
from app.models.document import Document
from app.repositories.document_repository import DocumentRepository
from app.utils.document_parser import DocumentParser
from app.utils.text_chunker import TextChunker
from app.vectorstore.vector_service import VectorService


UPLOAD_DIR = "uploads/documents"


class DocumentService:

    @staticmethod
    def upload_document(
        db: Session,
        workspace_id: int,
        file: UploadFile,
    ):

        os.makedirs(
            UPLOAD_DIR,
            exist_ok=True,
        )

        file_path = os.path.join(
            UPLOAD_DIR,
            file.filename,
        )

        file_path = file_path.replace("\\", "/")

        with open(
            file_path,
            "wb",
        ) as buffer:
            buffer.write(
                file.file.read()
            )

        document = Document(
            filename=file.filename,
            file_path=file_path,
            file_type=file.content_type,
            workspace_id=workspace_id,
        )

        document = DocumentRepository.create(
            db,
            document,
        )

        text = DocumentParser.extract_text(
            file_path
        )

        chunks = TextChunker.chunk(
            text
        )

        for index, chunk in enumerate(chunks):

            VectorService.add_document(
                chunk=chunk,
                document_id=f"{document.id}_{index}",
                workspace_id=document.workspace_id,
                document_db_id=document.id,
                filename=document.filename,
            )

        return document

    @staticmethod
    def get_documents(
        db: Session,
        workspace_id: int,
    ):
        return DocumentRepository.get_by_workspace(
            db,
            workspace_id,
        )


    # ==========================================================
    # SEARCH DOCUMENTS
    # ==========================================================

    @staticmethod
    def search_documents(
        db: Session,
        workspace_id: int,
        search_term: str,
    ):

        search_term = search_term.strip()

        if not search_term:
            return []

        documents = (
            DocumentRepository.search_by_filename(
                db=db,
                workspace_id=workspace_id,
                search_term=search_term,
            )
        )

        return documents


    # ==========================================================
    # PREVIEW DOCUMENT
    # ==========================================================

    @staticmethod
    def get_document_file(
        db: Session,
        workspace_id: int,
        document_id: int,
    ):

        document = (
            db.query(Document)
            .filter(
                Document.id == document_id,
                Document.workspace_id == workspace_id,
            )
            .first()
        )

        if not document:
            raise ValueError(
                "Document not found."
            )

        file_path = document.file_path

        if not file_path or not os.path.exists(file_path):
            raise FileNotFoundError(
                "Document file not found."
            )

        return document

    

    @staticmethod
    def delete_document(
        db: Session,
        workspace_id: int,
        document_id: int,
    ):

        document = (
            db.query(Document)
            .filter(
                Document.id == document_id,
                Document.workspace_id == workspace_id,
            )
            .first()
        )

        if not document:
            raise ValueError(
                "Document not found."
            )

    # ------------------------------------------
    # 1. Delete vectors from Chroma
    # ------------------------------------------

        deleted_vectors = (
            VectorService.delete_document_vectors(
                document.id
            )
        )

    # ------------------------------------------
    # 2. Delete physical file safely
    # ------------------------------------------

        file_path = document.file_path

        other_documents = (
            DocumentRepository.count_by_file_path(
                db=db,
                file_path=file_path,
                exclude_document_id=document.id,
            )
        )

        if (
            file_path
            and os.path.exists(file_path)
            and other_documents == 0
        ):

            os.remove(file_path)

            print("=" * 80)
            print("PHYSICAL FILE DELETED")
            print(f"File : {file_path}")
            print("=" * 80)

        elif other_documents > 0:

            print("=" * 80)
            print("PHYSICAL FILE NOT DELETED")
            print("Another database record uses the same file path.")
            print(f"File : {file_path}")
            print("=" * 80)

    # ------------------------------------------
    # 3. Delete database record
    # ------------------------------------------

        DocumentRepository.delete(
            db,
            document,
        )

    # ------------------------------------------
    # 4. Return result
    # ------------------------------------------

        return {
            "message": "Document deleted successfully.",
            "document_id": document_id,
            "filename": document.filename,
            "deleted_vectors": deleted_vectors,
        }


    # ==========================================================
    # DELETE ALL USER DOCUMENTS
    # ==========================================================

    @staticmethod
    def delete_all_user_documents(
        db: Session,
        user_id: int,
    ):

        print("=" * 80)
        print("DELETE ALL USER DOCUMENTS DEBUG")
        print(f"Current User ID : {user_id}")
        print("=" * 80)

    # ======================================================
    # 1. GET ALL WORKSPACES
    # ======================================================

        workspaces = (
            db.query(Workspace)
            .all()
        )

        print("=" * 80)
        print("ALL WORKSPACES")
        print(f"Total Workspaces : {len(workspaces)}")

        for workspace in workspaces:

            print(
                f"Workspace ID: {workspace.id} | "
                f"Name: {workspace.name} | "
                f"Owner ID: {workspace.owner_id}"
            )

        print("=" * 80)

    # ======================================================
    # 2. GET USER'S WORKSPACES
    # ======================================================

        user_workspaces = (
            db.query(Workspace)
            .filter(
                Workspace.owner_id == user_id
            )
            .all()
        )

        print("=" * 80)
        print("USER WORKSPACES")
        print(f"Current User ID : {user_id}")
        print(
            f"Workspaces Found : "
            f"{len(user_workspaces)}"
        )

        for workspace in user_workspaces:

            print(
                f"Workspace ID: {workspace.id} | "
                f"Name: {workspace.name} | "
                f"Owner ID: {workspace.owner_id}"
            )

        print("=" * 80)

    # ======================================================
    # 3. GET ALL DOCUMENTS THROUGH WORKSPACE OWNERSHIP
    # ======================================================

        documents = (
            db.query(Document)
            .join(
                Workspace,
                Document.workspace_id == Workspace.id,
            )
            .filter(
                Workspace.owner_id == user_id
            )
            .all()
        )

        print("=" * 80)
        print("DOCUMENTS BELONGING TO USER")
        print(f"Documents Found : {len(documents)}")

        for document in documents:

            print(
                f"Document ID: {document.id} | "
                f"Filename: {document.filename} | "
                f"Workspace ID: {document.workspace_id}"
            )

        print("=" * 80)

        documents_deleted = 0
        vectors_deleted = 0
        files_deleted = 0

    # ======================================================
    # 4. DELETE EACH DOCUMENT
    # ======================================================

        for document in documents:

        # --------------------------------------------------
        # DELETE CHROMA VECTORS
        # --------------------------------------------------

            deleted_vectors = (
                VectorService.delete_document_vectors(
                    document.id
                )
            )

            vectors_deleted += deleted_vectors

        # --------------------------------------------------
        # DELETE PHYSICAL FILE
        # --------------------------------------------------

            file_path = document.file_path

            if (
                file_path
                and os.path.exists(file_path)
            ):

                other_documents = (
                    DocumentRepository.count_by_file_path(
                        db=db,
                        file_path=file_path,
                        exclude_document_id=document.id,
                    )
                )

                if other_documents == 0:

                    os.remove(file_path)

                    files_deleted += 1

                    print("=" * 80)
                    print("PHYSICAL FILE DELETED")
                    print(f"File : {file_path}")
                    print("=" * 80)

        # --------------------------------------------------
        # DELETE DATABASE RECORD
        # --------------------------------------------------

            db.delete(document)

            documents_deleted += 1

    # ======================================================
    # 5. FLUSH
    # ======================================================

        db.flush()

        print("=" * 80)
        print("DELETE RESULT")
        print(f"Documents Deleted : {documents_deleted}")
        print(f"Vectors Deleted   : {vectors_deleted}")
        print(f"Files Deleted     : {files_deleted}")
        print("=" * 80)

        return {
            "documents_deleted": documents_deleted,
            "vectors_deleted": vectors_deleted,
            "files_deleted": files_deleted,
        }