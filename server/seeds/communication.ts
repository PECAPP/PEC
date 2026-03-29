import { prisma, daysAgo, daysFromNow } from './utils';
import { 
  DEPARTMENTS, 
  ACTIVE_SEMESTERS, 
  FacultySeed, 
  StudentSeed, 
  CourseSeed 
} from './data';

export async function seedCommunicationAndActivity(
  adminId: string,
  faculties: FacultySeed[],
  students: StudentSeed[],
  courses: CourseSeed[],
) {
  const allUsers = [adminId, ...faculties.map((f) => f.id), ...students.map((s) => s.id)];
  const globalRoom = await prisma.chatRoom.create({
    data: { name: 'PEC Global Announcements', isGroup: true },
  });

  for (const userId of allUsers) {
    await prisma.userChatRoom.create({ data: { userId, chatRoomId: globalRoom.id } });
  }

  for (const department of DEPARTMENTS) {
    const departmentRoom = await prisma.chatRoom.create({
      data: { name: department.timetableLabel, isGroup: true },
    });
    const departmentFaculty = faculties.filter((f) => f.departmentCode === department.code);
    const departmentStudents = students.filter((s) => s.departmentCode === department.code);
    for (const userId of [...departmentFaculty.map((f) => f.id), ...departmentStudents.map((s) => s.id)]) {
      await prisma.userChatRoom.create({ data: { userId, chatRoomId: departmentRoom.id } });
    }
    const senders = [...departmentFaculty.map((f) => f.id), ...departmentStudents.slice(0, 4).map((s) => s.id)];
    for (let i = 0; i < 8; i += 1) {
      await prisma.message.create({
        data: {
          chatRoomId: departmentRoom.id,
          senderId: senders[i % senders.length],
          content: i % 2 === 0 ? `${department.code} timetable updated for sem ${ACTIVE_SEMESTERS[i % ACTIVE_SEMESTERS.length]}.` : `${department.code} assignment checkpoints live.`,
        },
      });
    }
  }

  const prismaAny = prisma as any;
  await prismaAny.featureFlag.createMany({
    data: [
      { key: 'timetable.auto_generation', description: 'Enable auto timetable.', enabled: true, payload: JSON.stringify({ activeSemesters: ACTIVE_SEMESTERS }) },
      { key: 'departments.dynamic_listing', description: 'Serve live depts.', enabled: true },
    ],
  });

  await prismaAny.backgroundJob.createMany({
    data: [
      { type: 'audit-log-prune', status: 'pending', payload: JSON.stringify({ retainDays: 180 }), runAt: daysFromNow(1), availableAt: daysFromNow(1), dedupeKey: 'audit-log-prune-default' },
      { type: 'timetable-sync', status: 'pending', payload: JSON.stringify({ departments: DEPARTMENTS.map((d) => d.code) }), runAt: daysFromNow(1), availableAt: daysFromNow(1), dedupeKey: 'timetable-sync-campus' },
    ],
  });

  const auditEntries = courses.slice(0, 30).map((course, index) => ({
    actorUserId: index % 2 === 0 ? adminId : faculties[index % faculties.length].id,
    actorRole: index % 2 === 0 ? 'college_admin' : 'faculty',
    action: index % 3 === 0 ? 'create' : 'update',
    entity: index % 2 === 0 ? 'course' : 'timetable',
    entityId: course.id,
    method: index % 2 === 0 ? 'POST' : 'PATCH',
    path: index % 2 === 0 ? '/courses' : `/timetable/${course.id}`,
    ip: `10.0.0.${10 + index}`,
    statusCode: 200,
    metadata: JSON.stringify({ courseCode: course.code, department: course.departmentName }),
    createdAt: daysAgo(index),
  }));
  await prisma.auditLog.createMany({ data: auditEntries });
}
