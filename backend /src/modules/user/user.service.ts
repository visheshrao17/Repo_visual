import { prisma } from "../../config/db";
import { HttpError } from "../../utils/httpError";

export const userService = {
  getMe: async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        githubId: true,
        username: true,
        email: true,
        avatarUrl: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new HttpError(404, "User not found");
    }

    return user;
  }
};
