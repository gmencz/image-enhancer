/*
  Warnings:

  - You are about to drop the column `user_plan_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `UserPlan` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `plan_id` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_user_plan_id_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "user_plan_id",
ADD COLUMN     "plan_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "UserPlan";

-- CreateTable
CREATE TABLE "plans" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "enhancements_limit" INTEGER,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "plans_name_key" ON "plans"("name");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
