from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import create_access_token, encrypt_text
from app.db.models.user import User
from app.integrations.github import exchange_code_for_token, get_user


async def github_oauth_callback(code: str, db: Session) -> str:
    access_token = await exchange_code_for_token(code)
    github_user = await get_user(access_token)

    github_id = str(github_user["id"])
    username = github_user.get("login", "unknown")

    stmt = select(User).where(User.github_id == github_id)
    user = db.scalar(stmt)

    if user is None:
        user = User(
            github_id=github_id,
            username=username,
            email=github_user.get("email"),
            avatar_url=github_user.get("avatar_url"),
            access_token=encrypt_text(access_token),
        )
        db.add(user)
    else:
        user.username = username
        user.email = github_user.get("email")
        user.avatar_url = github_user.get("avatar_url")
        user.access_token = encrypt_text(access_token)

    db.commit()
    db.refresh(user)

    return create_access_token(str(user.id))
