-- CreateEnum
CREATE TYPE "MuscleGroup" AS ENUM ('PECHO', 'ESPALDA', 'PIERNAS', 'HOMBROS', 'BRAZOS', 'CORE', 'CARDIO', 'OTROS');

-- CreateEnum
CREATE TYPE "ExerciseLevel" AS ENUM ('PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'TRAINER', 'GYM_ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "TimerState" AS ENUM ('RUNNING', 'PAUSED', 'STOPPED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "clerk_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "image_url" TEXT,
    "current_weight_kg" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "height_cm" INTEGER NOT NULL DEFAULT 0,
    "streak_days" INTEGER NOT NULL DEFAULT 0,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "gym_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercises" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "muscle_group" "MuscleGroup" NOT NULL,
    "level" "ExerciseLevel" NOT NULL DEFAULT 'PRINCIPIANTE',
    "mass_value" INTEGER NOT NULL,
    "demand_value" INTEGER NOT NULL,
    "complexity_value" INTEGER NOT NULL,
    "impact_value" INTEGER NOT NULL,
    "exercise_factor" DECIMAL(4,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "ended_at" TIMESTAMP(3),
    "estimated_calories" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timer_state" "TimerState" NOT NULL DEFAULT 'STOPPED',
    "timer_started_at" TIMESTAMP(3),
    "timer_paused_at" TIMESTAMP(3),
    "accumulated_time" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rest_timers" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "set_id" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL,
    "ended_at" TIMESTAMP(3),
    "duration_sec" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rest_timers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sets" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "exercise_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "weight_kg" DECIMAL(6,2) NOT NULL,
    "reps" INTEGER NOT NULL,
    "variant_bonus" DECIMAL(3,2) NOT NULL DEFAULT 1.00,
    "penalty" DECIMAL(3,2) NOT NULL DEFAULT 1.00,
    "is_record_pr" BOOLEAN NOT NULL DEFAULT false,
    "isg_score" DECIMAL(8,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "old_data" JSONB,
    "new_data" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerk_id_key" ON "users"("clerk_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "exercises_name_key" ON "exercises"("name");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_created_at_idx" ON "audit_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_entity_entity_id_idx" ON "audit_logs"("entity", "entity_id");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rest_timers" ADD CONSTRAINT "rest_timers_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sets" ADD CONSTRAINT "sets_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sets" ADD CONSTRAINT "sets_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sets" ADD CONSTRAINT "sets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
