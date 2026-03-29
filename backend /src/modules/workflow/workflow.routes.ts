import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { asyncHandler } from "../../utils/asyncHandler";
import { workflowController } from "./workflow.controller";

const listWorkflowsSchema = z.object({
  params: z.object({
    repoId: z.string().uuid()
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    pageSize: z.coerce.number().int().min(1).max(100).optional()
  }),
  body: z.object({}).optional()
});

const triggerWorkflowSchema = z.object({
  params: z.object({
    workflowId: z.string().uuid()
  }),
  query: z.object({}).optional(),
  body: z.object({
    branch: z.string().min(1)
  })
});

export const workflowRouter = Router();

workflowRouter.get(
  "/repos/:repoId/workflows",
  authMiddleware,
  validate(listWorkflowsSchema),
  asyncHandler(workflowController.listByRepo)
);

workflowRouter.post(
  "/workflows/:workflowId/trigger",
  authMiddleware,
  validate(triggerWorkflowSchema),
  asyncHandler(workflowController.trigger)
);
