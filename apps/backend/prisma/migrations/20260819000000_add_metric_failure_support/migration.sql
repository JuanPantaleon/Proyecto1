-- CreateEnum
CREATE TYPE "MetricType" AS ENUM ('REPS_WEIGHT', 'TIME_ONLY', 'REPS_ONLY');

-- CreateEnum
CREATE TYPE "SetType" AS ENUM ('NORMAL', 'FAILURE', 'WARMUP');

-- AlterTable
ALTER TABLE "exercises" ADD COLUMN "metric_type" "MetricType" NOT NULL DEFAULT 'REPS_WEIGHT';

-- AlterTable
ALTER TABLE "sets"
    ADD COLUMN "duration_sec" INTEGER,
    ADD COLUMN "set_type" "SetType" NOT NULL DEFAULT 'NORMAL',
    ALTER COLUMN "weight_kg" DROP NOT NULL,
    ALTER COLUMN "reps" DROP NOT NULL;