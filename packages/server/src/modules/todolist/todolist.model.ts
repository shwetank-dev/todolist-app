import { prisma } from "@todolist/shared/db";
import type {
  CreateTodoListInput,
  TodoListDetailDTO,
  TodoListSummaryDTO,
  UpdateTodoListInput,
} from "@todolist/shared/schemas/todolist.schema";
import type {
  Todo as PrismaTodo,
  TodoList as PrismaTodoList,
} from "../../generated/prisma/client.js";
import { cache } from "../../infra/cache.js";
import { ForbiddenError, NotFoundError } from "../../shared/errors.js";

type FullTodoList = PrismaTodoList & {
  todos: PrismaTodo[];
};

const fullInclude = {
  todos: true,
} as const;

export class TodoList {
  constructor(private readonly _data: FullTodoList) {}

  private static cacheKey(userId: string): string {
    return `todolist-app:todolists:${userId}`;
  }

  static async checkOwnership(id: string, userId: string): Promise<void> {
    const row = await prisma.todoList.findUnique({
      where: { id },
      select: { ownerId: true },
    });
    if (!row) throw new NotFoundError("TodoList not found");
    if (row.ownerId !== userId)
      throw new ForbiddenError("You do not own this list");
  }

  static async create(
    input: CreateTodoListInput,
    ownerId: string,
  ): Promise<TodoList> {
    const row = await prisma.todoList.create({
      data: {
        title: input.name,
        ownerId,
      },
      include: fullInclude,
    });
    await cache.del(TodoList.cacheKey(ownerId));
    return new TodoList(row);
  }

  static async findById(id: string): Promise<TodoList | null> {
    const row = await prisma.todoList.findUnique({
      where: { id },
      include: fullInclude,
    });
    if (!row) return null;
    return new TodoList(row);
  }

  static async findAll(
    userId: string,
    cursor?: string,
    limit = 20,
  ): Promise<{ data: TodoListSummaryDTO[]; nextCursor: string | null }> {
    const cacheKey = TodoList.cacheKey(userId);
    if (!cursor) {
      const cached = await cache.get<{
        data: TodoListSummaryDTO[];
        nextCursor: string | null;
      }>(cacheKey);
      if (cached) return cached;
    }

    const rows = await prisma.todoList.findMany({
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { createdAt: "desc" },
      where: { ownerId: userId },
      select: {
        id: true,
        title: true,
        createdAt: true,
        _count: { select: { todos: true } },
      },
    });

    const hasNext = rows.length > limit;
    const page = hasNext ? rows.slice(0, limit) : rows;

    const result = {
      data: page.map((r) => ({
        id: r.id,
        name: r.title,
        todoCount: r._count.todos,
        createdAt: r.createdAt.toISOString(),
      })),
      nextCursor: hasNext ? page[page.length - 1].id : null,
    };

    if (!cursor) {
      await cache.set(cacheKey, result, 60);
    }

    return result;
  }

  async update(input: UpdateTodoListInput): Promise<void> {
    const updated = await prisma.todoList.update({
      where: { id: this._data.id },
      data: {
        ...(input.name !== undefined && { title: input.name }),
      },
      include: fullInclude,
    });
    Object.assign(this._data, updated);
    await cache.del(TodoList.cacheKey(this._data.ownerId));
  }

  async delete(): Promise<void> {
    await prisma.todoList.delete({ where: { id: this._data.id } });
    await cache.del(TodoList.cacheKey(this._data.ownerId));
  }

  getDetailDTO(): TodoListDetailDTO {
    return {
      id: this._data.id,
      name: this._data.title,
      createdAt: this._data.createdAt.toISOString(),
      todos: this._data.todos.map((t) => ({
        id: t.id,
        title: t.title,
        completed: t.isCompleted,
        dueDate: t.dueDate ? t.dueDate.toISOString() : null,
        createdAt: t.createdAt.toISOString(),
      })),
    };
  }
}
