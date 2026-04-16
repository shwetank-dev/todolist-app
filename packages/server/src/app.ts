import Fastify from "fastify";
import { categoryRoutes } from "./modules/category/category.routes.js";
import { feedRoutes } from "./modules/feed/feed.routes.js";
import { followRoutes } from "./modules/follow/follow.routes.js";
import { healthRoutes } from "./modules/health/health.routes.js";
import { todoRoutes } from "./modules/todo/todo.routes.js";
import { todoListRoutes } from "./modules/todolist/todolist.routes.js";
import { userRoutes } from "./modules/user/user.routes.js";
import { errorHandler } from "./shared/errorHandler.js";

const app = Fastify({ logger: true });

app.setErrorHandler(errorHandler);
app.register(healthRoutes);
app.register(userRoutes, { prefix: "/api/v1" });
app.register(todoListRoutes, { prefix: "/api/v1" });
app.register(todoRoutes, { prefix: "/api/v1" });
app.register(categoryRoutes, { prefix: "/api/v1" });
app.register(followRoutes, { prefix: "/api/v1" });
app.register(feedRoutes, { prefix: "/api/v1" });

export default app;
