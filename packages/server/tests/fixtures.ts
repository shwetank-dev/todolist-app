import bcrypt from "bcrypt";
import type { FastifyInstance } from "fastify";
import { prisma } from "../src/infra/db.js";

const TEST_PASSWORD = "password123";

export function generateTestEmail() {
  return `test-${Math.floor(Math.random() * 1000000)}@example.com`;
}

export async function createTestUser(email = generateTestEmail()) {
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);
  return prisma.user.create({
    data: { email, name: "Test User", passwordHash },
  });
}

export async function createTestTodoList(ownerId: string, title = "Test List") {
  return prisma.todoList.create({
    data: { title, ownerId },
  });
}

export async function loginTestUser(app: FastifyInstance, email: string) {
  const response = await app.inject({
    method: "POST",
    url: "/api/v1/auth/login",
    headers: {
      authorization: `Basic ${Buffer.from(`${email}:${TEST_PASSWORD}`).toString("base64")}`,
    },
  });
  return response.json().accessToken as string;
}

export async function cleanupUser(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return;
  await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
  await prisma.todoList.deleteMany({ where: { ownerId: user.id } });
  await prisma.user.delete({ where: { id: user.id } });
}
