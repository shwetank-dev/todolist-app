import bcrypt from "bcrypt";
import { prisma } from "../src/infra/db.js";

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);

  const alice = await prisma.user.create({
    data: { email: "alice@example.com", name: "Alice", passwordHash },
  });

  const bob = await prisma.user.create({
    data: { email: "bob@example.com", name: "Bob", passwordHash },
  });

  const aliceWorkList = await prisma.todoList.create({
    data: { title: "Work", ownerId: alice.id },
  });

  await prisma.todo.createMany({
    data: [
      { title: "Write project brief", listId: aliceWorkList.id },
      { title: "Review mockups", listId: aliceWorkList.id },
      { title: "Send status update", listId: aliceWorkList.id },
    ],
  });

  const alicePersonalList = await prisma.todoList.create({
    data: { title: "Personal", ownerId: alice.id },
  });

  await prisma.todo.createMany({
    data: [
      { title: "Buy groceries", listId: alicePersonalList.id },
      { title: "Call dentist", listId: alicePersonalList.id },
      { title: "Read a book", listId: alicePersonalList.id },
    ],
  });

  const bobOssList = await prisma.todoList.create({
    data: { title: "OSS Contributions", ownerId: bob.id },
  });

  await prisma.todo.createMany({
    data: [
      { title: "Fix issue #42", listId: bobOssList.id },
      { title: "Write tests for PR", listId: bobOssList.id },
      { title: "Review open issues", listId: bobOssList.id },
    ],
  });

  const bobPrivateList = await prisma.todoList.create({
    data: { title: "Learning", ownerId: bob.id },
  });

  await prisma.todo.createMany({
    data: [
      { title: "Finish Prisma module", listId: bobPrivateList.id },
      { title: "Read system design book", listId: bobPrivateList.id },
      { title: "Build side project", listId: bobPrivateList.id },
    ],
  });

  console.log("Seeded: 2 users, 4 lists, 12 todos");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
