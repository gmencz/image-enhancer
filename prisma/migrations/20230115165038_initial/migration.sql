-- CreateTable
CREATE TABLE "plans" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "enhancements_limit" INTEGER,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "plan_id" INTEGER NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "image_enhancement_results" (
    "id" SERIAL NOT NULL,
    "model" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "image_enhancement_id" INTEGER,

    CONSTRAINT "image_enhancement_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "image_enhancements" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "effect" TEXT NOT NULL,
    "originalImageUrl" TEXT NOT NULL,

    CONSTRAINT "image_enhancements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "plans_name_key" ON "plans"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image_enhancement_results" ADD CONSTRAINT "image_enhancement_results_image_enhancement_id_fkey" FOREIGN KEY ("image_enhancement_id") REFERENCES "image_enhancements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image_enhancements" ADD CONSTRAINT "image_enhancements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
