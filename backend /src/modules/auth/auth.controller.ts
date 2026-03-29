import type { Request, Response } from "express";
import { z } from "zod";
import { authService } from "./auth.service";
import { HttpError } from "../../utils/httpError";

const callbackQuerySchema = z.object({
  code: z.string().min(1)
});

export const authController = {
  githubLogin: (_req: Request, res: Response) => {
    const loginUrl = authService.getGithubLoginUrl();
    return res.redirect(loginUrl);
  },

  githubCallback: async (req: Request, res: Response) => {
    const parsed = callbackQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      throw new HttpError(400, "Missing OAuth code in callback query");
    }

    const payload = await authService.handleGithubCallback(parsed.data.code);
    return res.status(200).json(payload);
  }
};
