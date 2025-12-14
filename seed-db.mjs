import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

async function seedDatabase() {
  const connection = await mysql.createConnection(DATABASE_URL);

  try {
    console.log("Creating tables...");

    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        openId VARCHAR(64) NOT NULL UNIQUE,
        name TEXT,
        email VARCHAR(320),
        loginMethod VARCHAR(64),
        role ENUM('admin', 'buddy', 'newHire', 'user') NOT NULL DEFAULT 'user',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create buddies table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS buddies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        nickname VARCHAR(100),
        team VARCHAR(100),
        level VARCHAR(50),
        status ENUM('available', 'unavailable', 'inactive') NOT NULL DEFAULT 'available',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create newHires table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS newHires (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        nickname VARCHAR(100),
        team VARCHAR(100),
        level VARCHAR(50),
        status ENUM('onboarding', 'active', 'completed', 'inactive') NOT NULL DEFAULT 'onboarding',
        startDate DATETIME,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create associations table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS associations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        buddyId INT NOT NULL,
        newHireId INT NOT NULL,
        status ENUM('active', 'completed', 'paused', 'inactive') NOT NULL DEFAULT 'active',
        startDate DATETIME NOT NULL,
        endDate DATETIME,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (buddyId) REFERENCES buddies(id) ON DELETE CASCADE,
        FOREIGN KEY (newHireId) REFERENCES newHires(id) ON DELETE CASCADE
      )
    `);

    // Create tasks table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        associationId INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        usefulLink VARCHAR(500),
        status ENUM('pending', 'inProgress', 'completed', 'overdue') NOT NULL DEFAULT 'pending',
        dueDate DATETIME,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (associationId) REFERENCES associations(id) ON DELETE CASCADE
      )
    `);

    // Create taskAssignments table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS taskAssignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        taskId INT NOT NULL,
        userId INT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create meetings table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS meetings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        associationId INT NOT NULL,
        title VARCHAR(255),
        scheduledAt DATETIME NOT NULL,
        completedAt DATETIME,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (associationId) REFERENCES associations(id) ON DELETE CASCADE
      )
    `);

    // Create meetingNotes table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS meetingNotes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        meetingId INT NOT NULL,
        userId INT NOT NULL,
        content TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (meetingId) REFERENCES meetings(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log("Tables created successfully!");

    // Insert demo data
    console.log("Inserting demo data...");

    // Insert users
    const users = [
      { openId: "admin-user", name: "Admin User", email: "admin@example.com", role: "admin" },
      { openId: "buddy-1", name: "John Smith", email: "john@example.com", role: "buddy" },
      { openId: "buddy-2", name: "Sarah Johnson", email: "sarah@example.com", role: "buddy" },
      { openId: "newhire-1", name: "Alice Brown", email: "alice@example.com", role: "newHire" },
      { openId: "newhire-2", name: "Bob Wilson", email: "bob@example.com", role: "newHire" },
    ];

    for (const user of users) {
      await connection.execute(
        `INSERT INTO users (openId, name, email, role, loginMethod) VALUES (?, ?, ?, ?, ?)`,
        [user.openId, user.name, user.email, user.role, "manus"]
      );
    }

    console.log("Demo users created!");

    // Get user IDs
    const [userRows] = await connection.execute(`SELECT id, role FROM users ORDER BY id`);
    const userMap = {};
    userRows.forEach((row, index) => {
      userMap[index] = row.id;
    });

    // Insert buddies
    const buddies = [
      { userId: userMap[1], nickname: "John Smith", team: "Engineering", level: "Senior", status: "available" },
      { userId: userMap[2], nickname: "Sarah Johnson", team: "Design", level: "Mid", status: "available" },
    ];

    for (const buddy of buddies) {
      await connection.execute(
        `INSERT INTO buddies (userId, nickname, team, level, status) VALUES (?, ?, ?, ?, ?)`,
        [buddy.userId, buddy.nickname, buddy.team, buddy.level, buddy.status]
      );
    }

    console.log("Demo buddies created!");

    // Insert new hires
    const newHires = [
      { userId: userMap[3], nickname: "Alice Brown", team: "Engineering", level: "Junior", status: "onboarding", startDate: new Date() },
      { userId: userMap[4], nickname: "Bob Wilson", team: "Design", level: "Junior", status: "onboarding", startDate: new Date() },
    ];

    for (const newHire of newHires) {
      await connection.execute(
        `INSERT INTO newHires (userId, nickname, team, level, status, startDate) VALUES (?, ?, ?, ?, ?, ?)`,
        [newHire.userId, newHire.nickname, newHire.team, newHire.level, newHire.status, newHire.startDate]
      );
    }

    console.log("Demo new hires created!");

    // Get buddy and new hire IDs
    const [buddyRows] = await connection.execute(`SELECT id FROM buddies ORDER BY id`);
    const [newHireRows] = await connection.execute(`SELECT id FROM newHires ORDER BY id`);

    // Insert associations
    const associations = [
      { buddyId: buddyRows[0].id, newHireId: newHireRows[0].id, status: "active", startDate: new Date() },
      { buddyId: buddyRows[1].id, newHireId: newHireRows[1].id, status: "active", startDate: new Date() },
    ];

    for (const assoc of associations) {
      await connection.execute(
        `INSERT INTO associations (buddyId, newHireId, status, startDate) VALUES (?, ?, ?, ?)`,
        [assoc.buddyId, assoc.newHireId, assoc.status, assoc.startDate]
      );
    }

    console.log("Demo associations created!");

    // Get association IDs
    const [assocRows] = await connection.execute(`SELECT id FROM associations ORDER BY id`);

    // Insert tasks
    const tasks = [
      { associationId: assocRows[0].id, title: "Setup Development Environment", description: "Install required tools and dependencies", status: "inProgress", dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
      { associationId: assocRows[0].id, title: "Review Company Policies", description: "Read and understand company handbook", status: "pending", dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
      { associationId: assocRows[1].id, title: "Complete Design Training", description: "Attend design system workshop", status: "pending", dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    ];

    for (const task of tasks) {
      await connection.execute(
        `INSERT INTO tasks (associationId, title, description, status, dueDate) VALUES (?, ?, ?, ?, ?)`,
        [task.associationId, task.title, task.description, task.status, task.dueDate]
      );
    }

    console.log("Demo tasks created!");

    // Insert meetings
    const meetings = [
      { associationId: assocRows[0].id, title: "Onboarding Kickoff", scheduledAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) },
      { associationId: assocRows[1].id, title: "Design Review", scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
    ];

    for (const meeting of meetings) {
      await connection.execute(
        `INSERT INTO meetings (associationId, title, scheduledAt) VALUES (?, ?, ?)`,
        [meeting.associationId, meeting.title, meeting.scheduledAt]
      );
    }

    console.log("Demo meetings created!");

    console.log("✓ Database seeded successfully with demo data!");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seedDatabase();
