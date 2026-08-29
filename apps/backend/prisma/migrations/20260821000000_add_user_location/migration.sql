-- Add structured location columns for ranking readiness.
-- These are nullable so existing users are not affected.
ALTER TABLE "users" ADD COLUMN "location_country" TEXT;
ALTER TABLE "users" ADD COLUMN "location_province" TEXT;
ALTER TABLE "users" ADD COLUMN "location_city" TEXT;
