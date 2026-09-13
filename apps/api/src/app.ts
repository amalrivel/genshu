import express, { type Express } from "express";
import cors from "cors";
import { authRoutes } from "./modules/auth/auth.routes.ts";
import { usersRoutes } from "./modules/users/users.routes.ts";
import { materialsRoutes } from "./modules/materials/materials.routes.ts";
import { questionsRoutes } from "./modules/questions/questions.routes.ts";
import { topicsRoutes } from "./modules/topics/topics.routes.ts";
import { practiceSetsRoutes } from "./modules/practice-sets/practice-sets.routes.ts";
import { practiceRoutes } from "./modules/practice/practice.routes.ts";
import { requireAdmin, requireAuth } from "./middleware/auth.middleware.ts";
import { errorHandler } from "./middleware/error.middleware.ts";

export function createApp(): Express {
  const app = express();
  const corsOptions = {
    origin: [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/],
    credentials: true,
    optionsSuccessStatus: 200,
  };

  app.use(cors(corsOptions));
  app.get("/", (_req, res) => res.send("Hello World!"));
  app.get("/health", (_req, res) => res.send("Hello World!"));
  app.use(express.json({ limit: "1mb" }));

  app.use(authRoutes);
  app.use(requireAuth, practiceRoutes);
  app.use(requireAuth, requireAdmin, topicsRoutes);
  app.use(requireAuth, requireAdmin, materialsRoutes);
  app.use(requireAuth, requireAdmin, questionsRoutes);
  app.use(requireAuth, requireAdmin, practiceSetsRoutes);
  app.use(usersRoutes);

  app.use((_req, res) => res.status(404).json({ error: "Route not found." }));
  app.use(errorHandler);
  return app;
}
