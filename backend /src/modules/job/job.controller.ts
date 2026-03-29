import type { Request, Response } from "express";
import { jobService } from "./job.service";

export const jobController = {
  listByRun: async (req: Request, res: Response) => {
    const data = await jobService.listByRun(String(req.params.runId));
    return res.status(200).json(data);
  }
};
