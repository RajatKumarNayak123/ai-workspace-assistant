from sqlalchemy.orm import Session

from app.models.notification import Notification


class NotificationService:

    # ======================================================
    # CREATE NOTIFICATION
    # ======================================================

    @staticmethod
    def create_notification(
        db: Session,
        user_id: int,
        notification_type: str,
        title: str,
        message: str,
        target_type: str | None = None,
        target_id: str | None = None,
    ) -> Notification:

        notification = Notification(
            user_id=user_id,
            type=notification_type,
            title=title,
            message=message,
            is_read=False,
            target_type=target_type,
            target_id=target_id,
        )

        db.add(notification)
        db.commit()
        db.refresh(notification)

        return notification


    # ======================================================
    # GET USER NOTIFICATIONS
    # ======================================================

    @staticmethod
    def get_notifications(
        db: Session,
        user_id: int,
        limit: int = 20,
    ):

        notifications = (
            db.query(Notification)
            .filter(
                Notification.user_id == user_id
            )
            .order_by(
                Notification.created_at.desc()
            )
            .limit(limit)
            .all()
        )

        unread_count = (
            db.query(Notification)
            .filter(
                Notification.user_id == user_id,
                Notification.is_read == False,
            )
            .count()
        )

        return notifications, unread_count


    # ======================================================
    # MARK SINGLE NOTIFICATION AS READ
    # ======================================================

    @staticmethod
    def mark_as_read(
        db: Session,
        user_id: int,
        notification_id: int,
    ) -> bool:

        notification = (
            db.query(Notification)
            .filter(
                Notification.id == notification_id,
                Notification.user_id == user_id,
            )
            .first()
        )

        if notification is None:
            return False

        notification.is_read = True

        db.commit()

        return True


    # ======================================================
    # MARK ALL AS READ
    # ======================================================

    @staticmethod
    def mark_all_as_read(
        db: Session,
        user_id: int,
    ) -> int:

        updated_count = (
            db.query(Notification)
            .filter(
                Notification.user_id == user_id,
                Notification.is_read == False,
            )
            .update(
                {
                    Notification.is_read: True
                },
                synchronize_session=False,
            )
        )

        db.commit()

        return updated_count


    # ======================================================
    # DELETE NOTIFICATION
    # ======================================================

    @staticmethod
    def delete_notification(
        db: Session,
        user_id: int,
        notification_id: int,
    ) -> bool:

        notification = (
            db.query(Notification)
            .filter(
                Notification.id == notification_id,
                Notification.user_id == user_id,
            )
            .first()
        )

        if notification is None:
            return False

        db.delete(notification)

        db.commit()

        return True