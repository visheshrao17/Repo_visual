import { prisma } from "../../config/db";
import { githubService } from "../../integrations/github";
import { HttpError } from "../../utils/httpError";
import { parsePagination } from "../../utils/pagination";

export const runService = {
  listByRepo: async (repoId: string, query: unknown) => {
    const repo = await prisma.repository.findUnique({
      where: { id: repoId },
      include: {
        user: true,
        workflows: true
      }
    });

    if (!repo) {
      throw new HttpError(404, "Repository not found");
    }

    const { page, pageSize } = parsePagination(query);
    const runsResponse = await githubService.getWorkflowRuns(
      repo.owner,
      repo.repoName,
      repo.user.accessToken,
      page,
      pageSize
    );

    const runs = runsResponse.workflow_runs ?? [];

    await Promise.all(
      runs.map(async (run: Record<string, unknown>) => {
        const githubWorkflowId = String(run.workflow_id);

        const workflow = await prisma.workflow.upsert({
          where: {
            repoId_githubWorkflowId: {
              repoId,
              githubWorkflowId
            }
          },
          update: {
            name: String(run.name ?? run.display_title ?? "Unnamed workflow"),
            state: String(run.status ?? "unknown")
          },
          create: {
            repoId,
            githubWorkflowId,
            name: String(run.name ?? run.display_title ?? "Unnamed workflow"),
            state: String(run.status ?? "unknown")
          }
        });

        await prisma.workflowRun.upsert({
          where: {
            workflowId_githubRunId: {
              workflowId: workflow.id,
              githubRunId: String(run.id)
            }
          },
          update: {
            status: String(run.status ?? "unknown"),
            conclusion: run.conclusion ? String(run.conclusion) : null,
            branch: String(run.head_branch ?? "unknown"),
            commitSha: String(run.head_sha ?? "unknown"),
            startedAt: new Date(String(run.run_started_at ?? run.created_at ?? new Date().toISOString())),
            completedAt: run.updated_at ? new Date(String(run.updated_at)) : null
          },
          create: {
            workflowId: workflow.id,
            githubRunId: String(run.id),
            status: String(run.status ?? "unknown"),
            conclusion: run.conclusion ? String(run.conclusion) : null,
            branch: String(run.head_branch ?? "unknown"),
            commitSha: String(run.head_sha ?? "unknown"),
            startedAt: new Date(String(run.run_started_at ?? run.created_at ?? new Date().toISOString())),
            completedAt: run.updated_at ? new Date(String(run.updated_at)) : null
          }
        });
      })
    );

    const items = await prisma.workflowRun.findMany({
      where: { workflow: { repoId } },
      include: { workflow: true },
      orderBy: { startedAt: "desc" },
      take: pageSize,
      skip: (page - 1) * pageSize
    });

    return {
      page,
      pageSize,
      total: runsResponse.total_count ?? items.length,
      items
    };
  }
};
