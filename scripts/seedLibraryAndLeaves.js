import { db } from '../src/config/firebase.ts';
import { collection, writeBatch, doc } from 'firebase/firestore';

const books = [
  {
    title: 'Data Structures and Algorithms',
    author: 'Thomas H. Cormen',
    isbn: '978-0262033848',
    category: 'Computer Science',
    totalCopies: 5,
    availableCopies: 4,
    location: 'Shelf A1',
    publisher: 'MIT Press',
    year: 2009,
  },
  {
    title: 'Design Patterns',
    author: 'Gang of Four',
    isbn: '978-0201633610',
    category: 'Computer Science',
    totalCopies: 3,
    availableCopies: 2,
    location: 'Shelf A2',
    publisher: 'Addison-Wesley',
    year: 1994,
  },
  {
    title: 'The C Programming Language',
    author: 'Brian W. Kernighan, Dennis M. Ritchie',
    isbn: '978-0131103627',
    category: 'Programming',
    totalCopies: 4,
    availableCopies: 3,
    location: 'Shelf B1',
    publisher: 'Prentice Hall',
    year: 1988,
  },
  {
    title: 'Operating System Concepts',
    author: 'Abraham Silberschatz',
    isbn: '978-1118063330',
    category: 'Computer Science',
    totalCopies: 4,
    availableCopies: 2,
    location: 'Shelf A3',
    publisher: 'Wiley',
    year: 2012,
  },
  {
    title: 'Introduction to Algorithms',
    author: 'Thomas H. Cormen',
    isbn: '978-0262033848',
    category: 'Computer Science',
    totalCopies: 6,
    availableCopies: 5,
    location: 'Shelf A4',
    publisher: 'MIT Press',
    year: 2009,
  },
  {
    title: 'Database System Concepts',
    author: 'Abraham Silberschatz',
    isbn: '978-0078022159',
    category: 'Database',
    totalCopies: 4,
    availableCopies: 3,
    location: 'Shelf C1',
    publisher: 'McGraw-Hill',
    year: 2010,
  },
  {
    title: 'Web Design with HTML, CSS, JavaScript',
    author: 'Jon Duckett',
    isbn: '978-1118008188',
    category: 'Web Development',
    totalCopies: 3,
    availableCopies: 2,
    location: 'Shelf D1',
    publisher: 'Wiley',
    year: 2011,
  },
  {
    title: 'JavaScript: The Good Parts',
    author: 'Douglas Crockford',
    isbn: '978-0596517748',
    category: 'Programming',
    totalCopies: 3,
    availableCopies: 1,
    location: 'Shelf D2',
    publisher: 'O\'Reilly',
    year: 2008,
  },
];

const leaveTypes = [
  {
    name: 'Casual Leave',
    defaultDays: 10,
    description: 'General leave for any reason',
  },
  {
    name: 'Sick Leave',
    defaultDays: 8,
    description: 'Leave for health reasons',
  },
  {
    name: 'Earned Leave',
    defaultDays: 20,
    description: 'Annual leave based on tenure',
  },
  {
    name: 'Maternity Leave',
    defaultDays: 180,
    description: 'Leave for maternity purposes',
  },
  {
    name: 'Paternity Leave',
    defaultDays: 15,
    description: 'Leave for paternity purposes',
  },
];

async function seedLibrary() {
  try {
    console.log('Starting library seed...');
    const batch = writeBatch(db);
    const booksRef = collection(db, 'books');

    for (const book of books) {
      const docRef = doc(booksRef);
      batch.set(docRef, {
        ...book,
        createdAt: new Date(),
      });
    }

    await batch.commit();
    console.log(`✓ ${books.length} books seeded successfully`);
  } catch (error) {
    console.error('Error seeding library:', error);
  }
}

async function seedLeaveTypes() {
  try {
    console.log('Starting leave types seed...');
    const batch = writeBatch(db);
    const leaveTypesRef = collection(db, 'leaveTypes');

    for (const leaveType of leaveTypes) {
      const docRef = doc(leaveTypesRef);
      batch.set(docRef, {
        ...leaveType,
        createdAt: new Date(),
      });
    }

    await batch.commit();
    console.log(`✓ ${leaveTypes.length} leave types seeded successfully`);
  } catch (error) {
    console.error('Error seeding leave types:', error);
  }
}

async function runSeeds() {
  await seedLibrary();
  await seedLeaveTypes();
  console.log('✓ All seeds completed!');
}

runSeeds();
