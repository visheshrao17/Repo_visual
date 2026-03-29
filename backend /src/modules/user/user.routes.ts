import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { userController } from "./user.controller";

export const userRouter = Router();

userRouter.get("/me", authMiddleware, asyncHandler(userController.me));
