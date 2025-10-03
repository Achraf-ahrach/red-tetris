ALTER TABLE "users" ADD COLUMN "forty_two_id" varchar(100);--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_forty_two_id_unique" UNIQUE("forty_two_id");