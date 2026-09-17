from fastapi import Request
from fastapi.responses import JSONResponse

from app.core.exceptions.business_exception import (
    BusinessException,
)


async def business_exception_handler(
    request: Request,
    exc: BusinessException,
):

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.message,
        },
    )