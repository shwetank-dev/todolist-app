import Fastify from "fastify";
import { todoRoutes } from "./modules/todo/todo.routes.js";

const app = Fastify({ logger: true });

app.addHook("preHandler", async (request, _reply) => {
  console.log("preHandler", request);
});

app.register(todoRoutes);

export default app;
