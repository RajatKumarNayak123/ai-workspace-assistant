from sqlalchemy.orm import Session

from app.models.workspace import Workspace


class WorkspaceRepository:

    @staticmethod
    def create(
        db: Session,
        workspace: Workspace,
    ):
        db.add(workspace)
        db.commit()
        db.refresh(workspace)

        return workspace


    @staticmethod
    def get_by_owner(
        db: Session,
        owner_id: int,
    ):
        return (
            db.query(Workspace)
            .filter(
                Workspace.owner_id == owner_id
            )
            .order_by(
                Workspace.created_at.desc()
            )
            .all()
        )