from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models.repository import Repository
from app.db.models.user import User
from app.integrations.github import get_repos
from app.core.security import decrypt_text


def list_repositories_for_user(db: Session, user_id: str) -> list[Repository]:
    return list(db.scalars(select(Repository).where(Repository.user_id == user_id).order_by(Repository.created_at.desc())).all())


def get_repository_or_none(db: Session, repo_id: str) -> Repository | None:
    return db.scalar(select(Repository).where(Repository.id == repo_id))


async def sync_user_repositories(db: Session, user: User) -> list[Repository]:
    access_token = decrypt_text(user.access_token)
    github_repos = await get_repos(access_token=access_token, page=1, per_page=100)

    existing = {
        f"{row.owner}/{row.repo_name}": row
        for row in db.scalars(select(Repository).where(Repository.user_id == user.id)).all()
    }

    for repo in github_repos:
        owner = repo["owner"]["login"]
        name = repo["name"]
        key = f"{owner}/{name}"
        if key in existing:
            existing_repo = existing[key]
            existing_repo.repo_url = repo.get("html_url", existing_repo.repo_url)
            existing_repo.is_private = bool(repo.get("private", False))
            continue

        db.add(
            Repository(
                user_id=user.id,
                repo_name=name,
                owner=owner,
                repo_url=repo.get("html_url", ""),
                is_private=bool(repo.get("private", False)),
            )
        )

    db.commit()
    return list_repositories_for_user(db, str(user.id))
