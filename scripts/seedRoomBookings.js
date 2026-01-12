import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
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

const roomTemplates = [
  {
    name: 'SH-A201',
    type: 'Seminar Hall',
    capacity: 100,
    location: 'Building A, Floor 2',
    amenities: ['Projector', 'Whiteboard', 'Audio System'],
  },
  {
    name: 'CR-B301',
    type: 'Conference Room',
    capacity: 30,
    location: 'Building B, Floor 3',
    amenities: ['Video Conference', 'Projector'],
  },
  {
    name: 'MR-C101',
    type: 'Meeting Room',
    capacity: 20,
    location: 'Building C, Floor 1',
    amenities: ['Whiteboard', 'Coffee Machine'],
  },
  {
    name: 'LH-A101',
    type: 'Lecture Hall',
    capacity: 150,
    location: 'Building A, Floor 1',
    amenities: ['Projector', 'Microphone', 'Audio System'],
  },
  {
    name: 'SR-L201',
    type: 'Study Room',
    capacity: 15,
    location: 'Library, Floor 2',
    amenities: ['Whiteboard', 'WiFi'],
  },
  {
    name: 'WS-D101',
    type: 'Workshop Space',
    capacity: 50,
    location: 'Building D, Floor 1',
    amenities: ['Tools', 'Workbenches', 'Safety Equipment'],
  },
];

const purposeOptions = [
  'Departmental Meeting',
  'Project Presentation',
  'Student Workshop',
  'Faculty Seminar',
  'Career Fair Setup',
  'Interview Rounds',
  'Club Meeting',
  'Class Session',
  'Research Discussion',
  'Committee Meeting',
];

// Helper to shuffle array
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

// Generate random time slots
function getRandomTimeSlot() {
  const hours = [9, 10, 11, 12, 14, 15, 16, 17];
  const startHour = hours[Math.floor(Math.random() * hours.length)];
  const endHour = Math.min(startHour + 1 + Math.floor(Math.random() * 2), 18);
  return {
    start: `${String(startHour).padStart(2, '0')}:00`,
    end: `${String(endHour).padStart(2, '0')}:00`,
  };
}

async function seedRoomBookings() {
  try {
    console.log('🔍 Fetching existing users...');

    // Fetch faculty users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const facultyUsers = usersSnapshot.docs
      .map((doc) => ({ uid: doc.id, ...doc.data() }))
      .filter((u) => u.role === 'faculty' || u.role === 'college_admin');

    console.log(`👨‍🏫 Found ${facultyUsers.length} faculty/admin users`);

    if (facultyUsers.length === 0) {
      console.error('❌ No faculty users found. Please seed users first!');
      process.exit(1);
    }

    // Create rooms
    console.log('🏢 Creating rooms...');
    const roomDocs = [];

    for (const roomTemplate of roomTemplates) {
      const roomData = {
        ...roomTemplate,
        createdAt: getPastDate(Math.floor(Math.random() * 180)),
        updatedAt: new Date(),
      };

      const roomRef = await addDoc(collection(db, 'rooms'), roomData);
      roomDocs.push({ id: roomRef.id, ref: roomRef, data: roomData });
    }

    console.log(`✅ Created ${roomDocs.length} rooms`);

    // Create room bookings (sparse - less common than clubs)
    console.log('📅 Creating room bookings...');

    // Create past bookings (completed) - less frequent
    const bookingsPerRoom = 3; // fewer past bookings
    for (const room of roomDocs) {
      for (let i = 0; i < bookingsPerRoom; i++) {
        const bookedBy = facultyUsers[Math.floor(Math.random() * facultyUsers.length)];
        const bookingDate = getPastDate(Math.floor(Math.random() * 90) + 1);
        const timeSlot = getRandomTimeSlot();

        const bookingData = {
          roomId: room.id,
          bookedBy: bookedBy.uid,
          date: bookingDate.toISOString().split('T')[0],
          startTime: timeSlot.start,
          endTime: timeSlot.end,
          purpose: purposeOptions[Math.floor(Math.random() * purposeOptions.length)],
          status: Math.random() < 0.8 ? 'approved' : 'completed', // 80% approved, 20% completed
          attendees: Math.floor(Math.random() * room.data.capacity * 0.7) + 5,
          createdAt: getPastDate(Math.floor(Math.random() * 30) + bookingDate.getDate()),
          updatedAt: new Date(),
        };

        await addDoc(collection(db, 'roomBookings'), bookingData);
      }
    }

    // Create future bookings (pending/approved) - much less frequent
    const futureBookingsPerRoom = 2;
    for (const room of roomDocs) {
      for (let i = 0; i < futureBookingsPerRoom; i++) {
        const bookedBy = facultyUsers[Math.floor(Math.random() * facultyUsers.length)];
        const bookingDate = getFutureDate(Math.floor(Math.random() * 45) + 1);
        const timeSlot = getRandomTimeSlot();

        const bookingData = {
          roomId: room.id,
          bookedBy: bookedBy.uid,
          date: bookingDate.toISOString().split('T')[0],
          startTime: timeSlot.start,
          endTime: timeSlot.end,
          purpose: purposeOptions[Math.floor(Math.random() * purposeOptions.length)],
          status: Math.random() < 0.6 ? 'pending' : 'approved', // 60% pending, 40% approved
          attendees: Math.floor(Math.random() * room.data.capacity * 0.6) + 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await addDoc(collection(db, 'roomBookings'), bookingData);
      }
    }

    console.log(`✅ Created ${roomDocs.length * (bookingsPerRoom + futureBookingsPerRoom)} room bookings`);

    console.log('\n✨ Room booking seeding completed successfully!');
    console.log(`   - ${roomDocs.length} rooms created`);
    console.log(`   - ${roomDocs.length * bookingsPerRoom} past bookings (completed/approved)`);
    console.log(`   - ${roomDocs.length * futureBookingsPerRoom} future bookings (pending/approved)`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding room bookings:', error);
    process.exit(1);
  }
}

seedRoomBookings();
