import { fakerEN_IN as faker } from '@faker-js/faker';
import { prisma } from './utils';

export async function seedInfrastructure() {
  console.log('Seeding campus infrastructure (Rooms)...');

  const buildings = ['Main Building', 'Aeronautical Block', 'Civil Block', 'Computer Science Block', 'Electrical Block'];
  const types = ['Lecture Hall', 'Lab', 'Auditorium', 'Seminar Hall', 'Tutorial Room'];
  const facilitiesOptions = ['Projector, AC, WiFi', 'AC, Whiteboard', 'Computers, Projector, AC', 'Smart Board, PA System'];

  const roomsData: any[] = [];

  for (const building of buildings) {
    // Generate 5 rooms per building
    for (let floor = 0; floor <= 2; floor++) {
      for (let i = 1; i <= 3; i++) {
        const type = types[faker.number.int({ min: 0, max: types.length - 1 })];
        const capacity = type === 'Auditorium' ? 500 : type === 'Lecture Hall' ? 120 : 60;
        
        roomsData.push({
          name: `${building.split(' ')[0]}-${floor}0${i}`,
          type,
          capacity,
          building,
          floor,
          facilities: facilitiesOptions[faker.number.int({ min: 0, max: facilitiesOptions.length - 1 })],
          isAvailable: Math.random() > 0.1, // 90% available
        });
      }
    }
  }

  // Add standard PEC specific rooms
  roomsData.push({
    name: 'PEC Auditorium',
    type: 'Auditorium',
    capacity: 1000,
    building: 'Main Building',
    floor: 0,
    facilities: 'Projector, AC, PA System, Stage',
    isAvailable: true,
  });

  roomsData.push({
    name: 'L1',
    type: 'Lecture Hall',
    capacity: 150,
    building: 'Main Building',
    floor: 1,
    facilities: 'Projector, AC, WiFi',
    isAvailable: true,
  });

  await prisma.room.createMany({ data: roomsData });
}
