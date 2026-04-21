import type {
  CreateTodoListInput,
  UpdateTodoListInput,
} from "@todolist/shared/schemas/todolist.schema";
import { NotFoundError } from "../../shared/errors.js";
import { TodoList } from "./todolist.model.js";

export const getTodoLists = async (
  userId: string,
  cursor?: string,
  limit?: number,
) => {
  return TodoList.findAll(userId, cursor, limit);
};

export const getTodoList = async (id: string, userId: string) => {
  await TodoList.checkOwnership(id, userId);
  const list = await TodoList.findById(id);
  if (!list) throw new NotFoundError("TodoList not found");
  return list.getDetailDTO();
};

export const createTodoList = async (
  input: CreateTodoListInput,
  ownerId: string,
) => {
  const list = await TodoList.create(input, ownerId);
  return list.getDetailDTO();
};

export const updateTodoList = async (
  id: string,
  input: UpdateTodoListInput,
  userId: string,
) => {
  await TodoList.checkOwnership(id, userId);
  const list = await TodoList.findById(id);
  if (!list) throw new NotFoundError("TodoList not found");
  await list.update(input);
  return list.getDetailDTO();
};

export const deleteTodoList = async (id: string, userId: string) => {
  await TodoList.checkOwnership(id, userId);
  const list = await TodoList.findById(id);
  if (!list) throw new NotFoundError("TodoList not found");
  await list.delete();
};
