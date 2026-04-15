import Fastify from "fastify";
import { healthRoutes } from "./modules/health/health.routes.js";
import { todoRoutes } from "./modules/todo/todo.routes.js";
const app = Fastify({ logger: true });
app.register(healthRoutes);
app.addHook("preHandler", async (request, _reply) => {
    console.log("preHandler", request);
});
app.register(todoRoutes);
export default app;
