import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/pec',
    },
  },
});

async function main() {
  console.log('Seeding database with mock data...');

  // Create Departments
  const departments = [];
  for (let i = 0; i < 5; i++) {
    departments.push(await prisma.department.upsert({
      where: { code: `DEPT-${i}` },
      update: {},
      create: {
        code: `DEPT-${i}`,
        name: faker.commerce.department() + ' ' + faker.string.alphanumeric(4),
        description: faker.lorem.sentence(),
      }
    }));
  }
  console.log(`Created ${departments.length} departments.`);

  // Create Courses
  const courses = [];
  for (let i = 0; i < 20; i++) {
    courses.push(await prisma.course.upsert({
      where: { code: `CS${100 + i}` },
      update: {},
      create: {
        code: `CS${100 + i}`,
        name: faker.company.catchPhrase(),
        credits: faker.number.int({ min: 1, max: 4 }),
        instructor: faker.person.fullName(),
        department: departments[i % departments.length].name,
        semester: faker.number.int({ min: 1, max: 8 }),
        status: 'active',
        capacity: faker.number.int({ min: 30, max: 100 })
      }
    }));
  }
  console.log(`Created ${courses.length} courses.`);

  // Create Students
  console.log('Creating 100 fake students (this might take a few seconds)...');
  for (let i = 0; i < 100; i++) {
    const student = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        name: faker.person.fullName(),
        profileComplete: true,
        studentProfile: {
          create: {
            enrollmentNumber: `ENR-${faker.string.numeric(6)}`,
            department: departments[i % departments.length].name,
            semester: faker.number.int({ min: 1, max: 8 }),
            phone: faker.phone.number({ style: 'international' }),
          }
        }
      }
    });

    // Enroll in random courses
    for (let j = 0; j < 3; j++) {
      const course = courses[faker.number.int({ min: 0, max: courses.length - 1 })];
      
      // Prevent duplicate enrollments
      const existing = await prisma.enrollment.findUnique({
        where: { studentId_courseId: { studentId: student.id, courseId: course.id } }
      });

      if (!existing) {
        await prisma.enrollment.create({
          data: {
            studentId: student.id,
            courseId: course.id,
            courseName: course.name,
            courseCode: course.code,
            semester: course.semester
          }
        });
      }
    }
  }

  // Seed Marketplace Listings (Indian Style)
  console.log('Seeding Marketplace Listings...');
  const marketplaceCategories = ['Electronics', 'Books', 'Furniture', 'Cycles', 'Stationery', 'Other'];
  const indianItems = [
    { title: 'Hero Sprint Cycle 21 Gear', price: 3500, category: 'Cycles' },
    { title: 'RD Sharma Class 12 Math Book', price: 400, category: 'Books' },
    { title: 'Casio Scientific Calculator fx-991EX', price: 850, category: 'Electronics' },
    { title: 'Nilkamal Study Chair', price: 600, category: 'Furniture' },
    { title: 'Engineering Drawing Board (Full Size)', price: 300, category: 'Stationery' },
    { title: 'Drafter with Cover', price: 150, category: 'Stationery' },
    { title: 'Used Laptop Table - Wood', price: 500, category: 'Furniture' },
    { title: 'Noise Smartwatch', price: 1200, category: 'Electronics' },
    { title: 'Physics HC Verma Vol 1 & 2', price: 450, category: 'Books' },
    { title: 'Milton Thermosteel Water Bottle 1L', price: 300, category: 'Other' },
  ];

  const allStudents = await prisma.user.findMany({ select: { id: true, name: true } });
  if (allStudents.length > 0) {
    for (const item of indianItems) {
      const seller = allStudents[faker.number.int({ min: 0, max: allStudents.length - 1 })];
      await prisma.marketplaceListing.create({
        data: {
          title: item.title,
          description: faker.lorem.paragraph(),
          price: item.price,
          category: item.category,
          condition: faker.helpers.arrayElement(['New', 'Like New', 'Good', 'Fair']),
          status: faker.helpers.arrayElement(['Available', 'Available', 'Available', 'Sold']),
          sellerId: seller.id,
          images: [`https://placehold.co/600x400/f3f4f6/9ca3af?text=${encodeURIComponent(item.category)}`],
        }
      });
    }
  }

  // Seed Hostel Issues
  console.log('Seeding Hostel Issues...');
  const issueTitles = ['Ceiling fan making loud noise', 'Water cooler on 2nd floor not cooling', 'Internet router blinking red', 'Bathroom tap leaking continuously', 'Window glass cracked'];
  const categories = ['electrical', 'plumbing', 'internet', 'maintenance', 'hvac'];
  
  if (allStudents.length > 0) {
    for (let i = 0; i < 15; i++) {
      const student = allStudents[faker.number.int({ min: 0, max: allStudents.length - 1 })];
      const category = faker.helpers.arrayElement(categories);
      await prisma.hostelIssue.create({
        data: {
          title: faker.helpers.arrayElement(issueTitles),
          studentId: student.id,
          studentName: student.name,
          hostelName: faker.helpers.arrayElement(['Shivalik Hostel', 'Kurukshetra Hostel', 'Aravalli Hostel', 'Vindhya Hostel']),
          roomNumber: `${faker.helpers.arrayElement(['A', 'B', 'C'])}-${faker.number.int({ min: 101, max: 405 })}`,
          category: category,
          description: faker.lorem.sentences(2),
          status: faker.helpers.arrayElement(['Open', 'In_Progress', 'Resolved', 'Closed']),
          priority: faker.helpers.arrayElement(['Low', 'Medium', 'High', 'Emergency']),
          isEscalated: faker.datatype.boolean({ probability: 0.2 }),
        }
      });
    }
  }

  // Seed Hostel Outpasses
  console.log('Seeding Hostel Outpasses...');
  if (allStudents.length > 0) {
    for (let i = 0; i < 15; i++) {
      const student = allStudents[faker.number.int({ min: 0, max: allStudents.length - 1 })];
      const departure = faker.date.soon({ days: 3 });
      const returnDate = new Date(departure.getTime() + faker.number.int({ min: 2, max: 12 }) * 60 * 60 * 1000);
      const isApproved = faker.datatype.boolean();
      
      await prisma.hostelOutpass.create({
        data: {
          studentId: student.id,
          studentName: student.name,
          hostelName: faker.helpers.arrayElement(['Shivalik Hostel', 'Kurukshetra Hostel']),
          roomNumber: `${faker.helpers.arrayElement(['A', 'B', 'C'])}-${faker.number.int({ min: 101, max: 405 })}`,
          reason: faker.helpers.arrayElement(['Going home for weekend', 'Family function', 'Medical emergency', 'Shopping at Elante Mall', 'Dinner in Sector 17']),
          destination: faker.helpers.arrayElement(['Delhi', 'Chandigarh Sec-17', 'Elante Mall', 'Ludhiana', 'Ambala']),
          departureDate: departure,
          returnDate: returnDate,
          status: isApproved ? 'Approved' : faker.helpers.arrayElement(['Pending', 'Rejected']),
          qrCode: isApproved ? faker.string.uuid() : null,
        }
      });
    }
  }

  // Seed Resume & Portfolio
  console.log('Seeding Student Portfolios & Resumes...');
  for (const student of allStudents.slice(0, 30)) {
    await prisma.resumeProfile.create({
      data: {
        userId: student.id,
        personalInfo: { objective: faker.lorem.paragraph() },
        education: [{ degree: 'B.Tech', institution: 'PEC', year: 2026 }],
        experience: [{ role: 'Intern', company: faker.company.name(), duration: '3 months' }],
        skills: { achievements: [faker.company.catchPhrase()] }
      }
    });

    await prisma.studentSkill.create({
      data: {
        studentId: student.id,
        name: faker.helpers.arrayElement(['React', 'Node.js', 'Python', 'C++', 'Java', 'Figma', 'AWS']),
        level: faker.number.int({ min: 10, max: 100 }),
        category: 'technical',
      }
    });

    await prisma.studentProject.create({
      data: {
        studentId: student.id,
        title: faker.company.catchPhrase(),
        description: faker.lorem.sentences(2),
        techStack: `${faker.lorem.word()}, ${faker.lorem.word()}`,
        githubUrl: `https://github.com/example/${faker.lorem.word()}`,
        liveUrl: faker.internet.url(),
        isFeatured: faker.datatype.boolean(),
      }
    });
  }

  // Seed Faculty Profiles & Achievements
  console.log('Seeding Faculty Profiles...');
  const facultyUsers = await prisma.user.findMany({
    where: { role: { in: ['admin', 'faculty'] } } // Assume some are admins or faculty
  });
  
  // If no faculty exist, let's create a few explicitly
  const facultyToSeed = facultyUsers.length > 0 ? facultyUsers.slice(0, 5) : [];
  if (facultyToSeed.length === 0) {
    for(let i = 0; i < 5; i++) {
      const newFaculty = await prisma.user.create({
        data: {
          email: `faculty${i}@pec.edu.in`,
          name: faker.person.fullName(),
          role: 'faculty',
          profileComplete: true,
        }
      });
      facultyToSeed.push(newFaculty);
    }
  }

  for (const faculty of facultyToSeed) {
    // Upsert to handle existing profiles safely
    await prisma.facultyProfile.upsert({
      where: { userId: faculty.id },
      update: {},
      create: {
        userId: faculty.id,
        employeeId: `EMP-${faker.string.numeric(5)}`,
        department: faker.helpers.arrayElement(['Computer Science', 'Electrical', 'Mechanical', 'Civil']),
        designation: faker.helpers.arrayElement(['Professor', 'Assistant Professor', 'Associate Professor', 'HOD']),
        phone: faker.phone.number({ style: 'international' }),
        specialization: faker.helpers.arrayElement(['Artificial Intelligence', 'Machine Learning', 'Data Science', 'Cyber Security']),
        qualifications: 'Ph.D. in Computer Science',
        bio: faker.lorem.paragraphs(2),
      }
    });

    // Seed Publications
    for(let i=0; i<3; i++) {
      await prisma.facultyPublication.create({
        data: {
          facultyId: faculty.id,
          title: faker.company.catchPhrase(),
          coAuthors: `${faculty.name}, ${faker.person.fullName()}`,
          journal: faker.company.name() + ' Journal of Tech',
          year: faker.number.int({ min: 2015, max: 2024 }),
          url: faker.internet.url(),
          citations: faker.number.int({ min: 0, max: 500 }),
        }
      });
    }

    // Seed Awards
    for(let i=0; i<2; i++) {
      await prisma.facultyAward.create({
        data: {
          facultyId: faculty.id,
          title: faker.company.catchPhrase() + ' Award',
          awardedBy: faker.company.name(),
          year: faker.number.int({ min: 2010, max: 2024 }),
          description: faker.lorem.sentence(),
        }
      });
    }

    // Seed Conferences
    for(let i=0; i<2; i++) {
      await prisma.facultyConference.create({
        data: {
          facultyId: faculty.id,
          name: faker.company.catchPhrase() + ' Summit',
          role: faker.helpers.arrayElement(['Speaker', 'Organizer', 'Attendee']),
          location: faker.location.city(),
          startDate: faker.date.past(),
          endDate: faker.date.recent(),
        }
      });
    }

    // Seed Consultations
    for(let i=0; i<1; i++) {
      await prisma.facultyConsultation.create({
        data: {
          facultyId: faculty.id,
          organization: faker.company.name(),
          description: faker.lorem.sentence(),
          startDate: faker.date.past(),
          status: 'completed',
        }
      });
    }
  }

  // Seed Marketplace Bookmarks
  console.log('Seeding Marketplace Bookmarks...');
  const allListings = await prisma.marketplaceListing.findMany({ select: { id: true } });
  if (allListings.length > 0 && allStudents.length > 0) {
    for (const student of allStudents.slice(0, 20)) {
      await prisma.marketplaceBookmark.create({
        data: {
          userId: student.id,
          listingId: faker.helpers.arrayElement(allListings).id,
        }
      });
    }
  }

  // Seed Canteen System
  console.log('Seeding Canteen Items & Orders...');
  const canteenItems = [
    { name: 'Aloo Paratha', price: 30, category: 'Breakfast', isAvailable: true, vegetarian: true },
    { name: 'Maggi', price: 25, category: 'Snacks', isAvailable: true, vegetarian: true },
    { name: 'Cold Coffee', price: 40, category: 'Beverages', isAvailable: true, vegetarian: true },
    { name: 'Chicken Roll', price: 60, category: 'Snacks', isAvailable: true, vegetarian: false },
    { name: 'Masala Dosa', price: 50, category: 'Breakfast', isAvailable: true, vegetarian: true },
  ];

  const dbCanteenItems = [];
  for (const item of canteenItems) {
    dbCanteenItems.push(await prisma.canteenItem.create({
      data: { ...item, description: faker.lorem.sentence() }
    }));
  }

  if (allStudents.length > 0) {
    for (let i = 0; i < 20; i++) {
      const student = allStudents[faker.number.int({ min: 0, max: allStudents.length - 1 })];
      const itemsToOrder = faker.helpers.arrayElements(dbCanteenItems, faker.number.int({ min: 1, max: 3 }));
      const totalAmount = itemsToOrder.reduce((sum, item) => sum + item.price, 0);

      const order = await prisma.canteenOrder.create({
        data: {
          studentId: student.id,
          studentName: student.name,
          hostelRoom: 'Shivalik A-102',
          totalAmount: totalAmount,
          status: faker.helpers.arrayElement(['Pending', 'Preparing', 'Ready', 'Completed']),
        }
      });

      for (const item of itemsToOrder) {
        await prisma.canteenOrderItem.create({
          data: {
            orderId: order.id,
            itemId: item.id,
            name: item.name,
            quantity: faker.number.int({ min: 1, max: 2 }),
            price: item.price,
          }
        });
      }
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
