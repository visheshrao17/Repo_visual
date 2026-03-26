from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.models.user import User
from app.db.session import get_db
from app.services.workflow_service import trigger_workflow_for_user

router = APIRouter(prefix="/workflows", tags=["trigger"])


class TriggerRequest(BaseModel):
    branch: str = Field(default="main")


@router.post("/{workflow_id}/trigger")
async def trigger_pipeline(
    workflow_id: str,
    payload: TriggerRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, str]:
    await trigger_workflow_for_user(db, current_user, workflow_id, payload.branch)
    return {"status": "triggered"}
