import smtplib
from email.message import EmailMessage

from app.config.settings import settings


class EmailService:

    @staticmethod
    def send_email(
        to_email: str,
        subject: str,
        body: str,
    ) -> None:

        message = EmailMessage()

        message["From"] = settings.SMTP_EMAIL
        message["To"] = to_email
        message["Subject"] = subject

        message.set_content(body)

        with smtplib.SMTP(
            settings.SMTP_HOST,
            settings.SMTP_PORT,
        ) as server:

            server.starttls()

            server.login(
                settings.SMTP_EMAIL,
                settings.SMTP_PASSWORD,
            )

            server.send_message(message)