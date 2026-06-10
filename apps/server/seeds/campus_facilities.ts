import { fakerEN_IN as faker } from '@faker-js/faker';
import { prisma, daysAgo, daysFromNow } from './utils';
import { StudentSeed } from './data';

export async function seedCampusFacilities(students: StudentSeed[]) {
  console.log('--- Seeding Campus Facilities (Canteen & Hostel) ---');

  // 9.1 Canteen Items - 20 items across all categories
  const canteenItems = [
    { name: 'Veg Cheese Maggi', category: 'snacks', price: 45, isAvailable: true, stock: 200 },
    { name: 'Aloo Paratha', category: 'snacks', price: 30, isAvailable: true, stock: 150 },
    { name: 'Cold Coffee', category: 'beverages', price: 30, isAvailable: true, stock: 300 },
    { name: 'Masala Chai', category: 'beverages', price: 15, isAvailable: true, stock: 500 },
    { name: 'Paneer Puff', category: 'snacks', price: 20, isAvailable: true, stock: 100 },
    { name: 'Samosa Pav', category: 'snacks', price: 20, isAvailable: true, stock: 150 },
    { name: 'Schezwan Noodles', category: 'meals', price: 80, isAvailable: true, stock: 80 },
    { name: 'Paneer Butter Masala & Roti', category: 'meals', price: 120, isAvailable: true, stock: 60 },
    { name: 'Rajma Chawal', category: 'meals', price: 90, isAvailable: true, stock: 70 },
    { name: 'Dal Makhani & Naan', category: 'meals', price: 100, isAvailable: true, stock: 65 },
    { name: 'Mango Lassi', category: 'beverages', price: 40, isAvailable: true, stock: 200 },
    { name: 'Lemon Soda', category: 'beverages', price: 25, isAvailable: true, stock: 250 },
    { name: 'Mineral Water', category: 'beverages', price: 15, isAvailable: true, stock: 400 },
    { name: 'Chocolate Brownie', category: 'desserts', price: 50, isAvailable: true, stock: 80 },
    { name: 'Gulab Jamun (2pcs)', category: 'desserts', price: 30, isAvailable: true, stock: 100 },
    { name: 'Fruit Salad', category: 'desserts', price: 60, isAvailable: false, stock: 0 },
    { name: 'Veg Burger', category: 'snacks', price: 65, isAvailable: true, stock: 120 },
    { name: 'Paneer Sandwich', category: 'snacks', price: 55, isAvailable: true, stock: 100 },
    { name: 'Egg Bhurji & Toast', category: 'snacks', price: 50, isAvailable: true, stock: 90 },
    { name: 'Fresh Lime Water', category: 'beverages', price: 20, isAvailable: true, stock: 300 },
  ];

  for (const item of canteenItems) {
    await prisma.canteenItem.create({ data: item });
  }

  // 9.2 Canteen Orders - 100 orders with varied statuses and items
  const items = await prisma.canteenItem.findMany();
  const statuses = ['Pending', 'Preparing', 'Ready', 'Delivered', 'Delivered', 'Delivered', 'Cancelled'];
  const hostels = ['H1', 'H2', 'H3', 'H4', 'H5', 'GDH1', 'GDH2'];

  for (let i = 0; i < 120; i++) {
    const student = students[i % students.length];
    const numItems = faker.number.int({ min: 1, max: 4 });
    const selectedItems = faker.helpers.arrayElements(items, numItems);
    const orderItems = selectedItems.map((item: any) => ({
      itemId: item.id,
      name: item.name,
      quantity: faker.number.int({ min: 1, max: 3 }),
      price: item.price,
    }));
    const totalAmount = orderItems.reduce((sum: number, oi: any) => sum + oi.price * oi.quantity, 0);

    await prisma.canteenOrder.create({
      data: {
        studentId: student.id,
        studentName: student.name,
        hostelRoom: `${faker.helpers.arrayElement(hostels)}, Room ${faker.number.int({ min: 101, max: 220 })}`,
        totalAmount,
        status: faker.helpers.arrayElement(statuses),
        timestamp: daysAgo(faker.number.int({ min: 0, max: 30 })),
        items: { create: orderItems },
      },
    });
  }

  // 9.3 Hostel Issues - 60 issues with realistic categories
  const complaints = [
    { title: 'Monkey Menace in Balcony', category: 'other', priority: 'high', description: 'Monkeys have taken over the balcony and broken the clothesline.' },
    { title: 'Water Cooler Not Working', category: 'plumbing', priority: 'high', description: 'The water cooler on the 2nd floor is dispensing warm water.' },
    { title: 'Ceiling Fan Making Noise', category: 'electrical', priority: 'medium', description: 'The fan makes a loud ticking noise, disturbing sleep.' },
    { title: 'WiFi Not Working in Room', category: 'internet', priority: 'high', description: 'WiFi signal is extremely weak, cannot attend online classes.' },
    { title: 'Room Door Lock Broken', category: 'other', priority: 'high', description: 'The door lock is jammed and cannot be opened from outside.' },
    { title: 'Bathroom Tap Leaking', category: 'plumbing', priority: 'medium', description: 'The bathroom tap has been leaking for 3 days continuously.' },
    { title: 'Room Light Not Working', category: 'electrical', priority: 'low', description: 'The tube light in the room stopped working.' },
    { title: 'Bed Frame Broken', category: 'other', priority: 'medium', description: 'One leg of the bed frame is broken, very unstable.' },
    { title: 'Window Glass Cracked', category: 'other', priority: 'low', description: 'The window glass has a crack, wind enters during rains.' },
    { title: 'Almirah Door Not Closing', category: 'other', priority: 'low', description: 'The almirah hinge is broken, cannot lock my belongings.' },
    { title: 'No Hot Water in Morning', category: 'plumbing', priority: 'high', description: 'Geyser not working since last week.' },
    { title: 'Power Outlet Not Working', category: 'electrical', priority: 'medium', description: '2 power sockets in the room are dead.' },
  ];

  const issueStatuses = ['Open', 'Open', 'InProgress', 'InProgress', 'Resolved'];
  for (let i = 0; i < 60; i++) {
    const student = students[i % students.length];
    const baseComplaint = complaints[i % complaints.length];
    await prisma.hostelIssue.create({
      data: {
        title: baseComplaint.title,
        category: baseComplaint.category,
        priority: baseComplaint.priority,
        description: baseComplaint.description,
        studentId: student.id,
        studentName: student.name,
        hostelName: faker.helpers.arrayElement(hostels),
        roomNumber: `${student.departmentCode.charAt(0)}-${faker.number.int({ min: 101, max: 320 })}`,
        status: faker.helpers.arrayElement(issueStatuses),
        isEscalated: Math.random() > 0.85, // 15% chance of being escalated
        slaDeadline: daysAgo(faker.number.int({ min: -5, max: 5 })), // some past, some future
        createdAt: daysAgo(faker.number.int({ min: 0, max: 60 })),
        updatedAt: daysAgo(faker.number.int({ min: 0, max: 5 })),
      },
    });
  }

  // 9.4 Hostel Outpasses - 80 outpasses
  console.log('   Seeding Hostel Outpasses...');
  const outpassReasons = [
    'Going home for Diwali', 'Attending cousin\'s wedding', 'Medical emergency',
    'Shopping at Elante Mall', 'Visiting relatives in Mohali', 'Tech Fest at IIT Delhi',
    'Weekend trip home', 'Medical appointment at PGIMER', 'Family function in Ludhiana',
    'Attending interview in Chandigarh', 'Gurpurab celebrations', 'Emergency - Grandparent hospitalized',
  ];
  const destinations = ['Delhi', 'Chandigarh Sec-17', 'Elante Mall', 'Ludhiana', 'Ambala', 'Mohali', 'Patiala', 'Amritsar', 'Jalandhar'];
  const outpassStatuses = ['Pending', 'Approved', 'Approved', 'Approved', 'Rejected', 'Completed', 'Completed'];

  for (let i = 0; i < 80; i++) {
    const student = students[i % students.length];
    const daysOffset = faker.number.int({ min: -30, max: 15 });
    const departure = daysAgo(-daysOffset);
    const duration = faker.number.int({ min: 1, max: 4 });
    const returnDate = new Date(departure.getTime() + duration * 24 * 60 * 60 * 1000);
    const status = faker.helpers.arrayElement(outpassStatuses);

    await prisma.hostelOutpass.create({
      data: {
        studentId: student.id,
        studentName: student.name,
        hostelName: faker.helpers.arrayElement(hostels),
        roomNumber: `${student.departmentCode.charAt(0)}-${faker.number.int({ min: 101, max: 320 })}`,
        reason: faker.helpers.arrayElement(outpassReasons),
        destination: faker.helpers.arrayElement(destinations),
        departureDate: departure,
        returnDate,
        status,
        qrCode: status === 'Approved' ? `QR-${student.id.substring(0, 8)}-${i}` : null,
      },
    });
  }
}

