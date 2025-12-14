import { eq, and, desc, asc, like, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, buddies, newHires, associations, tasks, taskAssignments, meetings, meetingNotes, Buddy, NewHire, Association, Task, Meeting, MeetingNote } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Buddies queries
export async function getBuddies() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(buddies);
}

export async function getBuddyById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(buddies).where(eq(buddies.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getBuddyByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(buddies).where(eq(buddies.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createBuddy(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(buddies).values(data);
  return result;
}

export async function updateBuddy(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(buddies).set(data).where(eq(buddies.id, id));
}

export async function deleteBuddy(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(buddies).where(eq(buddies.id, id));
}

// New Hires queries
export async function getNewHires() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(newHires);
}

export async function getNewHireById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(newHires).where(eq(newHires.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getNewHireByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(newHires).where(eq(newHires.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createNewHire(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(newHires).values(data);
  return result;
}

export async function updateNewHire(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(newHires).set(data).where(eq(newHires.id, id));
}

export async function deleteNewHire(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(newHires).where(eq(newHires.id, id));
}

// Associations queries
export async function getAssociations() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(associations);
}

export async function getAssociationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(associations).where(eq(associations.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAssociationsByBuddyId(buddyId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(associations).where(eq(associations.buddyId, buddyId));
}

export async function getAssociationsByNewHireId(newHireId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(associations).where(eq(associations.newHireId, newHireId));
}

export async function createAssociation(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(associations).values(data);
  return result;
}

export async function updateAssociation(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(associations).set(data).where(eq(associations.id, id));
}

export async function deleteAssociation(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(associations).where(eq(associations.id, id));
}

// Tasks queries
export async function getTasksByAssociationId(associationId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(tasks).where(eq(tasks.associationId, associationId));
}

export async function getTaskById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createTask(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(tasks).values(data);
  return result;
}

export async function updateTask(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(tasks).set(data).where(eq(tasks.id, id));
}

export async function deleteTask(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(tasks).where(eq(tasks.id, id));
}

// Task Assignments queries
export async function getTaskAssignmentsByTaskId(taskId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(taskAssignments).where(eq(taskAssignments.taskId, taskId));
}

export async function createTaskAssignment(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(taskAssignments).values(data);
}

export async function deleteTaskAssignment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(taskAssignments).where(eq(taskAssignments.id, id));
}

// Meetings queries
export async function getMeetingsByAssociationId(associationId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(meetings).where(eq(meetings.associationId, associationId));
}

export async function getMeetingById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(meetings).where(eq(meetings.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createMeeting(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(meetings).values(data);
  return result;
}

export async function updateMeeting(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(meetings).set(data).where(eq(meetings.id, id));
}

export async function deleteMeeting(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(meetings).where(eq(meetings.id, id));
}

// Meeting Notes queries
export async function getMeetingNotesByMeetingId(meetingId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(meetingNotes).where(eq(meetingNotes.meetingId, meetingId));
}

export async function createMeetingNote(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(meetingNotes).values(data);
}

export async function updateMeetingNote(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(meetingNotes).set(data).where(eq(meetingNotes.id, id));
}

export async function deleteMeetingNote(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(meetingNotes).where(eq(meetingNotes.id, id));
}

// Dashboard metrics
export async function getDashboardMetrics() {
  const db = await getDb();
  if (!db) return { buddyCount: 0, newHireCount: 0, activeAssociations: 0, pendingTasks: 0 };

  try {
    const [buddyResult, newHireResult, associationResult, taskResult] = await Promise.all([
      db.select({ count: buddies.id }).from(buddies),
      db.select({ count: newHires.id }).from(newHires),
      db.select({ count: associations.id }).from(associations).where(eq(associations.status, 'active')),
      db.select({ count: tasks.id }).from(tasks).where(eq(tasks.status, 'pending')),
    ]);

    return {
      buddyCount: buddyResult.length,
      newHireCount: newHireResult.length,
      activeAssociations: associationResult.length,
      pendingTasks: taskResult.length,
    };
  } catch (error) {
    console.error("[Database] Failed to get dashboard metrics:", error);
    return { buddyCount: 0, newHireCount: 0, activeAssociations: 0, pendingTasks: 0 };
  }
}
