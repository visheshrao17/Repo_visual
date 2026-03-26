from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.schemas.auth import AuthResponse
from app.db.session import get_db
from app.services.auth_service import github_oauth_callback

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/github/login")
def github_login() -> RedirectResponse:
    settings = get_settings()
    url = (
        "https://github.com/login/oauth/authorize"
        f"?client_id={settings.github_client_id}"
        f"&redirect_uri={settings.github_redirect_uri}"
        "&scope=repo%20workflow%20read:user%20user:email"
    )
    return RedirectResponse(url=url, status_code=status.HTTP_307_TEMPORARY_REDIRECT)


@router.get("/github/callback", response_model=AuthResponse)
async def github_callback(code: str = Query(...), db: Session = Depends(get_db)) -> AuthResponse:
    if not code:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing OAuth code")

    token = await github_oauth_callback(code=code, db=db)
    return AuthResponse(access_token=token)
