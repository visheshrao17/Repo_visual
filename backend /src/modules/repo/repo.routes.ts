import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { repoController } from "./repo.controller";

export const repoRouter = Router();

repoRouter.get("/repos", authMiddleware, asyncHandler(repoController.list));
repoRouter.post("/repos/sync", authMiddleware, asyncHandler(repoController.sync));
