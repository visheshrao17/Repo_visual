import type { Request, Response } from "express";
import { workflowService } from "./workflow.service";

export const workflowController = {
  listByRepo: async (req: Request, res: Response) => {
    const data = await workflowService.listByRepo(String(req.params.repoId), req.query);
    return res.status(200).json(data);
  },

  trigger: async (req: Request, res: Response) => {
    const data = await workflowService.trigger(String(req.params.workflowId), String(req.body.branch));
    return res.status(200).json(data);
  }
};
