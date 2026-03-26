from uuid import UUID
from datetime import datetime

from app.db.schemas.common import ORMModel


class UserOut(ORMModel):
    id: UUID
    github_id: str
    username: str
    email: str | None
    avatar_url: str | None
    created_at: datetime
