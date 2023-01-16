/*
  Warnings:

  - You are about to drop the column `createdAt` on the `image_enhancements` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "image_enhancements" DROP COLUMN "createdAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "time_metric" DOUBLE PRECISION;
