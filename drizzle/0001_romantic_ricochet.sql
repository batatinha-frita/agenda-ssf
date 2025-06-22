CREATE TYPE "public"."payment_status" AS ENUM('paid', 'pending', 'overdue');--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "payment_status" "payment_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "notes" text;