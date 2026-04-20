import cookie from "@fastify/cookie";
import Fastify from "fastify";
import { requireAuth } from "./modules/auth/auth.hooks.js";
import authPlugin from "./modules/auth/auth.plugin.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { healthRoutes } from "./modules/health/health.routes.js";
import { todoRoutes } from "./modules/todo/todo.routes.js";
import { todoListRoutes } from "./modules/todolist/todolist.routes.js";
import { userRoutes } from "./modules/user/user.routes.js";
import { errorHandler } from "./shared/errorHandler.js";

export function buildApp({ logger = false }: { logger?: boolean } = {}) {
  const app = Fastify({ logger });

  app.setErrorHandler(errorHandler);
  app.register(cookie);
  app.register(authPlugin);

  // public routes
  app.register(healthRoutes);
  app.register(authRoutes, { prefix: "/api/v1" });

  // protected routes
  app.register(async (protectedApp) => {
    protectedApp.addHook("preHandler", requireAuth);

    protectedApp.register(userRoutes, { prefix: "/api/v1" });
    protectedApp.register(todoListRoutes, { prefix: "/api/v1" });
    protectedApp.register(todoRoutes, { prefix: "/api/v1" });
  });

  return app;
}
