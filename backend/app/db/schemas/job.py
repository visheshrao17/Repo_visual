from uuid import UUID
from datetime import datetime
from pydantic import BaseModel

from app.db.schemas.common import ORMModel


class JobOut(ORMModel):
    id: UUID
    run_id: UUID
    github_job_id: str
    name: str
    status: str | None
    conclusion: str | None
    started_at: datetime | None
    completed_at: datetime | None


class JobGraphNode(BaseModel):
    id: str
    status: str | None


class JobGraphEdge(BaseModel):
    source: str
    target: str


class JobGraphResponse(BaseModel):
    nodes: list[JobGraphNode]
    edges: list[JobGraphEdge]
