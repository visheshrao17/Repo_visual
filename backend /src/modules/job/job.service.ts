import { prisma } from "../../config/db";
import { githubService } from "../../integrations/github";
import { HttpError } from "../../utils/httpError";
import { toJobGraph } from "../../utils/jobGraph";

export const jobService = {
  listByRun: async (runId: string) => {
    const run = await prisma.workflowRun.findUnique({
      where: { id: runId },
      include: {
        workflow: {
          include: {
            repository: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });

    if (!run) {
      throw new HttpError(404, "Workflow run not found");
    }

    const jobsResponse = await githubService.getJobs(
      run.workflow.repository.owner,
      run.workflow.repository.repoName,
      run.githubRunId,
      run.workflow.repository.user.accessToken
    );

    const jobs = jobsResponse.jobs ?? [];

    await Promise.all(
      jobs.map((job: Record<string, unknown>) =>
        prisma.job.upsert({
          where: {
            runId_githubJobId: {
              runId,
              githubJobId: String(job.id)
            }
          },
          update: {
            name: String(job.name),
            status: String(job.status ?? "unknown"),
            conclusion: job.conclusion ? String(job.conclusion) : null,
            startedAt: new Date(String(job.started_at ?? new Date().toISOString())),
            completedAt: job.completed_at ? new Date(String(job.completed_at)) : null
          },
          create: {
            runId,
            githubJobId: String(job.id),
            name: String(job.name),
            status: String(job.status ?? "unknown"),
            conclusion: job.conclusion ? String(job.conclusion) : null,
            startedAt: new Date(String(job.started_at ?? new Date().toISOString())),
            completedAt: job.completed_at ? new Date(String(job.completed_at)) : null
          }
        })
      )
    );

    const graph = toJobGraph(jobs);

    return {
      jobs,
      graph
    };
  }
};
