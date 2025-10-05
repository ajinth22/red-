CREATE TABLE `favorites` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`song_id` integer NOT NULL,
	`added_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`song_id`) REFERENCES `songs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `playlist_songs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`playlist_id` integer NOT NULL,
	`song_id` integer NOT NULL,
	`position` integer NOT NULL,
	`added_at` text NOT NULL,
	FOREIGN KEY (`playlist_id`) REFERENCES `playlists`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`song_id`) REFERENCES `songs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `playlists` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`user_id` text NOT NULL,
	`cover_image` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `recently_played` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`song_id` integer NOT NULL,
	`played_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`song_id`) REFERENCES `songs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `songs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`artist` text NOT NULL,
	`duration` text NOT NULL,
	`thumbnail` text NOT NULL,
	`source_type` text NOT NULL,
	`source_id` text NOT NULL,
	`file_url` text,
	`user_id` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
