import type { Request, Response } from "express";
import { runService } from "./run.service";

export const runController = {
  listByRepo: async (req: Request, res: Response) => {
    const data = await runService.listByRepo(String(req.params.repoId), req.query);
    return res.status(200).json(data);
  }
};
