export interface MapRegion {
  id: string;
  _id?: string;
  name: string;
  description: string;
  x: number;
  y: number;
  width: number;
  height: number;
  category: string;
  link?: string;
  organizationId?: string;
}

export interface MapRoad {
  id: string;
  _id?: string;
  points: { x: number; y: number }[]; // Array of waypoints for polyline
  width: number;
  organizationId?: string;
}

export const defaultRegions: Omit<MapRegion, 'id' | 'organizationId'>[] = [
  // GRID: Roads at y=12,30,50,70,82 (horizontal) and x=22,38,70,88 (vertical)
  // Buildings placed INSIDE cells, not overlapping roads

  // === ROW A: y=2-10 (top, before y=12 road) ===
  {
    name: "Director's Residence",
    description: 'Official Residence',
    x: 24,
    y: 2,
    width: 12,
    height: 9,
    category: 'admin',
  },
  {
    name: 'Community Centre',
    description: 'Events & Activities',
    x: 72,
    y: 2,
    width: 14,
    height: 9,
    category: 'admin',
  },
  {
    name: 'Forbidden Forest',
    description: 'Green Area',
    x: 90,
    y: 2,
    width: 8,
    height: 9,
    category: 'sports',
  },

  // === ROW B: y=14-28 (between y=12 and y=30 roads) ===
  {
    name: 'Vindhya Hostel',
    description: 'Boys Hostel',
    x: 2,
    y: 14,
    width: 9,
    height: 14,
    category: 'hostel',
  },
  {
    name: 'Aravali Hostel',
    description: 'Boys Hostel',
    x: 12,
    y: 14,
    width: 9,
    height: 14,
    category: 'hostel',
  },
  {
    name: 'Guest House',
    description: 'Visitor Accommodation',
    x: 24,
    y: 14,
    width: 12,
    height: 6,
    category: 'admin',
  },
  {
    name: 'ECE & CSE Dept',
    description: 'Electronics & Computer Science',
    x: 24,
    y: 21,
    width: 12,
    height: 8,
    category: 'academic',
  },
  {
    name: 'New Academic Block',
    description: 'L-26 to L-31 Halls',
    x: 40,
    y: 14,
    width: 22,
    height: 14,
    category: 'academic',
  },
  {
    name: 'K.C. Hostel',
    description: 'Girls Hostel',
    x: 72,
    y: 14,
    width: 14,
    height: 14,
    category: 'hostel',
  },
  {
    name: 'Aero Workshops',
    description: 'Aerospace Labs',
    x: 90,
    y: 14,
    width: 8,
    height: 14,
    category: 'academic',
  },

  // === ROW C: y=32-48 (between y=30 and y=50 roads) ===
  {
    name: 'PEC Market',
    description: 'Shops & Eateries',
    x: 2,
    y: 32,
    width: 9,
    height: 7,
    category: 'food',
  },
  {
    name: 'Bamboo Garden',
    description: 'Garden',
    x: 12,
    y: 32,
    width: 9,
    height: 6,
    category: 'sports',
  },
  {
    name: 'L-20',
    description: 'Lecture Hall',
    x: 24,
    y: 32,
    width: 6,
    height: 4,
    category: 'academic',
  },
  {
    name: 'L-21',
    description: 'Lecture Hall',
    x: 31,
    y: 32,
    width: 6,
    height: 4,
    category: 'academic',
  },
  {
    name: 'L-22',
    description: 'Lecture Hall',
    x: 24,
    y: 37,
    width: 6,
    height: 4,
    category: 'academic',
  },
  {
    name: 'L-23',
    description: 'Lecture Hall',
    x: 31,
    y: 37,
    width: 6,
    height: 4,
    category: 'academic',
  },
  {
    name: 'Aero Dept',
    description: 'Aerospace Department',
    x: 40,
    y: 32,
    width: 10,
    height: 8,
    category: 'academic',
  },
  {
    name: 'L-26',
    description: 'Lecture Hall',
    x: 52,
    y: 32,
    width: 6,
    height: 5,
    category: 'academic',
  },
  {
    name: 'IT 201',
    description: 'IT Lab',
    x: 60,
    y: 32,
    width: 8,
    height: 6,
    category: 'academic',
  },
  {
    name: 'L-27',
    description: 'Lecture Hall',
    x: 52,
    y: 38,
    width: 6,
    height: 5,
    category: 'academic',
  },
  {
    name: 'Rotodynamics',
    description: 'Faculty Dept',
    x: 90,
    y: 32,
    width: 8,
    height: 8,
    category: 'academic',
  },

  {
    name: 'Himalaya Hostel',
    description: 'Boys Hostel',
    x: 2,
    y: 40,
    width: 9,
    height: 9,
    category: 'hostel',
  },
  {
    name: 'CCA',
    description: 'Cultural Activities',
    x: 12,
    y: 40,
    width: 9,
    height: 6,
    category: 'admin',
  },
  {
    name: 'C.C.',
    description: 'Computer Centre',
    x: 24,
    y: 42,
    width: 12,
    height: 7,
    category: 'academic',
  },
  {
    name: 'C.C.D.',
    description: 'Café Coffee Day',
    x: 40,
    y: 42,
    width: 5,
    height: 5,
    category: 'food',
  },
  {
    name: 'Civil Dept',
    description: 'Civil Engineering',
    x: 47,
    y: 42,
    width: 10,
    height: 7,
    category: 'academic',
  },
  {
    name: 'Mech Dept',
    description: 'Mechanical Engineering',
    x: 59,
    y: 42,
    width: 10,
    height: 7,
    category: 'academic',
  },
  {
    name: 'Athletic Ground',
    description: 'Track & Field',
    x: 72,
    y: 32,
    width: 16,
    height: 36,
    category: 'sports',
  },

  // === ROW D: y=52-68 (between y=50 and y=70 roads) ===
  {
    name: 'Kurukshetra Hostel',
    description: 'Boys Hostel',
    x: 2,
    y: 52,
    width: 9,
    height: 16,
    category: 'hostel',
  },
  {
    name: 'Meta Dept',
    description: 'Metallurgy Dept',
    x: 12,
    y: 52,
    width: 9,
    height: 8,
    category: 'academic',
  },
  {
    name: 'Library',
    description: 'Central Library (L-10, L-11)',
    x: 24,
    y: 52,
    width: 12,
    height: 10,
    category: 'academic',
  },
  {
    name: 'Chemistry Lab',
    description: 'Chemistry Department',
    x: 40,
    y: 52,
    width: 18,
    height: 6,
    category: 'academic',
  },
  {
    name: 'Auto Lab',
    description: 'Automobile Lab',
    x: 60,
    y: 52,
    width: 8,
    height: 6,
    category: 'academic',
  },
  {
    name: 'W.S.',
    description: 'Workshop',
    x: 60,
    y: 59,
    width: 6,
    height: 5,
    category: 'academic',
  },
  {
    name: 'Gym',
    description: 'Fitness Center',
    x: 90,
    y: 72,
    width: 8,
    height: 8,
    category: 'sports',
  },

  {
    name: 'SPIC Building',
    description: 'Research',
    x: 12,
    y: 62,
    width: 9,
    height: 6,
    category: 'academic',
  },
  { name: 'T-1', description: 'Tutorial', x: 40, y: 60, width: 5, height: 5, category: 'academic' },
  { name: 'T-2', description: 'Tutorial', x: 46, y: 60, width: 5, height: 5, category: 'academic' },
  { name: 'T-3', description: 'Tutorial', x: 52, y: 60, width: 5, height: 5, category: 'academic' },
  { name: 'T-4', description: 'Tutorial', x: 40, y: 66, width: 5, height: 3, category: 'academic' },
  { name: 'T-5', description: 'Tutorial', x: 46, y: 66, width: 5, height: 3, category: 'academic' },
  { name: 'T-6', description: 'Tutorial', x: 52, y: 66, width: 5, height: 3, category: 'academic' },

  // === ROW E: y=72-80 (between y=70 and y=82 roads) ===
  {
    name: 'Auditorium',
    description: 'Main Auditorium',
    x: 24,
    y: 72,
    width: 12,
    height: 8,
    category: 'admin',
  },
  {
    name: 'DH-1',
    description: 'Dining Hall 1',
    x: 40,
    y: 72,
    width: 6,
    height: 6,
    category: 'food',
  },
  {
    name: 'DH-2',
    description: 'Dining Hall 2',
    x: 47,
    y: 72,
    width: 6,
    height: 6,
    category: 'food',
  },
  {
    name: 'DH-3',
    description: 'Dining Hall 3',
    x: 54,
    y: 72,
    width: 6,
    height: 6,
    category: 'food',
  },
  {
    name: 'DH-4',
    description: 'Dining Hall 4',
    x: 61,
    y: 72,
    width: 6,
    height: 6,
    category: 'food',
  },
  {
    name: 'PECOSA',
    description: 'Student Activities',
    x: 72,
    y: 70,
    width: 16,
    height: 4,
    category: 'admin',
  },
  {
    name: 'Parking',
    description: 'Parking & Basketball',
    x: 72,
    y: 76,
    width: 16,
    height: 5,
    category: 'admin',
  },

  // === ROW F: y=84-98 (below y=82 road) ===
  {
    name: 'Common Commonwealth Block',
    description: 'Admin Block',
    x: 2,
    y: 84,
    width: 10,
    height: 12,
    category: 'admin',
  },
  {
    name: 'Football Ground',
    description: 'Football Field',
    x: 13,
    y: 84,
    width: 8,
    height: 12,
    category: 'sports',
  },
  {
    name: 'Admin Block',
    description: 'Main Administration',
    x: 24,
    y: 84,
    width: 12,
    height: 10,
    category: 'admin',
  },
  {
    name: 'Cricket Ground',
    description: 'Cricket Field',
    x: 40,
    y: 84,
    width: 24,
    height: 14,
    category: 'sports',
  },
  {
    name: 'Centre of Excellence',
    description: 'Research Center',
    x: 66,
    y: 84,
    width: 18,
    height: 6,
    category: 'academic',
  },
  {
    name: 'Shiwalik Hostel',
    description: 'Boys Hostel',
    x: 86,
    y: 85,
    width: 12,
    height: 10,
    category: 'hostel',
  },
];

