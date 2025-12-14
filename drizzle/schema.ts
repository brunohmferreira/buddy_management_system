import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, datetime } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extended with buddy and newHire information.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["admin", "buddy", "newHire", "user"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Buddies table - experienced employees who mentor new hires
 */
export const buddies = mysqlTable("buddies", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  nickname: varchar("nickname", { length: 100 }),
  team: varchar("team", { length: 100 }),
  level: varchar("level", { length: 50 }), // junior, mid, senior, lead, manager
  status: mysqlEnum("status", ["available", "unavailable", "inactive"]).default("available").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Buddy = typeof buddies.$inferSelect;
export type InsertBuddy = typeof buddies.$inferInsert;

/**
 * New Hires table - employees being onboarded
 */
export const newHires = mysqlTable("newHires", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  nickname: varchar("nickname", { length: 100 }),
  team: varchar("team", { length: 100 }),
  level: varchar("level", { length: 50 }), // intern, junior, mid, senior
  status: mysqlEnum("status", ["onboarding", "active", "completed", "inactive"]).default("onboarding").notNull(),
  startDate: datetime("startDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NewHire = typeof newHires.$inferSelect;
export type InsertNewHire = typeof newHires.$inferInsert;

/**
 * Associations table - links between buddies and new hires
 */
export const associations = mysqlTable("associations", {
  id: int("id").autoincrement().primaryKey(),
  buddyId: int("buddyId").notNull().references(() => buddies.id, { onDelete: "cascade" }),
  newHireId: int("newHireId").notNull().references(() => newHires.id, { onDelete: "cascade" }),
  status: mysqlEnum("status", ["active", "completed", "paused", "inactive"]).default("active").notNull(),
  startDate: datetime("startDate").notNull(),
  endDate: datetime("endDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Association = typeof associations.$inferSelect;
export type InsertAssociation = typeof associations.$inferInsert;

/**
 * Tasks table - onboarding tasks for new hires
 */
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  associationId: int("associationId").notNull().references(() => associations.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  usefulLink: varchar("usefulLink", { length: 500 }),
  status: mysqlEnum("status", ["pending", "inProgress", "completed", "overdue"]).default("pending").notNull(),
  dueDate: datetime("dueDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

/**
 * Task Assignments table - tracks who is responsible for each task
 */
export const taskAssignments = mysqlTable("taskAssignments", {
  id: int("id").autoincrement().primaryKey(),
  taskId: int("taskId").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TaskAssignment = typeof taskAssignments.$inferSelect;
export type InsertTaskAssignment = typeof taskAssignments.$inferInsert;

/**
 * Meetings table - scheduled meetings between buddy and new hire
 */
export const meetings = mysqlTable("meetings", {
  id: int("id").autoincrement().primaryKey(),
  associationId: int("associationId").notNull().references(() => associations.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }),
  scheduledAt: datetime("scheduledAt").notNull(),
  completedAt: datetime("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Meeting = typeof meetings.$inferSelect;
export type InsertMeeting = typeof meetings.$inferInsert;

/**
 * Meeting Notes table - collaborative notes from meetings
 */
export const meetingNotes = mysqlTable("meetingNotes", {
  id: int("id").autoincrement().primaryKey(),
  meetingId: int("meetingId").notNull().references(() => meetings.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MeetingNote = typeof meetingNotes.$inferSelect;
export type InsertMeetingNote = typeof meetingNotes.$inferInsert;

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  buddy: one(buddies, {
    fields: [users.id],
    references: [buddies.userId],
  }),
  newHire: one(newHires, {
    fields: [users.id],
    references: [newHires.userId],
  }),
  taskAssignments: many(taskAssignments),
  meetingNotes: many(meetingNotes),
}));

export const buddiesRelations = relations(buddies, ({ one, many }) => ({
  user: one(users, {
    fields: [buddies.userId],
    references: [users.id],
  }),
  associations: many(associations),
}));

export const newHiresRelations = relations(newHires, ({ one, many }) => ({
  user: one(users, {
    fields: [newHires.userId],
    references: [users.id],
  }),
  associations: many(associations),
}));

export const associationsRelations = relations(associations, ({ one, many }) => ({
  buddy: one(buddies, {
    fields: [associations.buddyId],
    references: [buddies.id],
  }),
  newHire: one(newHires, {
    fields: [associations.newHireId],
    references: [newHires.id],
  }),
  tasks: many(tasks),
  meetings: many(meetings),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  association: one(associations, {
    fields: [tasks.associationId],
    references: [associations.id],
  }),
  assignments: many(taskAssignments),
}));

export const taskAssignmentsRelations = relations(taskAssignments, ({ one }) => ({
  task: one(tasks, {
    fields: [taskAssignments.taskId],
    references: [tasks.id],
  }),
  user: one(users, {
    fields: [taskAssignments.userId],
    references: [users.id],
  }),
}));

export const meetingsRelations = relations(meetings, ({ one, many }) => ({
  association: one(associations, {
    fields: [meetings.associationId],
    references: [associations.id],
  }),
  notes: many(meetingNotes),
}));

export const meetingNotesRelations = relations(meetingNotes, ({ one }) => ({
  meeting: one(meetings, {
    fields: [meetingNotes.meetingId],
    references: [meetings.id],
  }),
  user: one(users, {
    fields: [meetingNotes.userId],
    references: [users.id],
  }),
}));
