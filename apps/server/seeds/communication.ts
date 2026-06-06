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

  const prismaAny = prisma as any;

  for (const department of DEPARTMENTS) {
    const departmentRoom = await prisma.chatRoom.create({
      data: { name: department.timetableLabel, isGroup: true },
    });
    const departmentFaculty = faculties.filter((f) => f.departmentCode === department.code);
    const departmentStudents = students.filter((s) => s.departmentCode === department.code);
    const departmentUsers = [...departmentFaculty.map((f) => f.id), ...departmentStudents.map((s) => s.id)];
    
    for (const userId of departmentUsers) {
      await prisma.userChatRoom.create({ data: { userId, chatRoomId: departmentRoom.id } });
    }

    const senders = [...departmentFaculty.map((f) => f.id), ...departmentStudents.slice(0, 4).map((s) => s.id)];
    const messages = [
      `Has anyone started the assignment for ${department.code}?`,
      `The lecture for ${department.code} is rescheduled to 2 PM today.`,
      `Where can I find the notes for the last session?`,
      `The lab manual has been uploaded to the course content section.`,
      `Reminder: Quiz 1 is scheduled for next Monday.`,
      `Does anyone want to form a study group for the midterms?`,
      `The department seminar on AI has been moved to the main auditorium.`,
      `Please submit your project titles by the end of this week.`
    ];

    for (let i = 0; i < messages.length; i += 1) {
      await prisma.message.create({
        data: {
          chatRoomId: departmentRoom.id,
          senderId: senders[i % senders.length],
          content: messages[i],
          createdAt: daysAgo(i % 3),
        },
      });
    }
  }

  const clubNames = ['Robotics Club', 'Coding Club', 'Photography Club'];
  for (let index = 0; index < clubNames.length; index += 1) {
    const clubName = clubNames[index];
    const clubRoom = await prisma.chatRoom.create({
      data: { name: `CLUB::${clubName}`, isGroup: true },
    });
    const club = await prismaAny.club.create({
      data: {
        name: clubName,
        chatRoomId: clubRoom.id,
        createdById: adminId,
      },
    });

    // Admin is always part of club chats.
    await prisma.userChatRoom.create({
      data: { userId: adminId, chatRoomId: clubRoom.id },
    });

    // Seed join request lifecycle samples.
    const pendingRequester = students[index % students.length];
    const approvedRequester = students[(index + 3) % students.length];
    const rejectedRequester = faculties[index % faculties.length];

    await prismaAny.clubJoinRequest.create({
      data: {
        clubId: club.id,
        requesterId: pendingRequester.id,
        proposalText: `I want to join ${clubName} to contribute consistently and participate in activities.`,
        mediaJson: JSON.stringify([
          {
            url: `https://example.com/proposals/${pendingRequester.id}/intent.pdf`,
            kind: 'file',
            name: 'intent.pdf',
            mimeType: 'application/pdf',
          },
        ]),
        status: 'pending',
      },
    });

    await prismaAny.clubJoinRequest.create({
      data: {
        clubId: club.id,
        requesterId: approvedRequester.id,
        proposalText: `I can contribute to ${clubName} events and execution teams.`,
        status: 'approved',
        reviewNote: 'Strong proposal and active participation history.',
        reviewedById: adminId,
        reviewedAt: daysAgo(2),
      },
    });
    await prisma.userChatRoom.create({
      data: { userId: approvedRequester.id, chatRoomId: clubRoom.id },
    });

    await prismaAny.clubJoinRequest.create({
      data: {
        clubId: club.id,
        requesterId: rejectedRequester.id,
        proposalText: `Requesting to join ${clubName} with limited time availability this term.`,
        status: 'rejected',
        reviewNote: 'Please re-apply with availability and concrete contribution plan.',
        reviewedById: adminId,
        reviewedAt: daysAgo(1),
      },
    });

    await prisma.message.create({
      data: {
        chatRoomId: clubRoom.id,
        senderId: adminId,
        content: `Welcome to ${clubName}. Share updates and announcements here.`,
      },
    });
  }
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