export const defaultRoads: Omit<MapRoad, 'id' | 'organizationId'>[] = [
  // === HORIZONTAL ROADS ===
  {
    points: [
      { x: 0, y: 12 },
      { x: 88, y: 12 },
    ],
    width: 2,
  },
  {
    points: [
      { x: 0, y: 30 },
      { x: 88, y: 30 },
    ],
    width: 2,
  },
  {
    points: [
      { x: 0, y: 50 },
      { x: 88, y: 50 },
    ],
    width: 2,
  },
  {
    points: [
      { x: 0, y: 70 },
      { x: 88, y: 70 },
    ],
    width: 2,
  },
  {
    points: [
      { x: 0, y: 82 },
      { x: 100, y: 82 },
    ],
    width: 2.5,
  },
  // === VERTICAL ROADS ===
  {
    points: [
      { x: 22, y: 0 },
      { x: 22, y: 82 },
    ],
    width: 2,
  },
  {
    points: [
      { x: 38, y: 30 },
      { x: 38, y: 82 },
    ],
    width: 1.5,
  },
  {
    points: [
      { x: 70, y: 0 },
      { x: 70, y: 82 },
    ],
    width: 2,
  },
  {
    points: [
      { x: 88, y: 0 },
      { x: 88, y: 70 },
    ],
    width: 1.5,
  },
  // === CONNECTORS ===
  {
    points: [
      { x: 58, y: 50 },
      { x: 58, y: 70 },
    ],
    width: 1,
  },
];

