import type { NextFunction, Request, Response } from "express";

export const asyncHandler =
  <TReq extends Request = Request, TRes extends Response = Response>(
    handler: (req: TReq, res: TRes, next: NextFunction) => Promise<unknown>
  ) =>
  (req: TReq, res: TRes, next: NextFunction) => {
    handler(req, res, next).catch(next);
  };
