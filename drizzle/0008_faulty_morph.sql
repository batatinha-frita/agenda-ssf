ALTER TYPE "public"."appointment_status" ADD VALUE 'pending' BEFORE 'cancelled';--> statement-breakpoint
ALTER TYPE "public"."appointment_status" ADD VALUE 'completed';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "plan" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "stripe_customer_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "stripe_subscription_id" text;