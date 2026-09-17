import logging
import os

# Create logs directory if it doesn't exist
os.makedirs("logs", exist_ok=True)

logger = logging.getLogger("AI-Workspace")

logger.setLevel(logging.INFO)

# Prevent duplicate logs
logger.propagate = False

if not logger.handlers:

    formatter = logging.Formatter(
        "%(asctime)s | %(levelname)s | %(message)s"
    )

    # Console Logger
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)

    # File Logger
    file_handler = logging.FileHandler(
        "logs/application.log",
        encoding="utf-8"
    )
    file_handler.setFormatter(formatter)

    logger.addHandler(console_handler)
    logger.addHandler(file_handler)

    