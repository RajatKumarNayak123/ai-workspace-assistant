from sqlalchemy import text

from app.database.database import engine


def test_database_connection():

    try:

        with engine.connect() as connection:

            connection.execute(text("SELECT 1"))

            return {
                "status": "CONNECTED",
                "database": "MySQL"
            }

    except Exception as e:

        return {
            "status": "FAILED",
            "error": str(e)
        }