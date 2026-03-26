import asyncio
from sqlalchemy import select

from app.db.models.user import User
from app.db.models.workflow_run import WorkflowRun
from app.db.session import SessionLocal
from app.services.log_service import fetch_and_store_run_logs


def fetch_run_logs_background(user_id: str, run_id: str) -> None:
    db = SessionLocal()
    try:
        user = db.scalar(select(User).where(User.id == user_id))
        run = db.scalar(select(WorkflowRun).where(WorkflowRun.id == run_id))
        if user is None or run is None:
            return
        asyncio.run(fetch_and_store_run_logs(db, user, run))
    finally:
        db.close()
