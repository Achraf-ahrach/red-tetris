ALTER TABLE "users" DROP CONSTRAINT "users_forty_two_id_unique";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "total_games" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "total_wins" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "total_losses" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "high_score" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "total_lines" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "current_streak" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "longest_streak" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "total_play_time" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "level" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "experience" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "achievements" json DEFAULT '[]'::json;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "forty_two_id";