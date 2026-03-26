from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.models.repository import Repository
from app.db.models.user import User
from app.db.models.workflow import Workflow
from app.db.models.workflow_run import WorkflowRun
from app.db.schemas.job import JobGraphResponse
from app.db.session import get_db
from app.services.graph_service import jobs_to_graph
from app.services.workflow_service import sync_jobs_for_run

router = APIRouter(tags=["jobs"])


@router.get("/runs/{run_id}/jobs", response_model=JobGraphResponse)
async def get_run_jobs_graph(
    run_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> JobGraphResponse:
    run = db.scalar(select(WorkflowRun).where(WorkflowRun.id == run_id))
    if run is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Run not found")

    workflow = db.scalar(select(Workflow).where(Workflow.id == run.workflow_id))
    repo = db.scalar(select(Repository).where(Repository.id == workflow.repo_id)) if workflow else None
    if workflow is None or repo is None or repo.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Run not found")

    jobs = await sync_jobs_for_run(db, current_user, run, repo)
    return jobs_to_graph(jobs)
