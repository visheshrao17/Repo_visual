import { prisma } from "../../config/db";
import { githubService } from "../../integrations/github";
import { parsePagination } from "../../utils/pagination";

export const repoService = {
  list: async (userId: string, query: unknown) => {
    const { page, pageSize, skip, take } = parsePagination(query);

    const [items, total] = await Promise.all([
      prisma.repository.findMany({
        where: { userId },
        skip,
        take,
        orderBy: { createdAt: "desc" }
      }),
      prisma.repository.count({ where: { userId } })
    ]);

    return {
      page,
      pageSize,
      total,
      items
    };
  },

  sync: async (userId: string) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new Error("User not found");
    }

    const repos = await githubService.getRepos(user.accessToken, 1, 100);

    await Promise.all(
      repos.map((repo: Record<string, unknown>) =>
        prisma.repository.upsert({
          where: {
            userId_owner_repoName: {
              userId,
              owner: String((repo.owner as { login: string }).login),
              repoName: String(repo.name)
            }
          },
          update: {
            repoUrl: String(repo.html_url),
            isPrivate: Boolean(repo.private)
          },
          create: {
            userId,
            repoName: String(repo.name),
            owner: String((repo.owner as { login: string }).login),
            repoUrl: String(repo.html_url),
            isPrivate: Boolean(repo.private)
          }
        })
      )
    );

    return { syncedCount: repos.length };
  }
};
