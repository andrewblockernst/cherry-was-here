CREATE TABLE `countries` (
	`iso2` text(2) PRIMARY KEY NOT NULL,
	`iso3` text(3),
	`name` text NOT NULL,
	`name_es` text,
	`region` text
);
--> statement-breakpoint
CREATE TABLE `eras` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`start_year` integer NOT NULL,
	`end_year` integer,
	`color` text,
	`emoji` text,
	`order_index` integer,
	`inserted_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `eras_user_id_slug_index` ON `eras` (`user_id`,`slug`);--> statement-breakpoint
CREATE TABLE `moments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`era_id` integer,
	`title` text NOT NULL,
	`body` text,
	`date` text NOT NULL,
	`location` text,
	`country_code` text(2),
	`visibility` text DEFAULT 'private' NOT NULL,
	`latitude` real,
	`longitude` real,
	`photo_url` text,
	`inserted_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`era_id`) REFERENCES `eras`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`country_code`) REFERENCES `countries`(`iso2`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `moments_user_id_index` ON `moments` (`user_id`);--> statement-breakpoint
CREATE INDEX `moments_visibility_index` ON `moments` (`visibility`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`hashed_password` text,
	`slug` text,
	`name` text,
	`bio` text,
	`avatar_url` text,
	`inserted_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_slug_unique` ON `users` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_index` ON `users` ("email" COLLATE NOCASE);