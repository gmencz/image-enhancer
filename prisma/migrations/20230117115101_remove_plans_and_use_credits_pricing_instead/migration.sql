/*
  Warnings:

  - You are about to drop the column `plan_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `plans` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_plan_id_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "plan_id",
ADD COLUMN     "credits" INTEGER NOT NULL DEFAULT 15;

-- DropTable
DROP TABLE "plans";
