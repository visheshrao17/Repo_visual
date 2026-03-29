import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { asyncHandler } from "../../utils/asyncHandler";
import { jobController } from "./job.controller";

const listJobsSchema = z.object({
  params: z.object({
    runId: z.string().uuid()
  }),
  query: z.object({}).optional(),
  body: z.object({}).optional()
});

export const jobRouter = Router();

jobRouter.get(
  "/runs/:runId/jobs",
  authMiddleware,
  validate(listJobsSchema),
  asyncHandler(jobController.listByRun)
);
