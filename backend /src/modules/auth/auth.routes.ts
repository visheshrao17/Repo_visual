import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { authController } from "./auth.controller";

export const authRouter = Router();

authRouter.get("/github/login", authController.githubLogin);
authRouter.get("/github/callback", asyncHandler(authController.githubCallback));
