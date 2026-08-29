-- CreateEnum
CREATE TYPE "RoutineDayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "RoutineBlockType" AS ENUM ('CIRCUIT', 'TRAINING');

-- CreateTable
CREATE TABLE "routines" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "goal" TEXT,
    "level" "ExerciseLevel" NOT NULL DEFAULT 'INTERMEDIO',
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "is_official" BOOLEAN NOT NULL DEFAULT false,
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routine_days" (
    "id" TEXT NOT NULL,
    "routine_id" TEXT NOT NULL,
    "day_of_week" "RoutineDayOfWeek" NOT NULL,
    "title" TEXT,
    "focus" TEXT,
    "goal" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "routine_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routine_blocks" (
    "id" TEXT NOT NULL,
    "day_id" TEXT NOT NULL,
    "type" "RoutineBlockType" NOT NULL,
    "name" TEXT NOT NULL,
    "rounds" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "routine_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routine_sets" (
    "id" TEXT NOT NULL,
    "block_id" TEXT NOT NULL,
    "exercise_id" TEXT NOT NULL,
    "target_sets" INTEGER,
    "target_reps" TEXT,
    "weight_kg" DECIMAL(6,2),
    "tempo" TEXT,
    "notes" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "routine_sets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "routines_name_key" ON "routines"("name");

-- CreateIndex
CREATE UNIQUE INDEX "routine_days_routine_id_day_of_week_key" ON "routine_days"("routine_id", "day_of_week");

-- AddForeignKey
ALTER TABLE "routines" ADD CONSTRAINT "routines_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_days" ADD CONSTRAINT "routine_days_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "routines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_blocks" ADD CONSTRAINT "routine_blocks_day_id_fkey" FOREIGN KEY ("day_id") REFERENCES "routine_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_sets" ADD CONSTRAINT "routine_sets_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "routine_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_sets" ADD CONSTRAINT "routine_sets_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
