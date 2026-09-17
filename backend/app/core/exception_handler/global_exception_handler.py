from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.utils.logger import logger


def register_global_exception_handler(app: FastAPI):

    @app.exception_handler(Exception)
    async def global_exception_handler(
        request: Request,
        exc: Exception
    ):

        logger.exception("Unhandled Exception")

        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": "Internal Server Error"
            }
        )