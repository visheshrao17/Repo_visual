from typing import Any
import httpx
from fastapi import HTTPException, status

from app.core.config import get_settings

GITHUB_API_BASE = "https://api.github.com"
GITHUB_OAUTH_BASE = "https://github.com/login/oauth"


def _build_headers(access_token: str | None = None) -> dict[str, str]:
    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    if access_token:
        headers["Authorization"] = f"Bearer {access_token}"
    return headers


def _raise_for_status(response: httpx.Response) -> None:
    if response.status_code == 403 and response.headers.get("x-ratelimit-remaining") == "0":
        reset_at = response.headers.get("x-ratelimit-reset")
        detail = "GitHub API rate limit exceeded"
        if reset_at:
            detail = f"{detail}. Reset at epoch {reset_at}."
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=detail)

    if response.status_code >= 400:
        try:
            payload = response.json()
            detail = payload.get("message", "GitHub API error")
        except Exception:
            detail = response.text or "GitHub API error"
        raise HTTPException(status_code=response.status_code, detail=detail)


async def exchange_code_for_token(code: str) -> str:
    settings = get_settings()
    payload = {
        "client_id": settings.github_client_id,
        "client_secret": settings.github_client_secret,
        "code": code,
        "redirect_uri": settings.github_redirect_uri,
    }
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.post(
            f"{GITHUB_OAUTH_BASE}/access_token",
            data=payload,
            headers={"Accept": "application/json"},
        )
    _raise_for_status(response)
    data = response.json()
    token = data.get("access_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Could not get GitHub access token")
    return token


async def get_user(access_token: str) -> dict[str, Any]:
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.get(f"{GITHUB_API_BASE}/user", headers=_build_headers(access_token))
    _raise_for_status(response)
    return response.json()


async def get_repos(access_token: str, page: int = 1, per_page: int = 50) -> list[dict[str, Any]]:
    params = {"sort": "updated", "page": page, "per_page": per_page}
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.get(f"{GITHUB_API_BASE}/user/repos", params=params, headers=_build_headers(access_token))
    _raise_for_status(response)
    return response.json()


async def get_workflows(owner: str, repo: str, access_token: str) -> list[dict[str, Any]]:
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.get(
            f"{GITHUB_API_BASE}/repos/{owner}/{repo}/actions/workflows",
            headers=_build_headers(access_token),
        )
    _raise_for_status(response)
    data = response.json()
    return data.get("workflows", [])


async def get_workflow_runs(owner: str, repo: str, access_token: str, page: int = 1, per_page: int = 50) -> list[dict[str, Any]]:
    params = {"page": page, "per_page": per_page}
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.get(
            f"{GITHUB_API_BASE}/repos/{owner}/{repo}/actions/runs",
            params=params,
            headers=_build_headers(access_token),
        )
    _raise_for_status(response)
    data = response.json()
    return data.get("workflow_runs", [])


async def get_jobs(owner: str, repo: str, run_id: str, access_token: str) -> list[dict[str, Any]]:
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.get(
            f"{GITHUB_API_BASE}/repos/{owner}/{repo}/actions/runs/{run_id}/jobs",
            headers=_build_headers(access_token),
        )
    _raise_for_status(response)
    data = response.json()
    return data.get("jobs", [])


async def trigger_workflow(owner: str, repo: str, workflow_id: str, branch: str, access_token: str) -> None:
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.post(
            f"{GITHUB_API_BASE}/repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches",
            json={"ref": branch},
            headers=_build_headers(access_token),
        )
    _raise_for_status(response)


async def download_logs(owner: str, repo: str, run_id: str, access_token: str) -> bytes:
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.get(
            f"{GITHUB_API_BASE}/repos/{owner}/{repo}/actions/runs/{run_id}/logs",
            headers=_build_headers(access_token),
        )
    _raise_for_status(response)
    return response.content
