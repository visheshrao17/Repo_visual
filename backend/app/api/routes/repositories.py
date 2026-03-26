from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.models.user import User
from app.db.schemas.repository import RepositoryOut
from app.db.session import get_db
from app.services.repository_service import list_repositories_for_user, sync_user_repositories
from app.utils.pagination import PaginatedResponse, paginate

router = APIRouter(prefix="/repos", tags=["repositories"])


@router.get("", response_model=PaginatedResponse)
def list_repositories(
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PaginatedResponse:
    repos = list_repositories_for_user(db, str(current_user.id))
    payload = [RepositoryOut.model_validate(repo).model_dump() for repo in repos]
    return paginate(payload, page, per_page)


@router.post("/sync", response_model=PaginatedResponse)
async def sync_repositories(
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PaginatedResponse:
    repos = await sync_user_repositories(db, current_user)
    payload = [RepositoryOut.model_validate(repo).model_dump() for repo in repos]
    return paginate(payload, page, per_page)
