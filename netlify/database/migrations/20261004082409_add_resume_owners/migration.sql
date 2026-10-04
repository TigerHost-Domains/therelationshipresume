ALTER TABLE "resumes" ADD COLUMN "owner_id" text;--> statement-breakpoint
ALTER TABLE "resumes" ADD COLUMN "editor_emails" jsonb DEFAULT '[]' NOT NULL;