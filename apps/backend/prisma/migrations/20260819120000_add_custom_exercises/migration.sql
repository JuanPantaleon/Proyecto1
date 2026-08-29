-- AlterTable
ALTER TABLE "exercises"
    ADD COLUMN "description" TEXT,
    ADD COLUMN "is_custom" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN "default_sets" INTEGER,
    ADD COLUMN "default_reps" INTEGER,
    ADD COLUMN "default_weight" DECIMAL(8,2),
    ADD COLUMN "default_sec" INTEGER,
    ADD COLUMN "created_by_id" TEXT,
    ALTER COLUMN "mass_value" DROP NOT NULL,
    ALTER COLUMN "demand_value" DROP NOT NULL,
    ALTER COLUMN "complexity_value" DROP NOT NULL,
    ALTER COLUMN "impact_value" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;