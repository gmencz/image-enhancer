-- CreateTable
CREATE TABLE "image_enhancements" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "image_enhancements_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "image_enhancements" ADD CONSTRAINT "image_enhancements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
