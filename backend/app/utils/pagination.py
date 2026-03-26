from collections.abc import Sequence
from math import ceil
from pydantic import BaseModel


class PageMeta(BaseModel):
    page: int
    per_page: int
    total: int
    total_pages: int


class PaginatedResponse(BaseModel):
    items: list
    meta: PageMeta


def paginate(items: Sequence, page: int, per_page: int) -> PaginatedResponse:
    total = len(items)
    total_pages = max(1, ceil(total / per_page)) if per_page > 0 else 1
    start = (page - 1) * per_page
    end = start + per_page
    sliced = list(items[start:end])
    return PaginatedResponse(
        items=sliced,
        meta=PageMeta(page=page, per_page=per_page, total=total, total_pages=total_pages),
    )
