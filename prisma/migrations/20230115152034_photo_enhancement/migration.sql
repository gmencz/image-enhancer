/*
  Warnings:

  - Added the required column `effect` to the `photo_enhancements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalPhotoUrl` to the `photo_enhancements` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "photo_enhancements" ADD COLUMN     "effect" TEXT NOT NULL,
ADD COLUMN     "originalPhotoUrl" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "photo_enhancement_results" (
    "id" SERIAL NOT NULL,
    "model" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "photo_enhancement_id" INTEGER,

    CONSTRAINT "photo_enhancement_results_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "photo_enhancement_results" ADD CONSTRAINT "photo_enhancement_results_photo_enhancement_id_fkey" FOREIGN KEY ("photo_enhancement_id") REFERENCES "photo_enhancements"("id") ON DELETE SET NULL ON UPDATE CASCADE;
