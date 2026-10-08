CREATE TABLE "member_profiles" (
	"user_id" text PRIMARY KEY,
	"provider" text NOT NULL,
	"provider_email" text,
	"legal_name" text,
	"name_source" text,
	"birth_date" date,
	"sex" text,
	"policy_version" text,
	"attested_at" timestamp,
	"refused_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "resumes" ADD COLUMN "name_style" text DEFAULT 'first-initial' NOT NULL;