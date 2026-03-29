import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { HttpError } from "../utils/httpError";

export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return next(new HttpError(401, "Missing or invalid authorization header"));
  }

  const token = authorization.replace("Bearer ", "").trim();

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);

    if (typeof payload !== "object" || !payload.userId || !payload.githubId) {
      return next(new HttpError(401, "Invalid token payload"));
    }

    req.user = payload as Request["user"];
    return next();
  } catch (_error) {
    return next(new HttpError(401, "Invalid or expired token"));
  }
};
