import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { fakerEN_IN as faker } from '@faker-js/faker';

export async function seedClubs(prisma: PrismaClient) {
  console.log('Seeding Clubs with rich descriptions and members...');

  const clubsToCreate = [
    { name: 'Art and Photography Club', desc: 'Capturing moments and expressing creativity through visual arts and photography.' },
    { name: 'Dramatics Club', desc: 'The official theatre and acting society of PEC. We perform nukkad nataks and stage plays.' },
    { name: 'Music Club', desc: 'A haven for musicians, vocalists, and music enthusiasts. Home to the college band.' },
    { name: 'Dance Club', desc: 'From Bhangra to Hip-Hop, we celebrate rhythm and movement.' },
    { name: 'Debating Society', desc: 'Fostering critical thinking, MUNs, and parliamentary debates.' },
    { name: 'ASCE (Civil Engineering Society)', desc: 'American Society of Civil Engineers student chapter. We build the future.' },
    { name: 'ACM (Computing Society)', desc: 'Association for Computing Machinery. Coding, hackathons, and tech talks.' },
    { name: 'ASME (Mechanical Society)', desc: 'American Society of Mechanical Engineers. Robotics, automotive, and design.' },
    { name: 'IIM (Metals & Materials)', desc: 'Indian Institute of Metals student chapter. Exploring materials science.' },
    { name: 'ASPS (Aerospace Society)', desc: 'Aerospace society for drone building, aerodynamics, and space exploration.' },
    { name: 'IEEE (Electronics Society)', desc: 'Institute of Electrical and Electronics Engineers. Circuits, signals, and systems.' },
    { name: 'Robotics Society', desc: 'Building autonomous robots, rovers, and participating in Robocon.' },
    { name: 'SAE (Automotive Engineers)', desc: 'Society of Automotive Engineers. We build the formula student race cars.' },
    { name: 'Entrepreneurship Cell (E-Cell)', desc: 'Fostering startup culture, pitching events, and founder talks.' },
    { name: 'Rotaract Club', desc: 'Community service, blood donation camps, and social awareness.' },
  ];

  const adminUser = await prisma.user.findFirst({
    where: { role: 'admin' },
  });

  const students = await prisma.user.findMany({
    where: { role: 'student' },
    select: { id: true }
  });

  if (!adminUser) {
    console.log('No admin found to create clubs, skipping...');
    return;
  }

  for (const clubData of clubsToCreate) {
    const existing = await prisma.club.findUnique({ where: { name: clubData.name } });
    if (!existing) {
      const chatRoomId = uuidv4();
      
      // Create chat room first
      await prisma.chatRoom.create({
        data: {
          id: chatRoomId,
          name: clubData.name,
          isGroup: true,
        },
      });

      // Create club linked to chat room
      const club = await prisma.club.create({
        data: {
          name: clubData.name,
          chatRoomId,
          createdById: adminUser.id,
        },
      });
      
      // Add admin as a participant in the club chat room
      await prisma.userChatRoom.create({
        data: { chatRoomId: chatRoomId, userId: adminUser.id },
      });

      // Add 5-15 random students as members
      if (students.length > 0) {
        const numMembers = faker.number.int({ min: 5, max: 15 });
        const selectedStudents = faker.helpers.arrayElements(students, Math.min(numMembers, students.length));
        
        for (const student of selectedStudents) {
          await prisma.userChatRoom.createMany({
            data: [{ chatRoomId: chatRoomId, userId: student.id }],
            skipDuplicates: true,
          });
        }
      }
    }
  }

  console.log('Clubs Seeded successfully.');
}
