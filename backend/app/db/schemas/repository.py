from uuid import UUID
from datetime import datetime

from app.db.schemas.common import ORMModel


class RepositoryOut(ORMModel):
    id: UUID
    user_id: UUID
    repo_name: str
    owner: str
    repo_url: str
    is_private: bool
    created_at: datetime
