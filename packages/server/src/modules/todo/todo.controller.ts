import type {
  CreateTodoInput,
  UpdateTodoInput,
} from "@todolist/shared/schemas/todo.schema";
import { NotFoundError } from "../../shared/errors.js";
import { TodoList } from "../todolist/todolist.model.js";
import { Todo } from "./todo.model.js";

export const getTodosForList = async (
  listId: string,
  userId: string,
  cursor?: string,
  limit?: number,
) => {
  await TodoList.checkOwnership(listId, userId);
  const { todos, nextCursor } = await Todo.findManyByListId(
    listId,
    cursor,
    limit,
  );
  return { data: todos.map((t) => t.toDTO()), nextCursor };
};

export const getTodo = async (id: string, userId: string) => {
  const todo = await Todo.findById(id);
  if (!todo) throw new NotFoundError("Todo not found");
  todo.assertCanModify(userId);
  return todo.toDTO();
};

export const createTodo = async (
  listId: string,
  input: CreateTodoInput,
  userId: string,
) => {
  await TodoList.checkOwnership(listId, userId);
  const todo = await Todo.create(input, listId);
  return todo.toDTO();
};

export const updateTodo = async (
  id: string,
  input: UpdateTodoInput,
  userId: string,
) => {
  const todo = await Todo.findById(id);
  if (!todo) throw new NotFoundError("Todo not found");
  todo.assertCanModify(userId);
  await todo.update(input);
  return todo.toDTO();
};

export const deleteTodo = async (id: string, userId: string) => {
  const todo = await Todo.findById(id);
  if (!todo) throw new NotFoundError("Todo not found");
  todo.assertCanModify(userId);
  await todo.delete();
};
