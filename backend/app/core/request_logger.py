import time

from starlette.middleware.base import BaseHTTPMiddleware

from app.utils.logger import logger


class RequestLoggingMiddleware(BaseHTTPMiddleware):

    async def dispatch(self, request, call_next):

        start_time = time.time()

        logger.info("======================================")
        logger.info("Incoming Request")
        logger.info(f"Method      : {request.method}")
        logger.info(f"Path        : {request.url.path}")
        logger.info(f"Client IP   : {request.client.host}")
        logger.info("======================================")

        response = await call_next(request)

        process_time = time.time() - start_time

        logger.info("======================================")
        logger.info("Outgoing Response")
        logger.info(f"Status Code : {response.status_code}")
        logger.info(f"Time Taken  : {process_time:.2f} sec")
        logger.info("======================================")

        return response