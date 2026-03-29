import { prisma } from "../../config/db";
import { githubService } from "../../integrations/github";
import { HttpError } from "../../utils/httpError";
import { parsePagination } from "../../utils/pagination";

export const workflowService = {
  listByRepo: async (repoId: string, query: unknown) => {
    const repo = await prisma.repository.findUnique({
      where: { id: repoId },
      include: { user: true }
    });

    if (!repo) {
      throw new HttpError(404, "Repository not found");
    }

    const { page, pageSize } = parsePagination(query);
    const workflowsResponse = await githubService.getWorkflows(
      repo.owner,
      repo.repoName,
      repo.user.accessToken,
      page,
      pageSize
    );

    const workflows = workflowsResponse.workflows ?? [];

    await Promise.all(
      workflows.map((workflow: Record<string, unknown>) =>
        prisma.workflow.upsert({
          where: {
            repoId_githubWorkflowId: {
              repoId: repo.id,
              githubWorkflowId: String(workflow.id)
            }
          },
          update: {
            name: String(workflow.name),
            state: String(workflow.state)
          },
          create: {
            repoId: repo.id,
            githubWorkflowId: String(workflow.id),
            name: String(workflow.name),
            state: String(workflow.state)
          }
        })
      )
    );

    const items = await prisma.workflow.findMany({
      where: { repoId: repo.id },
      orderBy: { createdAt: "desc" }
    });

    return {
      page,
      pageSize,
      total: workflowsResponse.total_count ?? items.length,
      items
    };
  },

  trigger: async (workflowId: string, branch: string) => {
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: {
        repository: {
          include: {
            user: true
          }
        }
      }
    });

    if (!workflow) {
      throw new HttpError(404, "Workflow not found");
    }

    await githubService.triggerWorkflow(
      workflow.repository.owner,
      workflow.repository.repoName,
      workflow.githubWorkflowId,
      branch,
      workflow.repository.user.accessToken
    );

    return {
      workflowId,
      branch,
      status: "triggered"
    };
  }
};
