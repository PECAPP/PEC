import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
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

const booksData = [
  {
    title: 'Introduction to Algorithms',
    author: 'Thomas H. Cormen',
    isbn: '978-0-262-03384-8',
    category: 'Computer Science',
    totalCopies: 5,
    availableCopies: 3,
    publisher: 'MIT Press',
    year: 2009,
    location: 'Shelf A1',
    createdAt: new Date(),
  },
  {
    title: 'Data Structures and Algorithms',
    author: 'Alfred V. Aho',
    isbn: '978-0-201-61088-4',
    category: 'Computer Science',
    totalCopies: 4,
    availableCopies: 2,
    publisher: 'Addison-Wesley',
    year: 1983,
    location: 'Shelf A2',
    createdAt: new Date(),
  },
  {
    title: 'The C Programming Language',
    author: 'Brian W. Kernighan',
    isbn: '978-0-13-110362-7',
    category: 'Programming',
    totalCopies: 6,
    availableCopies: 4,
    publisher: 'Prentice Hall',
    year: 1988,
    location: 'Shelf B1',
    createdAt: new Date(),
  },
  {
    title: 'Operating System Concepts',
    author: 'Abraham Silberschatz',
    isbn: '978-1-118-06333-0',
    category: 'Computer Science',
    totalCopies: 5,
    availableCopies: 3,
    publisher: 'Wiley',
    year: 2012,
    location: 'Shelf C1',
    createdAt: new Date(),
  },
  {
    title: 'Database System Concepts',
    author: 'Abraham Silberschatz',
    isbn: '978-0-07-352332-3',
    category: 'Databases',
    totalCopies: 4,
    availableCopies: 2,
    publisher: 'McGraw-Hill',
    year: 2010,
    location: 'Shelf C2',
    createdAt: new Date(),
  },
  {
    title: 'Discrete Mathematics and Its Applications',
    author: 'Kenneth H. Rosen',
    isbn: '978-0-07-338309-5',
    category: 'Mathematics',
    totalCopies: 7,
    availableCopies: 5,
    publisher: 'McGraw-Hill',
    year: 2011,
    location: 'Shelf D1',
    createdAt: new Date(),
  },
  {
    title: 'Linear Algebra Done Right',
    author: 'Sheldon Axler',
    isbn: '978-3-319-11080-6',
    category: 'Mathematics',
    totalCopies: 3,
    availableCopies: 2,
    publisher: 'Springer',
    year: 2014,
    location: 'Shelf D2',
    createdAt: new Date(),
  },
  {
    title: 'Design Patterns',
    author: 'Gang of Four',
    isbn: '978-0-201-63361-0',
    category: 'Software Engineering',
    totalCopies: 5,
    availableCopies: 3,
    publisher: 'Addison-Wesley',
    year: 1994,
    location: 'Shelf E1',
    createdAt: new Date(),
  },
  {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    isbn: '978-0-13-235088-4',
    category: 'Software Engineering',
    totalCopies: 6,
    availableCopies: 4,
    publisher: 'Prentice Hall',
    year: 2008,
    location: 'Shelf E2',
    createdAt: new Date(),
  },
  {
    title: 'The Art of Computer Programming',
    author: 'Donald E. Knuth',
    isbn: '978-0-201-89683-1',
    category: 'Computer Science',
    totalCopies: 2,
    availableCopies: 1,
    publisher: 'Addison-Wesley',
    year: 1968,
    location: 'Shelf A3',
    createdAt: new Date(),
  },
  {
    title: 'Modern Operating Systems',
    author: 'Andrew S. Tanenbaum',
    isbn: '978-0-13-359162-0',
    category: 'Computer Science',
    totalCopies: 4,
    availableCopies: 3,
    publisher: 'Pearson',
    year: 2014,
    location: 'Shelf C3',
    createdAt: new Date(),
  },
  {
    title: 'Introduction to the Theory of Computation',
    author: 'Michael Sipser',
    isbn: '978-1-133-18779-0',
    category: 'Computer Science',
    totalCopies: 3,
    availableCopies: 2,
    publisher: 'Cengage Learning',
    year: 2012,
    location: 'Shelf F1',
    createdAt: new Date(),
  },
  {
    title: 'Compiler Design',
    author: 'Alfred V. Aho',
    isbn: '978-0-321-48681-3',
    category: 'Programming',
    totalCopies: 3,
    availableCopies: 2,
    publisher: 'Pearson',
    year: 2006,
    location: 'Shelf B2',
    createdAt: new Date(),
  },
  {
    title: 'Network Protocols Handbook',
    author: 'Denis Commenges',
    isbn: '978-1-926514-05-7',
    category: 'Networking',
    totalCopies: 4,
    availableCopies: 3,
    publisher: 'Tech Pro Research',
    year: 2011,
    location: 'Shelf G1',
    createdAt: new Date(),
  },
  {
    title: 'Advanced Java Programming',
    author: 'Herbert Schildt',
    isbn: '978-0-07-174178-4',
    category: 'Programming',
    totalCopies: 5,
    availableCopies: 3,
    publisher: 'McGraw-Hill',
    year: 2010,
    location: 'Shelf B3',
    createdAt: new Date(),
  },
];

async function seedLibraryBooks() {
  try {
    console.log('📚 Seeding library books...');
    let count = 0;

    for (const bookData of booksData) {
      await addDoc(collection(db, 'books'), bookData);
      count++;
    }

    console.log(`✅ Successfully seeded ${count} library books!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding library books:', error);
    process.exit(1);
  }
}

seedLibraryBooks();
