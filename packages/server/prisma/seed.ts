import { prisma } from "../src/infra/db.js";

async function main() {
  // Create users
  const alice = await prisma.user.create({
    data: {
      email: "alice@example.com",
      name: "Alice",
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: "bob@example.com",
      name: "Bob",
    },
  });

  // Alice's public list with a category
  const aliceWorkList = await prisma.todoList.create({
    data: {
      title: "Work",
      isPublic: true,
      ownerId: alice.id,
      categories: {
        create: [{ name: "Design" }],
      },
    },
    include: { categories: true },
  });

  const designCategory = aliceWorkList.categories[0];

  await prisma.todo.createMany({
    data: [
      {
        title: "Write project brief",
        listId: aliceWorkList.id,
        categoryId: designCategory.id,
        assignedToId: alice.id,
      },
      {
        title: "Review mockups",
        listId: aliceWorkList.id,
        categoryId: designCategory.id,
      },
      { title: "Send status update", listId: aliceWorkList.id },
    ],
  });

  // Alice's private list
  const alicePersonalList = await prisma.todoList.create({
    data: {
      title: "Personal",
      isPublic: false,
      ownerId: alice.id,
    },
  });

  await prisma.todo.createMany({
    data: [
      { title: "Buy groceries", listId: alicePersonalList.id },
      { title: "Call dentist", listId: alicePersonalList.id },
      { title: "Read a book", listId: alicePersonalList.id },
    ],
  });

  // Bob's public list
  const bobOssList = await prisma.todoList.create({
    data: {
      title: "OSS Contributions",
      isPublic: true,
      ownerId: bob.id,
    },
  });

  await prisma.todo.createMany({
    data: [
      { title: "Fix issue #42", listId: bobOssList.id },
      { title: "Write tests for PR", listId: bobOssList.id },
      { title: "Review open issues", listId: bobOssList.id },
    ],
  });

  // Bob's private list
  const bobPrivateList = await prisma.todoList.create({
    data: {
      title: "Learning",
      isPublic: false,
      ownerId: bob.id,
    },
  });

  await prisma.todo.createMany({
    data: [
      { title: "Finish Prisma module", listId: bobPrivateList.id },
      { title: "Read system design book", listId: bobPrivateList.id },
      { title: "Build side project", listId: bobPrivateList.id },
    ],
  });

  // Alice follows Bob
  await prisma.follow.create({
    data: {
      followerId: alice.id,
      followingId: bob.id,
    },
  });

  console.log("Seeded: 2 users, 4 lists, 12 todos, 1 category, 1 follow");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
