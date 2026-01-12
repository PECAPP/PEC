import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  orderBy,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCcsupbQB5vNlZGfTFXUxq5q7SKBry5ntM",
  authDomain: "omniflow-8933a.firebaseapp.com",
  projectId: "omniflow-8933a",
  storageBucket: "omniflow-8933a.firebasestorage.app",
  messagingSenderId: "250987767866",
  appId: "1:250987767866:web:a746b33b2eea130a772d03",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const clubTemplates = [
  {
    name: 'Coding Club',
    description: 'Learn programming, competitive coding, and software development',
    category: 'Technology',
    logo: 'https://via.placeholder.com/200?text=Coding+Club',
  },
  {
    name: 'Photography Club',
    description: 'Explore photography, videography, and visual storytelling',
    category: 'Arts',
    logo: 'https://via.placeholder.com/200?text=Photography+Club',
  },
  {
    name: 'Sports Club',
    description: 'Sports enthusiasts unite for cricket, football, badminton, and more',
    category: 'Sports',
    logo: 'https://via.placeholder.com/200?text=Sports+Club',
  },
  {
    name: 'Debate Society',
    description: 'Participate in debates, public speaking, and critical thinking',
    category: 'Arts',
    logo: 'https://via.placeholder.com/200?text=Debate+Society',
  },
  {
    name: 'Music Club',
    description: 'Sing, play instruments, and celebrate music together',
    category: 'Arts',
    logo: 'https://via.placeholder.com/200?text=Music+Club',
  },
  {
    name: 'Entrepreneurship Club',
    description: 'Build startups, learn business skills, and network with entrepreneurs',
    category: 'Business',
    logo: 'https://via.placeholder.com/200?text=Entrepreneurship+Club',
  },
  {
    name: 'Environmental Club',
    description: 'Promote sustainability and environmental awareness on campus',
    category: 'Social',
    logo: 'https://via.placeholder.com/200?text=Environmental+Club',
  },
  {
    name: 'Drama Club',
    description: 'Act in plays, perform skits, and explore theatrical arts',
    category: 'Arts',
    logo: 'https://via.placeholder.com/200?text=Drama+Club',
  },
  {
    name: 'Science Club',
    description: 'Conduct experiments, science talks, and STEM activities',
    category: 'Technology',
    logo: 'https://via.placeholder.com/200?text=Science+Club',
  },
  {
    name: 'Cultural Club',
    description: 'Celebrate diverse cultures, traditions, and heritage',
    category: 'Social',
    logo: 'https://via.placeholder.com/200?text=Cultural+Club',
  },
];

const eventTemplates = [
  {
    title: 'Coding Marathon',
    description: '12-hour coding competition with exciting prizes',
    baseDate: 15,
    time: '09:00 AM',
    location: 'Computer Lab',
  },
  {
    title: 'Photography Walk',
    description: 'Campus photography session capturing moments',
    baseDate: 20,
    time: '04:00 PM',
    location: 'Campus Grounds',
  },
  {
    title: 'Football Match',
    description: 'Inter-club friendly football tournament',
    baseDate: 22,
    time: '03:30 PM',
    location: 'Sports Ground',
  },
  {
    title: 'Debate Competition',
    description: 'National level debate competition',
    baseDate: 25,
    time: '10:00 AM',
    location: 'Auditorium',
  },
  {
    title: 'Music Concert',
    description: 'Showcase of musical talents from the college',
    baseDate: 28,
    time: '07:00 PM',
    location: 'Auditorium',
  },
  {
    title: 'Workshop & Training',
    description: 'Skills and professional development session',
    baseDate: 18,
    time: '02:00 PM',
    location: 'Meeting Room',
  },
  {
    title: 'Club Meetup',
    description: 'Regular gathering of club members',
    baseDate: 10,
    time: '05:00 PM',
    location: 'Cafeteria',
  },
];

// Helper function to shuffle array
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Helper to generate past date
function getPastDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
}

// Helper to generate future date
function getFutureDate(daysAhead) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date;
}

