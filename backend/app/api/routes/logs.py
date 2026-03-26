from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.models.repository import Repository
from app.db.models.user import User
from app.db.models.workflow import Workflow
from app.db.models.workflow_run import WorkflowRun
from app.db.schemas.log import LogOut
from app.db.session import get_db
from app.services.log_service import fetch_and_store_run_logs, get_latest_log
from app.workers.tasks import fetch_run_logs_background

router = APIRouter(tags=["logs"])


@router.get("/runs/{run_id}/logs", response_model=LogOut)
async def get_run_logs(
    run_id: str,
    background_tasks: BackgroundTasks,
    refresh: bool = Query(default=False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> LogOut:
    run = db.scalar(select(WorkflowRun).where(WorkflowRun.id == run_id))
    if run is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Run not found")

    workflow = db.scalar(select(Workflow).where(Workflow.id == run.workflow_id))
    repo = db.scalar(select(Repository).where(Repository.id == workflow.repo_id)) if workflow else None
    if workflow is None or repo is None or repo.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Run not found")

    if refresh:
        log = await fetch_and_store_run_logs(db, current_user, run)
        return LogOut.model_validate(log)

    cached = get_latest_log(db, run_id)
    if cached is not None:
        return LogOut.model_validate(cached)

    background_tasks.add_task(fetch_run_logs_background, str(current_user.id), str(run.id))
    raise HTTPException(
        status_code=status.HTTP_202_ACCEPTED,
        detail="Logs fetch started. Retry this endpoint in a few seconds.",
    )
