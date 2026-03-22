const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function parseArgs(argv) {
  const args = { sqlite: './prisma/dev.db', truncate: false };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--sqlite' && argv[index + 1]) {
      args.sqlite = argv[index + 1];
      index += 1;
    } else if (token === '--truncate') {
      args.truncate = true;
    }
  }

  return args;
}

function openSqlite(filePath) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(filePath, sqlite3.OPEN_READONLY, (err) => {
      if (err) reject(err);
      else resolve(db);
    });
  });
}

function closeSqlite(db) {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function all(db, sql) {
  return new Promise((resolve, reject) => {
    db.all(sql, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function tableExists(db, tableName) {
  const rows = await all(
    db,
    `SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}'`
  );
  return rows.length > 0;
}

async function readTable(db, tableName) {
  const exists = await tableExists(db, tableName);
  if (!exists) return [];
  return all(db, `SELECT * FROM "${tableName}"`);
}

function toDate(value) {
  if (!value) return null;
  return new Date(value);
}

function toBool(value) {
  return value === true || value === 1 || value === '1';
}

async function importModel(db, config) {
  const rows = await readTable(db, config.table);
  if (rows.length === 0) {
    console.log(`- ${config.table}: 0 rows (skipped)`);
    return 0;
  }

  const data = rows.map(config.map);
  await config.model.createMany({ data, skipDuplicates: true });
  console.log(`- ${config.table}: ${data.length} rows`);
  return data.length;
}

async function truncatePostgres() {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "BookBorrow",
      "Attendance",
      "Assignment",
      "Message",
      "UserChatRoom",
      "Timetable",
      "Enrollment",
      "StudentProfile",
      "FacultyProfile",
      "Job",
      "Room",
      "Book",
      "ChatRoom",
      "Course",
      "User"
    RESTART IDENTITY CASCADE
  `);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const sqlitePath = path.resolve(options.sqlite);

  if (!fs.existsSync(sqlitePath)) {
    throw new Error(`SQLite file not found: ${sqlitePath}`);
  }

  console.log('Starting SQLite -> PostgreSQL migration...');
  console.log(`SQLite source: ${sqlitePath}`);
  console.log(`PostgreSQL target: ${process.env.DATABASE_URL || '(from environment)'}`);

  const sqlite = await openSqlite(sqlitePath);

  try {
    if (options.truncate) {
      console.log('Truncating PostgreSQL target tables...');
      await truncatePostgres();
    }

    console.log('Importing data by dependency order:');

    const imported = {};

    imported.User = await importModel(sqlite, {
      table: 'User',
      model: prisma.user,
      map: (row) => ({
        id: row.id,
        email: row.email,
        name: row.name,
        role: row.role,
        avatar: row.avatar,
        profileComplete: toBool(row.profileComplete),
        password: row.password,
      }),
    });

    imported.Course = await importModel(sqlite, {
      table: 'Course',
      model: prisma.course,
      map: (row) => ({
        id: row.id,
        code: row.code,
        name: row.name,
        credits: Number(row.credits),
        instructor: row.instructor,
        department: row.department,
        semester: Number(row.semester),
        status: row.status,
      }),
    });

    imported.ChatRoom = await importModel(sqlite, {
      table: 'ChatRoom',
      model: prisma.chatRoom,
      map: (row) => ({
        id: row.id,
        name: row.name,
        isGroup: toBool(row.isGroup),
        createdAt: toDate(row.createdAt) || new Date(),
      }),
    });

    imported.Book = await importModel(sqlite, {
      table: 'Book',
      model: prisma.book,
      map: (row) => ({
        id: row.id,
        title: row.title,
        author: row.author,
        isbn: row.isbn,
        category: row.category,
        totalCopies: Number(row.totalCopies),
        availableCopies: Number(row.availableCopies),
        location: row.location,
        publisher: row.publisher,
        year: row.year == null ? null : Number(row.year),
      }),
    });

    imported.Room = await importModel(sqlite, {
      table: 'Room',
      model: prisma.room,
      map: (row) => ({
        id: row.id,
        name: row.name,
        type: row.type,
        capacity: Number(row.capacity),
        building: row.building,
        floor: Number(row.floor),
        facilities: row.facilities,
        isAvailable: toBool(row.isAvailable),
        createdAt: toDate(row.createdAt) || new Date(),
      }),
    });

    imported.StudentProfile = await importModel(sqlite, {
      table: 'StudentProfile',
      model: prisma.studentProfile,
      map: (row) => ({
        id: row.id,
        userId: row.userId,
        enrollmentNumber: row.enrollmentNumber,
        department: row.department,
        semester: Number(row.semester),
        phone: row.phone,
        dob: toDate(row.dob),
        address: row.address,
        bio: row.bio,
        createdAt: toDate(row.createdAt) || new Date(),
        updatedAt: toDate(row.updatedAt) || new Date(),
      }),
    });

    imported.FacultyProfile = await importModel(sqlite, {
      table: 'FacultyProfile',
      model: prisma.facultyProfile,
      map: (row) => ({
        id: row.id,
        userId: row.userId,
        employeeId: row.employeeId,
        department: row.department,
        designation: row.designation,
        phone: row.phone,
        specialization: row.specialization,
        qualifications: row.qualifications,
        bio: row.bio,
        createdAt: toDate(row.createdAt) || new Date(),
        updatedAt: toDate(row.updatedAt) || new Date(),
      }),
    });

    imported.Enrollment = await importModel(sqlite, {
      table: 'Enrollment',
      model: prisma.enrollment,
      map: (row) => ({
        id: row.id,
        studentId: row.studentId,
        courseId: row.courseId,
        courseName: row.courseName,
        courseCode: row.courseCode,
        semester: row.semester == null ? null : Number(row.semester),
        batch: row.batch,
        status: row.status,
        enrolledAt: toDate(row.enrolledAt) || new Date(),
      }),
    });

    imported.Timetable = await importModel(sqlite, {
      table: 'Timetable',
      model: prisma.timetable,
      map: (row) => ({
        id: row.id,
        courseId: row.courseId,
        courseName: row.courseName,
        courseCode: row.courseCode,
        facultyId: row.facultyId,
        facultyName: row.facultyName,
        day: row.day,
        startTime: row.startTime,
        endTime: row.endTime,
        room: row.room,
        department: row.department,
        semester: row.semester == null ? null : Number(row.semester),
        batch: row.batch,
        createdAt: toDate(row.createdAt) || new Date(),
      }),
    });

    imported.Message = await importModel(sqlite, {
      table: 'Message',
      model: prisma.message,
      map: (row) => ({
        id: row.id,
        content: row.content,
        createdAt: toDate(row.createdAt) || new Date(),
        senderId: row.senderId,
        chatRoomId: row.chatRoomId,
      }),
    });

    imported.UserChatRoom = await importModel(sqlite, {
      table: 'UserChatRoom',
      model: prisma.userChatRoom,
      map: (row) => ({
        userId: row.userId,
        chatRoomId: row.chatRoomId,
      }),
    });

    imported.Attendance = await importModel(sqlite, {
      table: 'Attendance',
      model: prisma.attendance,
      map: (row) => ({
        id: row.id,
        date: toDate(row.date) || new Date(),
        status: row.status,
        subject: row.subject,
        studentId: row.studentId,
      }),
    });

    imported.Assignment = await importModel(sqlite, {
      table: 'Assignment',
      model: prisma.assignment,
      map: (row) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        dueDate: toDate(row.dueDate) || new Date(),
        courseId: row.courseId,
      }),
    });

    imported.Job = await importModel(sqlite, {
      table: 'Job',
      model: prisma.job,
      map: (row) => ({
        id: row.id,
        title: row.title,
        company: row.company,
        location: row.location,
        type: row.type,
        salary: row.salary,
        deadline: toDate(row.deadline) || new Date(),
        matchScore: row.matchScore == null ? null : Number(row.matchScore),
      }),
    });

    imported.BookBorrow = await importModel(sqlite, {
      table: 'BookBorrow',
      model: prisma.bookBorrow,
      map: (row) => ({
        id: row.id,
        userId: row.userId,
        bookId: row.bookId,
        borrowDate: toDate(row.borrowDate) || new Date(),
        dueDate: toDate(row.dueDate) || new Date(),
        returnDate: toDate(row.returnDate),
        status: row.status,
        fine: row.fine == null ? null : Number(row.fine),
      }),
    });

    const total = Object.values(imported).reduce((sum, count) => sum + count, 0);
    console.log(`\nDone. Imported ${total} rows total.`);
  } finally {
    await closeSqlite(sqlite);
    await prisma.$disconnect();
  }
}

main().catch(async (error) => {
  console.error('\nMigration failed:', error.message);
  await prisma.$disconnect();
  process.exit(1);
});
