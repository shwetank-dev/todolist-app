import type {
  CreateTodoInput,
  TodoDTO,
  UpdateTodoInput,
} from "@todolist/shared/schemas/todo.schema";
import type { Todo as PrismaTodo } from "../../generated/prisma/client.js";
import { prisma } from "../../infra/db.js";
import { ForbiddenError } from "../../shared/errors.js";

type FullTodo = PrismaTodo & {
  list: { ownerId: string };
};

const fullInclude = {
  list: { select: { ownerId: true } },
} as const;

export class Todo {
  constructor(private readonly _data: FullTodo) {}

  assertCanModify(userId: string): void {
    if (this._data.list.ownerId !== userId) {
      throw new ForbiddenError("You do not own this todo");
    }
  }

  static async findById(id: string): Promise<Todo | null> {
    const row = await prisma.todo.findUnique({
      where: { id },
      include: fullInclude,
    });
    if (!row) return null;
    return new Todo(row);
  }

  static async findAllByListId(listId: string): Promise<Todo[]> {
    const rows = await prisma.todo.findMany({
      where: { listId },
      include: fullInclude,
      orderBy: { createdAt: "asc" },
    });
    return rows.map((row) => new Todo(row));
  }

  static async create(input: CreateTodoInput, listId: string): Promise<Todo> {
    const row = await prisma.todo.create({
      data: {
        title: input.title,
        listId,
        ...(input.dueDate && { dueDate: new Date(input.dueDate) }),
      },
      include: fullInclude,
    });
    return new Todo(row);
  }

  async update(input: UpdateTodoInput): Promise<void> {
    const updated = await prisma.todo.update({
      where: { id: this._data.id },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.completed !== undefined && { isCompleted: input.completed }),
        ...(input.dueDate !== undefined && {
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
        }),
      },
      include: fullInclude,
    });
    Object.assign(this._data, updated);
  }

  async delete(): Promise<void> {
    await prisma.todo.delete({ where: { id: this._data.id } });
  }

  toDTO(): TodoDTO {
    return {
      id: this._data.id,
      title: this._data.title,
      completed: this._data.isCompleted,
      dueDate: this._data.dueDate ? this._data.dueDate.toISOString() : null,
      createdAt: this._data.createdAt.toISOString(),
    };
  }
}
