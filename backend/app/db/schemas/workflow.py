from uuid import UUID
from datetime import datetime

from app.db.schemas.common import ORMModel


class WorkflowOut(ORMModel):
    id: UUID
    repo_id: UUID
    github_workflow_id: str
    name: str
    state: str
    created_at: datetime
