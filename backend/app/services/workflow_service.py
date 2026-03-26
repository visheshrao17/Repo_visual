from sqlalchemy import select
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.core.security import decrypt_text
from app.db.models.job import Job
from app.db.models.repository import Repository
from app.db.models.user import User
from app.db.models.workflow import Workflow
from app.db.models.workflow_run import WorkflowRun
from app.integrations.github import get_jobs, get_workflow_runs, get_workflows, trigger_workflow
from app.utils.datetime import parse_github_datetime


async def sync_workflows_for_repo(db: Session, user: User, repository: Repository) -> list[Workflow]:
    workflows = await get_workflows(repository.owner, repository.repo_name, decrypt_text(user.access_token))

    existing = {
        row.github_workflow_id: row
        for row in db.scalars(select(Workflow).where(Workflow.repo_id == repository.id)).all()
    }

    for wf in workflows:
        github_workflow_id = str(wf["id"])
        if github_workflow_id in existing:
            row = existing[github_workflow_id]
            row.name = wf.get("name", row.name)
            row.state = wf.get("state", row.state)
        else:
            db.add(
                Workflow(
                    repo_id=repository.id,
                    github_workflow_id=github_workflow_id,
                    name=wf.get("name", "unknown"),
                    state=wf.get("state", "active"),
                )
            )

    db.commit()
    return list(db.scalars(select(Workflow).where(Workflow.repo_id == repository.id).order_by(Workflow.created_at.desc())).all())


async def sync_runs_for_repo(db: Session, user: User, repository: Repository) -> list[WorkflowRun]:
    token = decrypt_text(user.access_token)
    remote_runs = await get_workflow_runs(repository.owner, repository.repo_name, token, page=1, per_page=100)
    workflows = {
        row.github_workflow_id: row
        for row in db.scalars(select(Workflow).where(Workflow.repo_id == repository.id)).all()
    }
    existing_runs = {
        row.github_run_id: row
        for row in db.scalars(
            select(WorkflowRun).join(Workflow).where(Workflow.repo_id == repository.id)
        ).all()
    }

    for remote in remote_runs:
        github_workflow_id = str(remote.get("workflow_id"))
        workflow = workflows.get(github_workflow_id)
        if workflow is None:
            continue

        run_id = str(remote["id"])
        if run_id in existing_runs:
            run = existing_runs[run_id]
            run.status = remote.get("status")
            run.conclusion = remote.get("conclusion")
            run.branch = remote.get("head_branch")
            run.commit_sha = remote.get("head_sha")
            run.started_at = parse_github_datetime(remote.get("run_started_at"))
            run.completed_at = parse_github_datetime(remote.get("updated_at"))
        else:
            db.add(
                WorkflowRun(
                    workflow_id=workflow.id,
                    github_run_id=run_id,
                    status=remote.get("status"),
                    conclusion=remote.get("conclusion"),
                    branch=remote.get("head_branch"),
                    commit_sha=remote.get("head_sha"),
                    started_at=parse_github_datetime(remote.get("run_started_at")),
                    completed_at=parse_github_datetime(remote.get("updated_at")),
                )
            )

    db.commit()
    return list(
        db.scalars(
            select(WorkflowRun)
            .join(Workflow)
            .where(Workflow.repo_id == repository.id)
            .order_by(WorkflowRun.started_at.desc().nullslast())
        ).all()
    )


async def sync_jobs_for_run(db: Session, user: User, run: WorkflowRun, repository: Repository) -> list[Job]:
    token = decrypt_text(user.access_token)
    remote_jobs = await get_jobs(repository.owner, repository.repo_name, run.github_run_id, token)
    existing = {
        row.github_job_id: row
        for row in db.scalars(select(Job).where(Job.run_id == run.id)).all()
    }

    for remote in remote_jobs:
        job_id = str(remote["id"])
        if job_id in existing:
            job = existing[job_id]
            job.name = remote.get("name", job.name)
            job.status = remote.get("status")
            job.conclusion = remote.get("conclusion")
            job.started_at = parse_github_datetime(remote.get("started_at"))
            job.completed_at = parse_github_datetime(remote.get("completed_at"))
        else:
            db.add(
                Job(
                    run_id=run.id,
                    github_job_id=job_id,
                    name=remote.get("name", "job"),
                    status=remote.get("status"),
                    conclusion=remote.get("conclusion"),
                    started_at=parse_github_datetime(remote.get("started_at")),
                    completed_at=parse_github_datetime(remote.get("completed_at")),
                )
            )

    db.commit()
    return list(db.scalars(select(Job).where(Job.run_id == run.id).order_by(Job.started_at.asc().nullslast())).all())


async def trigger_workflow_for_user(db: Session, user: User, workflow_id: str, branch: str) -> None:
    workflow = db.scalar(select(Workflow).where(Workflow.id == workflow_id))
    if workflow is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workflow not found")

    repo = db.scalar(select(Repository).where(Repository.id == workflow.repo_id))
    if repo is None or repo.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Repository not found")

    await trigger_workflow(
        owner=repo.owner,
        repo=repo.repo_name,
        workflow_id=workflow.github_workflow_id,
        branch=branch,
        access_token=decrypt_text(user.access_token),
    )
