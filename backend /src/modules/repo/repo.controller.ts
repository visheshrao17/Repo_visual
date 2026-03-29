import type { Request, Response } from "express";
import { HttpError } from "../../utils/httpError";
import { repoService } from "./repo.service";

export const repoController = {
  list: async (req: Request, res: Response) => {
    if (!req.user?.userId) {
      throw new HttpError(401, "Unauthorized");
    }

    const data = await repoService.list(req.user.userId, req.query);
    return res.status(200).json(data);
  },

  sync: async (req: Request, res: Response) => {
    if (!req.user?.userId) {
      throw new HttpError(401, "Unauthorized");
    }

    const data = await repoService.sync(req.user.userId);
    return res.status(200).json(data);
  }
};
