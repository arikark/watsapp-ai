CREATE TABLE `chat_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`phone_number` text NOT NULL,
	`message` text NOT NULL,
	`timestamp` text NOT NULL,
	`is_from_user` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT '(datetime(''now''))'
);
