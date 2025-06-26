ALTER TABLE "appointments" ALTER COLUMN "appointment_status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "appointments" ALTER COLUMN "appointment_status" SET DEFAULT 'confirmed'::text;--> statement-breakpoint
DROP TYPE "public"."appointment_status";--> statement-breakpoint
CREATE TYPE "public"."appointment_status" AS ENUM('confirmed', 'cancelled');--> statement-breakpoint
ALTER TABLE "appointments" ALTER COLUMN "appointment_status" SET DEFAULT 'confirmed'::"public"."appointment_status";--> statement-breakpoint
ALTER TABLE "appointments" ALTER COLUMN "appointment_status" SET DATA TYPE "public"."appointment_status" USING "appointment_status"::"public"."appointment_status";