import cors from "cors";
import express from "express";
import { authRouter } from "./modules/auth/auth.routes";
import { userRouter } from "./modules/user/user.routes";
import { repoRouter } from "./modules/repo/repo.routes";
import { workflowRouter } from "./modules/workflow/workflow.routes";
import { runRouter } from "./modules/run/run.routes";
import { jobRouter } from "./modules/job/job.routes";
import { logsRouter } from "./modules/logs/logs.routes";
import { loggerMiddleware } from "./middleware/logger";
import { notFoundHandler } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";

export const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(loggerMiddleware);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use(userRouter);
app.use(repoRouter);
app.use(workflowRouter);
app.use(runRouter);
app.use(jobRouter);
app.use(logsRouter);

app.use(notFoundHandler);
app.use(errorHandler);