async function seedClubs() {
  try {
    console.log('🔍 Fetching existing users...');

    // Fetch all users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const allUsers = usersSnapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    }));

    // Separate users by role
    const facultyUsers = allUsers.filter((u) => u.role === 'faculty');
    const studentUsers = allUsers.filter((u) => u.role === 'student');

    console.log(`📊 Found ${allUsers.length} users (${facultyUsers.length} faculty, ${studentUsers.length} students)`);

    if (allUsers.length === 0) {
      console.error('❌ No users found in database. Please seed users first!');
      process.exit(1);
    }

    // Create clubs with random faculty presidents
    console.log('📚 Creating clubs...');
    const clubDocs = [];

    for (const clubTemplate of clubTemplates) {
      const president = facultyUsers[Math.floor(Math.random() * facultyUsers.length)];
      const vicePresident = shuffle(allUsers.filter((u) => u.uid !== president.uid))[0];

      const clubData = {
        ...clubTemplate,
        president: president.uid,
        vice_president: vicePresident.uid,
        members: [president.uid],
        totalMembers: 1,
        createdAt: getPastDate(Math.floor(Math.random() * 180)),
        updatedAt: new Date(),
      };

      const clubRef = await addDoc(collection(db, 'clubs'), clubData);
      clubDocs.push({ id: clubRef.id, ref: clubRef, data: clubData });
    }

    console.log(`✅ Created ${clubDocs.length} clubs`);

    // Assign members to clubs (1-3 clubs per student/faculty)
    console.log('👥 Assigning members to clubs...');

    for (const user of allUsers) {
      const numClubs = Math.floor(Math.random() * 3) + 1; // 1-3 clubs
      const assignedClubs = shuffle(clubDocs).slice(0, numClubs);

      for (const club of assignedClubs) {
        if (!club.data.members.includes(user.uid)) {
          club.data.members.push(user.uid);
        }
      }
    }

    // Update clubs with members
    console.log('📝 Updating clubs with members...');

    for (const club of clubDocs) {
      const memberCount = club.data.members.length;
      await updateDoc(doc(db, 'clubs', club.id), {
        members: club.data.members,
        totalMembers: memberCount,
        updatedAt: new Date(),
      });
    }

    console.log(`✅ Updated ${clubDocs.length} clubs with members`);

    // Create past and future events for each club
    console.log('📅 Creating club events...');

    for (const club of clubDocs) {
      const numEvents = Math.floor(Math.random() * 4) + 2; // 2-5 events per club
      const selectedTemplates = shuffle(eventTemplates).slice(0, numEvents);

      for (const eventTemplate of selectedTemplates) {
        // Mix of past (70% chance) and future events (30% chance)
        const isPastEvent = Math.random() < 0.7;
        const eventDate = isPastEvent
          ? getPastDate(Math.floor(Math.random() * 60) + 1)
          : getFutureDate(Math.floor(Math.random() * 60) + 1);

        // For past events, randomly select attendees
        let attendees = [];
        if (isPastEvent && club.data.members.length > 0) {
          const attendanceRate = Math.random() * 0.7 + 0.3; // 30-100% attendance
          const numAttendees = Math.floor(club.data.members.length * attendanceRate);
          attendees = shuffle(club.data.members).slice(0, numAttendees);
        }

        const eventData = {
          clubId: club.id,
          title: eventTemplate.title,
          description: eventTemplate.description,
          date: eventDate.toISOString().split('T')[0],
          time: eventTemplate.time,
          location: eventTemplate.location,
          attendees: attendees,
          createdAt: isPastEvent
            ? getPastDate(Math.floor(Math.random() * 30))
            : new Date(),
          completed: isPastEvent,
        };

        await addDoc(collection(db, 'clubEvents'), eventData);
      }
    }

    console.log(`✅ Created events for all clubs`);

    console.log('\n✨ Clubs seeding completed successfully!');
    console.log(`   - ${clubDocs.length} clubs created`);
    console.log(`   - ${allUsers.length} users assigned to clubs`);
    console.log(`   - Multiple past and future events created`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding clubs:', error);
    process.exit(1);
  }
}

seedClubs();
