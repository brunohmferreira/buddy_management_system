CREATE TABLE `associations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`buddyId` int NOT NULL,
	`newHireId` int NOT NULL,
	`status` enum('active','completed','paused','inactive') NOT NULL DEFAULT 'active',
	`startDate` datetime NOT NULL,
	`endDate` datetime,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `associations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `buddies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`nickname` varchar(100),
	`team` varchar(100),
	`level` varchar(50),
	`status` enum('available','unavailable','inactive') NOT NULL DEFAULT 'available',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `buddies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meetingNotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`meetingId` int NOT NULL,
	`userId` int NOT NULL,
	`content` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `meetingNotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meetings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`associationId` int NOT NULL,
	`title` varchar(255),
	`scheduledAt` datetime NOT NULL,
	`completedAt` datetime,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `meetings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `newHires` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`nickname` varchar(100),
	`team` varchar(100),
	`level` varchar(50),
	`status` enum('onboarding','active','completed','inactive') NOT NULL DEFAULT 'onboarding',
	`startDate` datetime,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `newHires_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `taskAssignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskId` int NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `taskAssignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`associationId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`usefulLink` varchar(500),
	`status` enum('pending','inProgress','completed','overdue') NOT NULL DEFAULT 'pending',
	`dueDate` datetime,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('admin','buddy','newHire','user') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `associations` ADD CONSTRAINT `associations_buddyId_buddies_id_fk` FOREIGN KEY (`buddyId`) REFERENCES `buddies`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `associations` ADD CONSTRAINT `associations_newHireId_newHires_id_fk` FOREIGN KEY (`newHireId`) REFERENCES `newHires`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `buddies` ADD CONSTRAINT `buddies_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `meetingNotes` ADD CONSTRAINT `meetingNotes_meetingId_meetings_id_fk` FOREIGN KEY (`meetingId`) REFERENCES `meetings`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `meetingNotes` ADD CONSTRAINT `meetingNotes_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `meetings` ADD CONSTRAINT `meetings_associationId_associations_id_fk` FOREIGN KEY (`associationId`) REFERENCES `associations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `newHires` ADD CONSTRAINT `newHires_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `taskAssignments` ADD CONSTRAINT `taskAssignments_taskId_tasks_id_fk` FOREIGN KEY (`taskId`) REFERENCES `tasks`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `taskAssignments` ADD CONSTRAINT `taskAssignments_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_associationId_associations_id_fk` FOREIGN KEY (`associationId`) REFERENCES `associations`(`id`) ON DELETE cascade ON UPDATE no action;