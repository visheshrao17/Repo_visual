from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.db.models.user import User
from app.db.schemas.user import UserOut

router = APIRouter(tags=["users"])


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)) -> UserOut:
    return UserOut.model_validate(current_user)
