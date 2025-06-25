ALTER TABLE "patients" ADD COLUMN "cep" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "logradouro" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "numero" text;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "complemento" text;--> statement-breakpoint
ALTER TABLE "patients" DROP COLUMN "address";