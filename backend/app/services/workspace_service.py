from sqlalchemy.orm import Session

from app.models.workspace import Workspace
from app.models.user import User
from app.repositories.workspace_repository import WorkspaceRepository


class WorkspaceService:

    @staticmethod
    def create_workspace(
        db: Session,
        current_user: User,
        name: str,
        description: str | None = None,
    ):

        workspace = Workspace(
            name=name,
            description=description,
            owner_id=current_user.id,
        )

        return WorkspaceRepository.create(
            db,
            workspace,
        )


    @staticmethod
    def get_user_workspaces(
        db: Session,
        current_user: User,
    ):
        return WorkspaceRepository.get_by_owner(
            db=db,
            owner_id=current_user.id,
        )