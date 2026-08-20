CREATE TABLE "data_access_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"endpoint" varchar(255) NOT NULL,
	"requested_scopes" text NOT NULL,
	"granted_scopes" text NOT NULL,
	"purpose" varchar(255) NOT NULL,
	"success" boolean NOT NULL,
	"denial_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "data_access_logs" ADD CONSTRAINT "data_access_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_access_logs" ADD CONSTRAINT "data_access_logs_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;