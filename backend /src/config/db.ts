import { PrismaClient } from "@prisma/client";
import { env } from "./env";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () =>
  new PrismaClient({
    datasources: {
      db: { url: env.DATABASE_URL }
    },
    log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
  });

export const prisma = global.__prisma ?? prismaClientSingleton();

if (env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}
