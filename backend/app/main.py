from fastapi import FastAPI

from app.api.routes import (
    auth_router,
    jobs_router,
    logs_router,
    repositories_router,
    runs_router,
    trigger_router,
    users_router,
    workflows_router,
)
from app.core.config import get_settings
from app.core.logging import configure_logging, logging_middleware

settings = get_settings()
configure_logging(settings.log_level)

app = FastAPI(title="Repository + DevOps + CI/CD Visualizer API", version="1.0.0")
app.middleware("http")(logging_middleware)


@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(auth_router)
app.include_router(users_router)
app.include_router(repositories_router)
app.include_router(workflows_router)
app.include_router(runs_router)
app.include_router(jobs_router)
app.include_router(trigger_router)
app.include_router(logs_router)
