import Fastify from "fastify";
import { healthRoutes } from "./modules/health/health.routes.js";
import { todoRoutes } from "./modules/todo/todo.routes.js";

const app = Fastify({ logger: true });
app.register(healthRoutes);

app.register(todoRoutes);

export default app;
