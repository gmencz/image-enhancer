/*
  Warnings:

  - Added the required column `originalImageName` to the `image_enhancements` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "image_enhancements" ADD COLUMN     "originalImageName" TEXT NOT NULL;
