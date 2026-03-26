from sqlalchemy import select
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.core.security import decrypt_text
from app.db.models.log import Log
from app.db.models.repository import Repository
from app.db.models.user import User
from app.db.models.workflow import Workflow
from app.db.models.workflow_run import WorkflowRun
from app.integrations.github import download_logs
from app.workers.log_worker import parse_zip_logs


def get_run_or_404(db: Session, run_id: str) -> WorkflowRun:
    run = db.scalar(select(WorkflowRun).where(WorkflowRun.id == run_id))
    if run is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Run not found")
    return run


def get_latest_log(db: Session, run_id: str) -> Log | None:
    return db.scalar(select(Log).where(Log.run_id == run_id).order_by(Log.created_at.desc()))


async def fetch_and_store_run_logs(db: Session, user: User, run: WorkflowRun) -> Log:
    workflow = db.scalar(select(Workflow).where(Workflow.id == run.workflow_id))
    if workflow is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workflow not found")

    repo = db.scalar(select(Repository).where(Repository.id == workflow.repo_id))
    if repo is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Repository not found")

    content_zip = await download_logs(repo.owner, repo.repo_name, run.github_run_id, decrypt_text(user.access_token))
    parsed = parse_zip_logs(content_zip)

    log = Log(run_id=run.id, content=parsed)
    db.add(log)
    db.commit()
    db.refresh(log)
    return log
