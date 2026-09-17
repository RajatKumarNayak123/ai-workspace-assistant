from fastapi import FastAPI
from app.api.routes import router
from fastapi.exceptions import RequestValidationError
from app.core.exception_handler import validation_exception_handler
from app.core.exception_handler.global_exception_handler import register_global_exception_handler
from app.core.request_logger import RequestLoggingMiddleware
from app.core.exceptions.business_exception import BusinessException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.exception_handler.business_exception_handler import (
    business_exception_handler,
)
from app.routes.metrics_routes import router as metrics_router
app = FastAPI(
    title="AI Workspace Assistant",
    version="1.0.0"
)

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(RequestLoggingMiddleware)

register_global_exception_handler(app)

app.add_exception_handler(
    RequestValidationError,
    validation_exception_handler,
)

app.add_exception_handler(
    BusinessException,
    business_exception_handler,
)

app.include_router(router)
app.include_router(metrics_router)

@app.get("/")
def home():
    return {
        "status": "success",
        "message": "Welcome to AI Workspace Assistant 🚀"
    }