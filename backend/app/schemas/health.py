from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    application: str
    version: str
    timestamp: str
    uptime_seconds: float