export const categories = [
  {
    id: 'academic',
    label: 'Academic',
    regionVars:
      'bg-blue-100 dark:bg-blue-900/60 border-blue-300 dark:border-blue-600 hover:border-blue-500',
    badgeVars: 'bg-blue-600',
  },
  {
    id: 'hostel',
    label: 'Hostels',
    regionVars:
      'bg-emerald-100 dark:bg-emerald-900/60 border-emerald-300 dark:border-emerald-600 hover:border-emerald-500',
    badgeVars: 'bg-emerald-600',
  },
  {
    id: 'sports',
    label: 'Sports',
    regionVars:
      'bg-red-100 dark:bg-red-900/60 border-red-300 dark:border-red-600 hover:border-red-500',
    badgeVars: 'bg-red-600',
  },
  {
    id: 'food',
    label: 'Food',
    regionVars:
      'bg-orange-100 dark:bg-orange-900/60 border-orange-300 dark:border-orange-600 hover:border-orange-500',
    badgeVars: 'bg-orange-600',
  },
  {
    id: 'admin',
    label: 'Admin',
    regionVars:
      'bg-purple-100 dark:bg-purple-900/60 border-purple-300 dark:border-purple-600 hover:border-purple-500',
    badgeVars: 'bg-purple-600',
  },
];
