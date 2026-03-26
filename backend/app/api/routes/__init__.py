from app.api.routes.auth import router as auth_router
from app.api.routes.users import router as users_router
from app.api.routes.repositories import router as repositories_router
from app.api.routes.workflows import router as workflows_router
from app.api.routes.runs import router as runs_router
from app.api.routes.jobs import router as jobs_router
from app.api.routes.trigger import router as trigger_router
from app.api.routes.logs import router as logs_router

__all__ = [
    "auth_router",
    "users_router",
    "repositories_router",
    "workflows_router",
    "runs_router",
    "jobs_router",
    "trigger_router",
    "logs_router",
]
