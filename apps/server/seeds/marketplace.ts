import { prisma, daysAgo } from './utils';
import type { StudentSeed } from './data';

// ─── Realistic dummy listings ─────────────────────────────────────────────────

const DUMMY_LISTINGS = [
  // Books
  {
    title: 'Engineering Mathematics by B.S. Grewal',
    description: 'Classic maths textbook covering calculus, linear algebra, and differential equations. Minor pencil marks in some chapters, overall very good condition.',
    price: 220,
    category: 'Books',
    condition: 'Good',
    images: [
      'https://images-na.ssl-images-amazon.com/images/I/51bBM0HXKBL._SX384_BO1,204,203,200_.jpg',
    ],
  },
  {
    title: 'Data Structures and Algorithms – Cormen (CLRS)',
    description: 'Introduction to Algorithms, 3rd Edition. No highlights, clean copy. Perfect for placements.',
    price: 450,
    category: 'Books',
    condition: 'Like New',
    images: [
      'https://images-na.ssl-images-amazon.com/images/I/41T0iBxY8FL._SX440_BO1,204,203,200_.jpg',
    ],
  },
  {
    title: 'Digital Electronics by Morris Mano',
    description: 'Used for ECE 3rd sem. A few pages have sticky notes. Selling at half price.',
    price: 130,
    category: 'Books',
    condition: 'Used',
    images: [
      'https://images-na.ssl-images-amazon.com/images/I/51nHJHSxELL._SX382_BO1,204,203,200_.jpg',
    ],
  },
  {
    title: 'Operating Systems Concepts – Silberschatz (Dinosaur Book)',
    description: '10th Edition, purchased last year. Excellent condition, no marks.',
    price: 350,
    category: 'Books',
    condition: 'Like New',
    images: [
      'https://images-na.ssl-images-amazon.com/images/I/51Qy2upM+aL._SX440_BO1,204,203,200_.jpg',
    ],
  },
  {
    title: 'HC Verma – Concepts of Physics Part 1 & 2 (Set)',
    description: 'Both volumes in good condition. Some solved exercises marked. Great for JEE reference during exams.',
    price: 280,
    category: 'Books',
    condition: 'Good',
    images: [
      'https://images-na.ssl-images-amazon.com/images/I/41T0iBxY8FL._SX440_BO1,204,203,200_.jpg',
    ],
  },
  {
    title: 'Computer Networks – Tanenbaum (5th Edition)',
    description: 'Clean book, used for one semester. All chapters intact.',
    price: 300,
    category: 'Books',
    condition: 'Good',
    images: [],
  },

  // Electronics
  {
    title: 'Boat Airdopes 141 TWS Earbuds',
    description: 'Bought 4 months ago. Battery life still great (~5 hrs per charge). Comes with original case and cable. Reason: upgraded to wired.',
    price: 700,
    category: 'Electronics',
    condition: 'Like New',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop',
    ],
  },
  {
    title: 'Mi Portable Bluetooth Speaker (16W)',
    description: '1 year old, works perfectly. Some minor scratches on the bottom. Very loud for hostel use.',
    price: 900,
    category: 'Electronics',
    condition: 'Good',
    images: [
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop',
    ],
  },
  {
    title: 'Logitech M235 Wireless Mouse',
    description: 'Used for 2 semesters. Sensor works flawlessly. Battery included. Switching to trackpad.',
    price: 450,
    category: 'Electronics',
    condition: 'Good',
    images: [
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop',
    ],
  },
  {
    title: 'Portronics Breeze Desk Fan (USB-powered)',
    description: 'Small USB fan perfect for hostel desk. Works with laptop or power bank. Very quiet.',
    price: 250,
    category: 'Electronics',
    condition: 'Like New',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop',
    ],
  },
  {
    title: 'Arduino Uno R3 + Starter Kit',
    description: 'Includes breadboard, jumper wires, LEDs, resistors, sensors. Used for one mini-project. All components intact.',
    price: 650,
    category: 'Electronics',
    condition: 'Good',
    images: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop',
    ],
  },
  {
    title: 'TP-Link TL-WN722N USB WiFi Adapter',
    description: 'Supports monitor mode. Great for networking labs and ethical hacking practice. Like new.',
    price: 350,
    category: 'Electronics',
    condition: 'Like New',
    images: [],
  },
  {
    title: 'HP Wired USB Keyboard',
    description: 'Full-size keyboard, all keys working. Slight yellowing on spacebar. Ideal for lab use.',
    price: 200,
    category: 'Electronics',
    condition: 'Used',
    images: [],
  },

  // Furniture
  {
    title: 'Foldable Study Chair (Comfortable)',
    description: 'Cushioned foldable chair with armrests. Used for 1 year. A bit dusty but structurally solid.',
    price: 500,
    category: 'Furniture',
    condition: 'Good',
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop',
    ],
  },
  {
    title: 'Wooden Bookshelf (3-tier)',
    description: 'Fits nicely beside a hostel bed. Holds about 30–35 books. No damage, colour slightly faded.',
    price: 700,
    category: 'Furniture',
    condition: 'Used',
    images: [
      'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=600&auto=format&fit=crop',
    ],
  },
  {
    title: 'Small Plastic Stool',
    description: 'Sturdy stool, good for extra seating or as a footrest. Colour: white.',
    price: 80,
    category: 'Furniture',
    condition: 'Used',
    images: [],
  },

  // Clothing
  {
    title: 'PEC College Hoodie (Navy Blue, L)',
    description: 'Official PEC hoodie from college fest 2023. Worn only twice. Soft fleece inside.',
    price: 350,
    category: 'Clothing',
    condition: 'Like New',
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&auto=format&fit=crop',
    ],
  },
  {
    title: 'Formal Shirt – Raymond (White, 40)',
    description: 'Barely worn, bought for placement interview. Kept in very good condition.',
    price: 200,
    category: 'Clothing',
    condition: 'Like New',
    images: [
      'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&auto=format&fit=crop',
    ],
  },
  {
    title: 'Sports Shoes – Nike Air Max (Size 9)',
    description: 'Used for about 6 months. Good grip, sole is fine. Some minor scuffs on upper.',
    price: 1200,
    category: 'Clothing',
    condition: 'Good',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop',
    ],
  },

  // Sports
  {
    title: 'Cosco Cricket Bat (Kashmir Willow)',
    description: 'Decent bat for hostel ground matches. Handle tape recently replaced. Good ping.',
    price: 400,
    category: 'Sports',
    condition: 'Good',
    images: [
      'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&auto=format&fit=crop',
    ],
  },
  {
    title: 'Badminton Racket Pair (Yonex GR-303)',
    description: 'Both rackets in good shape. One grip needs replacement. Shuttlecocks not included.',
    price: 300,
    category: 'Sports',
    condition: 'Good',
    images: [
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&auto=format&fit=crop',
    ],
  },
  {
    title: 'Nivia Football (Size 5)',
    description: 'Used for evening matches. Still holds air well. Few scuff marks.',
    price: 350,
    category: 'Sports',
    condition: 'Used',
    images: [
      'https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=600&auto=format&fit=crop',
    ],
  },
  {
    title: 'Decathlon Resistance Bands Set (5 bands)',
    description: 'All 5 resistance levels included. Used for 2 months, no tears. Good for hostel workouts.',
    price: 280,
    category: 'Sports',
    condition: 'Like New',
    images: [],
  },

  // Stationery
  {
    title: 'Casio FX-991ES Plus Scientific Calculator',
    description: 'Works perfectly. Required for all engineering exams. Battery recently changed.',
    price: 400,
    category: 'Stationery',
    condition: 'Good',
    images: [
      'https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=600&auto=format&fit=crop',
    ],
  },
  {
    title: 'A4 Graph Sheets Bundle (100 sheets)',
    description: 'Unused bundle. Picked up extra by mistake. Full 100-sheet pack.',
    price: 50,
    category: 'Stationery',
    condition: 'New',
    images: [],
  },
  {
    title: 'Drawing Instruments Set (Staedtler)',
    description: 'Complete set: compass, divider, protractor, set squares. Used for one sem Engineering Drawing.',
    price: 150,
    category: 'Stationery',
    condition: 'Good',
    images: [
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop',
    ],
  },
  {
    title: 'Sticky Notes + Highlighter Pack',
    description: '3 packs of sticky notes (unused) + 4 highlighters (2 used, 2 new). Clearing desk before going home.',
    price: 80,
    category: 'Stationery',
    condition: 'New',
    images: [],
  },

  // Other
  {
    title: 'Electric Kettle 1L (Prestige)',
    description: 'Perfect for hostel nights. Boils fast, no leaks. Comes with original lid.',
    price: 500,
    category: 'Other',
    condition: 'Good',
    images: [
      'https://images.unsplash.com/photo-1571167530149-c1105da4c2c0?w=600&auto=format&fit=crop',
    ],
  },
  {
    title: 'Table Lamp with USB Charging Port',
    description: 'White LED, 3 brightness levels. USB port on the base. Works fine, selling because going home.',
    price: 350,
    category: 'Other',
    condition: 'Like New',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop',
    ],
  },
  {
    title: 'Bicycle Lock – Heavy Duty Chain Lock',
    description: 'Heavy 1m chain lock with 2 keys. No bicycle, just the lock. Good security for hostel cycles.',
    price: 200,
    category: 'Other',
    condition: 'Good',
    images: [],
  },
  {
    title: 'Backpack – Wildcraft 30L (Olive Green)',
    description: 'Durable laptop compartment fits 15" laptop. Used for 1 year, all zips working.',
    price: 600,
    category: 'Other',
    condition: 'Good',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop',
    ],
  },
  {
    title: 'Lunchbox Set (Stainless Steel, 3-tier)',
    description: 'Good for carrying dal-rice from the mess. All clips intact, no leaks.',
    price: 150,
    category: 'Other',
    condition: 'Used',
    images: [],
  },
];

