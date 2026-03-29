import jwt from "jsonwebtoken";
import { prisma } from "../../config/db";
import { env } from "../../config/env";
import { githubService } from "../../integrations/github";

export const authService = {
  getGithubLoginUrl: () => {
    const params = new URLSearchParams({
      client_id: env.GITHUB_CLIENT_ID,
      redirect_uri: env.GITHUB_REDIRECT_URI,
      scope: "repo read:user user:email workflow"
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  },

  handleGithubCallback: async (code: string) => {
    const accessToken = await githubService.exchangeCodeForToken(code);
    const githubUser = await githubService.getUser(accessToken);

    const user = await prisma.user.upsert({
      where: { githubId: String(githubUser.id) },
      update: {
        username: githubUser.login,
        email: githubUser.email ?? `${githubUser.login}@users.noreply.github.com`,
        avatarUrl: githubUser.avatar_url,
        accessToken
      },
      create: {
        githubId: String(githubUser.id),
        username: githubUser.login,
        email: githubUser.email ?? `${githubUser.login}@users.noreply.github.com`,
        avatarUrl: githubUser.avatar_url,
        accessToken
      }
    });

    const token = jwt.sign(
      {
        userId: user.id,
        githubId: user.githubId,
        username: user.username
      },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl
      }
    };
  }
};
