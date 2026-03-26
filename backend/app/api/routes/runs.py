from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.models.user import User
from app.db.schemas.workflow_run import WorkflowRunOut
from app.db.session import get_db
from app.services.repository_service import get_repository_or_none
from app.services.workflow_service import sync_runs_for_repo
from app.utils.pagination import PaginatedResponse, paginate

router = APIRouter(tags=["workflow-runs"])


@router.get("/repos/{repo_id}/runs", response_model=PaginatedResponse)
async def get_repo_runs(
    repo_id: str,
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PaginatedResponse:
    repo = get_repository_or_none(db, repo_id)
    if repo is None or repo.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Repository not found")

    runs = await sync_runs_for_repo(db, current_user, repo)
    payload = [WorkflowRunOut.model_validate(run).model_dump() for run in runs]
    return paginate(payload, page, per_page)
