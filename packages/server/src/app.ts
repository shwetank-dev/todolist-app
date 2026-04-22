import cookie from "@fastify/cookie";
import rateLimit from "@fastify/rate-limit";
import Fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { requireAuth } from "./modules/auth/auth.hooks.js";
import authPlugin from "./modules/auth/auth.plugin.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { healthRoutes } from "./modules/health/health.routes.js";
import { todoRoutes } from "./modules/todo/todo.routes.js";
import { todoListRoutes } from "./modules/todolist/todolist.routes.js";
import { userRoutes } from "./modules/user/user.routes.js";
import { webhookRoutes } from "./modules/webhooks/webhooks.routes.js";
import { errorHandler } from "./shared/errorHandler.js";

export function buildApp({ logger = false }: { logger?: boolean } = {}) {
  const app = Fastify({ logger });
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.setErrorHandler(errorHandler);

  app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
  });
  app.register(cookie);
  app.register(authPlugin);

  // public routes
  app.register(healthRoutes);
  app.register(authRoutes, { prefix: "/api/v1" });
  app.register(webhookRoutes, { prefix: "/wh" });

  // protected routes
  app.register(async (protectedApp) => {
    protectedApp.addHook("preHandler", requireAuth);

    protectedApp.register(userRoutes, { prefix: "/api/v1" });
    protectedApp.register(todoListRoutes, { prefix: "/api/v1" });
    protectedApp.register(todoRoutes, { prefix: "/api/v1" });
  });

  return app;
}
