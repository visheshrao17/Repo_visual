import type { Request, Response } from "express";
import { HttpError } from "../../utils/httpError";
import { userService } from "./user.service";

export const userController = {
  me: async (req: Request, res: Response) => {
    if (!req.user?.userId) {
      throw new HttpError(401, "Unauthorized");
    }

    const user = await userService.getMe(req.user.userId);
    return res.status(200).json(user);
  }
};
