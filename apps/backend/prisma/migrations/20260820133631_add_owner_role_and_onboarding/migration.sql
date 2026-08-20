-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'OWNER';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_onboarded" BOOLEAN NOT NULL DEFAULT false;
