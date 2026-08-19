-- CreateEnum
CREATE TYPE "SetValidationStatus" AS ENUM ('APPROVED', 'REQUIRES_VIDEO', 'REJECTED');

-- AlterTable
ALTER TABLE "sets" ADD COLUMN     "validation_status" "SetValidationStatus" NOT NULL DEFAULT 'APPROVED';
