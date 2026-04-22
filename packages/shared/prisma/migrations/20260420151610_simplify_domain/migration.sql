/*
  Warnings:

  - You are about to drop the column `is_public` on the `todo_lists` table. All the data in the column will be lost.
  - You are about to drop the column `assigned_to_id` on the `todos` table. All the data in the column will be lost.
  - You are about to drop the column `category_id` on the `todos` table. All the data in the column will be lost.
  - You are about to drop the `categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `follows` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `todo_list_members` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_list_id_fkey";

-- DropForeignKey
ALTER TABLE "follows" DROP CONSTRAINT "follows_follower_id_fkey";

-- DropForeignKey
ALTER TABLE "follows" DROP CONSTRAINT "follows_following_id_fkey";

-- DropForeignKey
ALTER TABLE "todo_list_members" DROP CONSTRAINT "todo_list_members_list_id_fkey";

-- DropForeignKey
ALTER TABLE "todo_list_members" DROP CONSTRAINT "todo_list_members_user_id_fkey";

-- DropForeignKey
ALTER TABLE "todos" DROP CONSTRAINT "todos_assigned_to_id_fkey";

-- DropForeignKey
ALTER TABLE "todos" DROP CONSTRAINT "todos_category_id_fkey";

-- AlterTable
ALTER TABLE "todo_lists" DROP COLUMN "is_public";

-- AlterTable
ALTER TABLE "todos" DROP COLUMN "assigned_to_id",
DROP COLUMN "category_id",
ADD COLUMN     "due_date" TIMESTAMP(3);

-- DropTable
DROP TABLE "categories";

-- DropTable
DROP TABLE "follows";

-- DropTable
DROP TABLE "todo_list_members";

-- CreateIndex
CREATE INDEX "todo_lists_owner_id_idx" ON "todo_lists"("owner_id");

-- CreateIndex
CREATE INDEX "todos_list_id_idx" ON "todos"("list_id");

-- CreateIndex
CREATE INDEX "todos_list_id_is_completed_idx" ON "todos"("list_id", "is_completed");
