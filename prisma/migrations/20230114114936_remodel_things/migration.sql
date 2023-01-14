/*
  Warnings:

  - You are about to drop the `image_enhancements` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `user_plan_id` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "image_enhancements" DROP CONSTRAINT "image_enhancements_userId_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "user_plan_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "image_enhancements";

-- CreateTable
CREATE TABLE "UserPlan" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "enhancements_limit" INTEGER,

    CONSTRAINT "UserPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photo_enhancements" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "photo_enhancements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPlan_name_key" ON "UserPlan"("name");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_user_plan_id_fkey" FOREIGN KEY ("user_plan_id") REFERENCES "UserPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo_enhancements" ADD CONSTRAINT "photo_enhancements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
