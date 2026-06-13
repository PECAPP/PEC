import { PrismaClient, User, Course } from '@prisma/client';
import { daysAgo, daysFromNow, sample } from './utils';
import { prisma } from './utils';

export async function seedUserContent(
  users: any[],
  students: any[],
  faculty: any[],
  courses: any[]
) {
  console.log('Seeding user content and preferences...');

  // 1. UserSettings (for all users)
  const allUsers = [...users, ...students, ...faculty];
  // Deduplicate by ID just in case
  const uniqueUsers = Array.from(new Map(allUsers.map((u) => [u.id, u])).values());

  await prisma.userSettings.createMany({
    data: uniqueUsers.map((u) => ({
      userId: u.id,
      theme: sample(['system', 'light', 'dark'], Math.floor(Math.random() * 100)),
      accentColor: 'pec-gold',
      emailNotifications: true,
      pushNotifications: true,
      locale: 'en',
      timezone: 'Asia/Kolkata',
    })),
    skipDuplicates: true,
  });

  // 2. Student Portfolios are already seeded in students.ts

  // 3. MarketplaceBookmark
  const listings = await prisma.marketplaceListing.findMany({ take: 20 });
  if (listings.length > 0) {
    for (const student of students.slice(0, 10)) { // 10 random students
      for (let i = 0; i < 2; i++) {
        await prisma.marketplaceBookmark.create({
          data: {
            userId: student.id,
            listingId: sample(listings, hash(student.id) + i).id,
          },
        }).catch(() => {}); // Ignore unique constraint errors
      }
    }
  }

  // 4. CanteenOrderItem
  const canteenOrders = await prisma.canteenOrder.findMany({ take: 20 });
  const canteenItems = await prisma.canteenItem.findMany();
  if (canteenOrders.length > 0 && canteenItems.length > 0) {
    for (const order of canteenOrders) {
      const numItems = 1 + (hash(order.id) % 3);
      for (let i = 0; i < numItems; i++) {
        const item = sample(canteenItems, hash(order.id) + i);
        await prisma.canteenOrderItem.create({
          data: {
            orderId: order.id,
            itemId: item.id,
            name: item.name,
            quantity: 1 + (hash(order.id + i) % 2),
            price: item.price,
          },
        });
      }
    }
  }

  // 5. HostelIssue
  const hostels = ['Vindhya Hostel', 'Aravali Hostel', 'Himalaya Hostel', 'Kurukshetra Hostel'];
  const categories = ['Plumbing', 'Electrical', 'Carpentry', 'Internet', 'Cleaning'];
  for (const student of students.slice(0, 20)) {
    await prisma.hostelIssue.create({
      data: {
        title: sample(["Broken fan", "Leaky tap", "Internet not working", "Window latch broken"], hash(student.id)),
        studentId: student.id,
        studentName: student.name,
        hostelName: sample(hostels, hash(student.id)),
        roomNumber: `Room ${100 + (hash(student.id) % 100)}`,
        category: sample(categories, hash(student.id)),
        description: "Please fix this as soon as possible.",
        status: sample(["Open", "In Progress", "Resolved"], hash(student.id)),
        priority: sample(["Low", "Medium", "High"], hash(student.id)),
      },
    });
  }

  // 6. HostelOutpass
  for (const student of students.slice(0, 20)) {
    await prisma.hostelOutpass.create({
      data: {
        studentId: student.id,
        studentName: student.name,
        hostelName: sample(hostels, hash(student.id)),
        roomNumber: `Room ${100 + (hash(student.id) % 100)}`,
        reason: sample(["Going home for weekend", "Medical emergency", "Family function", "Local guardian visit"], hash(student.id)),
        destination: "Hometown",
        departureDate: daysFromNow(1),
        returnDate: daysFromNow(3),
        status: sample(["Pending", "Approved", "Rejected", "Completed"], hash(student.id)),
      },
    });
  }
}

function hash(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return Math.abs(hash);
}
