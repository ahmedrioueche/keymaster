-- AlterTable
ALTER TABLE "User" ADD COLUMN     "skillLevel" TEXT NOT NULL DEFAULT 'noob',
ADD COLUMN     "stars" INTEGER NOT NULL DEFAULT 0;