export async function seedMarketplace(students: StudentSeed[] = []) {
  console.log('Seeding marketplace listings...');

  const studentPool =
    students.length > 0
      ? students
      : await prisma.user.findMany({
          where: { role: 'student' },
          select: { id: true, email: true, name: true },
        });

  if (studentPool.length === 0) {
    throw new Error('No students found. Seed students before seeding marketplace listings.');
  }

  // Pick a spread of students as sellers
  const sellerCount = Math.min(studentPool.length, 10);
  const sellers = studentPool.slice(0, sellerCount);

  let created = 0;
  for (let i = 0; i < DUMMY_LISTINGS.length; i++) {
    const listing = DUMMY_LISTINGS[i];
    const seller = sellers[i % sellerCount];

    // Randomise created date across last 60 days for realism
    const daysBack = Math.floor((i / DUMMY_LISTINGS.length) * 55) + 1;

    await prisma.marketplaceListing.create({
      data: {
        title: listing.title,
        description: listing.description,
        price: listing.price,
        category: listing.category,
        condition: listing.condition,
        images: listing.images,
        status: i === 2 || i === 10 ? 'Sold' : 'Available', // mark a couple as sold
        sellerId: seller.id,
        createdAt: daysAgo(daysBack),
      },
    });
    created++;
  }

  console.log(`  ✓ Created ${created} marketplace listings`);
}
