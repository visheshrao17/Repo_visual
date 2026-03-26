from app.db.models.job import Job
from app.db.schemas.job import JobGraphEdge, JobGraphNode, JobGraphResponse


def jobs_to_graph(jobs: list[Job]) -> JobGraphResponse:
    ordered_jobs = sorted(jobs, key=lambda x: (x.started_at is None, x.started_at))

    nodes = [JobGraphNode(id=job.name, status=job.conclusion or job.status) for job in ordered_jobs]
    edges: list[JobGraphEdge] = []

    # GitHub jobs API does not always provide explicit DAG dependencies.
    # Build a sequential fallback graph for timeline visualization.
    for idx in range(len(ordered_jobs) - 1):
        edges.append(JobGraphEdge(source=ordered_jobs[idx].name, target=ordered_jobs[idx + 1].name))

    return JobGraphResponse(nodes=nodes, edges=edges)
