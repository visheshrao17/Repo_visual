from uuid import UUID
from datetime import datetime

from app.db.schemas.common import ORMModel


class WorkflowRunOut(ORMModel):
    id: UUID
    workflow_id: UUID
    github_run_id: str
    status: str | None
    conclusion: str | None
    branch: str | None
    commit_sha: str | None
    started_at: datetime | None
    completed_at: datetime | None
