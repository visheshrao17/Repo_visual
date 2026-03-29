import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { asyncHandler } from "../../utils/asyncHandler";
import { runController } from "./run.controller";

const listRunsSchema = z.object({
  params: z.object({
    repoId: z.string().uuid()
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    pageSize: z.coerce.number().int().min(1).max(100).optional()
  }),
  body: z.object({}).optional()
});

export const runRouter = Router();

runRouter.get(
  "/repos/:repoId/runs",
  authMiddleware,
  validate(listRunsSchema),
  asyncHandler(runController.listByRepo)
);
