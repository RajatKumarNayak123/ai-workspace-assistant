from datetime import datetime
import time

from app.schemas.health import HealthResponse


# Application start time
START_TIME = time.time()


def get_health_status() -> HealthResponse:

    uptime = round(time.time() - START_TIME, 2)

    return HealthResponse(
        status="UP",
        application="AI Workspace Assistant",
        version="1.0.0",
        timestamp=datetime.now().isoformat(),
        uptime_seconds=uptime,
    )