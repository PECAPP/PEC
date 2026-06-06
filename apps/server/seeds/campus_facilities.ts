import { prisma, daysAgo } from './utils';
import { StudentSeed } from './data';

export async function seedCampusFacilities(students: StudentSeed[]) {
  console.log('--- Seeding Campus Facilities (Canteen & Hostel) ---');

  // 9.1 Canteen Items
  const canteenItems = [
    {
      name: 'Veg Cheese Maggi',
      category: 'snacks',
      price: 45,
      isAvailable: true,
    },
    {
      name: 'Schezwan Noodles',
      category: 'snacks',
      price: 50,
      isAvailable: true,
    },
    {
      name: 'Cold Coffee',
      category: 'beverages',
      price: 30,
      isAvailable: true,
    },
    { name: 'Ice Tea', category: 'beverages', price: 25, isAvailable: true },
    { name: 'Paneer Puff', category: 'snacks', price: 20, isAvailable: true },
    { name: 'Samosa', category: 'snacks', price: 15, isAvailable: true },
  ];

  const prismaAny = prisma as any;

  for (const item of canteenItems) {
    await prismaAny.canteenItem.upsert({
      where: { name: item.name },
      update: item,
      create: item,
    });
  }

  // 9.2 Canteen Orders (Mock historical data)
  const items = await prismaAny.canteenItem.findMany();
  for (let i = 0; i < 15; i++) {
    const student = students[i % students.length];
    const orderItems = items.slice(0, 2).map((item: any) => ({
      itemId: item.id,
      name: item.name,
      quantity: 1,
      price: item.price,
    }));

    const totalAmount = orderItems.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0,
    );

    await prismaAny.canteenOrder.create({
      data: {
        studentId: student.id,
        studentName: student.name,
        hostelRoom: `H${(i % 5) + 1}, ${(i % 100) + 101}`,
        totalAmount,
        status: i % 5 === 0 ? 'Pending' : 'Delivered',
        timestamp: daysAgo(i % 5),
        items: {
          create: orderItems,
        },
      },
    });
  }

  // 9.3 Hostel Issues
  const complaints = [
    {
      title: 'Wi-Fi Signal Weak',
      category: 'internet',
      priority: 'medium',
      description: 'Signal strength is very low in room B-204.',
    },
    {
      title: 'Leaking Tap',
      category: 'plumbing',
      priority: 'high',
      description: 'Bathroom tap is constantly leaking.',
    },
    {
      title: 'Fan Making Noise',
      category: 'maintenance',
      priority: 'low',
      description: 'The ceiling fan is making a clicking sound.',
    },
  ];

  for (let i = 0; i < 10; i++) {
    const student = students[i % students.length];
    const baseComplaint = complaints[i % complaints.length];
    await prismaAny.hostelIssue.create({
      data: {
        category: baseComplaint.category,
        priority: baseComplaint.priority,
        description: `${baseComplaint.title}: ${baseComplaint.description}`,
        studentId: student.id,
        studentName: student.name,
        hostelName: `H${(i % 5) + 1}`,
        roomNumber: `${student.departmentCode.charAt(0)}-${201 + i}`,
        status: i % 3 === 0 ? 'Open' : i % 3 === 1 ? 'InProgress' : 'Resolved',
        createdAt: daysAgo(i),
        updatedAt: daysAgo(i % 2),
      },
    });
  }
}
