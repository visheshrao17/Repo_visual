from uuid import UUID
from datetime import datetime

from app.db.schemas.common import ORMModel


class LogOut(ORMModel):
    id: UUID
    run_id: UUID
    content: str
    created_at: datetime
