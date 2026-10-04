CREATE TABLE "member_mfa" (
	"user_id" text PRIMARY KEY,
	"secret" text NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"last_step" integer DEFAULT 0 NOT NULL,
	"failed_attempts" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mfa_sessions" (
	"token_hash" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE INDEX "mfa_sessions_user_id_idx" ON "mfa_sessions" ("user_id");