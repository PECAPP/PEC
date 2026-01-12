# OmniFlow - Features Documentation

## Overview
The Library Management system allows students to browse and borrow books from the college library. Librarians can manage the book inventory and process returns.

## Features

### For Students
- **Browse Books**: Search and filter books by title, author, or category
- **Borrow Books**: Request books with automatic 14-day due dates
- **View Borrowed Books**: See currently borrowed books and due dates
- **Return Books**: Return borrowed books when done

### For Librarians/Admins
- **Add Books**: Add new books to the library inventory
- **Manage Inventory**: Track total copies and available copies
- **View Catalog**: Complete book database with filtering and search

## Data Model

```typescript
interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
  location: string;
  publisher: string;
  year: number;
}

interface BookBorrow {
  id: string;
  userId: string;
  bookId: string;
  borrowDate: any;
  dueDate: any;
  returnDate?: any;
  status: 'borrowed' | 'returned' | 'overdue';
  fine?: number;
}
```

## Navigation
- Students: **Sidebar** → Library
- Admins: **Sidebar** → Library (with add button)

## API Endpoints (Firestore Collections)
- `books/` - All books in library
- `bookBorrows/` - All borrow records

## Permissions
- **All Users**: Can view and borrow books
- **College Admin / Super Admin**: Can add and manage books

---

# Room Booking System

## Overview
The Room Booking system allows faculty and staff to book classrooms, labs, meeting rooms, and auditoriums for classes and events. Administrators can approve or reject bookings.

## Features

### For Faculty/Staff
- **Browse Rooms**: View available rooms with capacity and location
- **Check Availability**: See real-time room bookings for specific dates
- **Request Room**: Submit room booking requests with time and purpose
- **View Bookings**: Track pending and approved bookings

### For Admins
- **Add Rooms**: Add classrooms, labs, and meeting rooms
- **Approve Bookings**: Review and approve pending room booking requests
- **View Calendar**: See all room bookings across the college
- **Manage Facilities**: Track room capacity and amenities

## Data Model

```typescript
interface Room {
  id: string;
  name: string;
  type: 'classroom' | 'lab' | 'meeting-room' | 'auditorium';
  capacity: number;
  building: string;
  floor: number;
  facilities: string[];
  location?: string;
  isAvailable?: boolean;
  createdAt?: any;
}

interface RoomBooking {
  id: string;
  roomId: string;
  userId: string;
  title: string;
  startTime: any;
  endTime: any;
  date: string;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: any;
}
```

## Navigation
- Faculty: **Sidebar** → Room Booking
- Admins: **Sidebar** → Room Booking (with add button and approvals)

## Workflow
1. Faculty selects date and room
2. Faculty enters start time, end time, and purpose
3. Request submitted as "pending" (faculty) or "approved" (admin)
4. Admin reviews pending requests
5. Admin approves or rejects
6. Faculty receives confirmation

## API Endpoints (Firestore Collections)
- `rooms/` - All rooms
- `roomBookings/` - All booking records

## Permissions
- **Faculty/Staff**: Can request and view own bookings
- **College Admin / Super Admin**: Can add rooms and approve requests

---

# Leave Management System

## Overview
The Leave Management system handles faculty and staff leave requests with balance tracking. Administrators can approve or reject leave requests while ensuring leave balances are not exceeded.

## Features

### For Faculty/Staff
- **Apply for Leave**: Submit leave requests with start/end dates and reason
- **View Leave Balance**: See available days for each leave type
- **Track History**: View past and current leave requests with status
- **Multiple Leave Types**: Casual, Sick, Earned, Maternity, Paternity

### For Admins
- **Approve/Reject**: Review and action pending leave requests
- **Manage Balances**: Track and update leave balances per employee
- **View Analytics**: See all leave requests across faculty
- **Configure Leave Types**: Set default days per leave type

## Data Model

```typescript
interface LeaveType {
  id: string;
  name: string;
  defaultDays: number;
  description: string;
}

interface Leave {
  id: string;
  userId: string;
  userName?: string;
  leaveTypeId: string;
  leaveType?: string;
  startDate: any;
  endDate: any;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvalDate?: any;
  createdAt: any;
}

interface LeaveBalance {
  id: string;
  userId: string;
  leaveTypeId: string;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  year: number;
}
```

## Navigation
- Faculty: **Sidebar** → Leave Management
- Admins: **Sidebar** → Leave Management (with approval section)

## Workflow
1. Faculty selects leave type, start date, end date
2. System calculates number of days
3. System checks available balance
4. Request submitted as "pending"
5. Admin reviews with balance information
6. Admin approves or rejects
7. If approved, balance is updated automatically

## Leave Types (Pre-seeded)
- **Casual Leave**: 10 days/year
- **Sick Leave**: 8 days/year
- **Earned Leave**: 20 days/year
- **Maternity Leave**: 180 days
- **Paternity Leave**: 15 days

## API Endpoints (Firestore Collections)
- `leaveTypes/` - All leave type definitions
- `leaves/` - All leave requests
- `leaveBalance/` - User leave balances per type

## Permissions
- **Faculty/Staff**: Can apply for and view own leaves
- **College Admin / Super Admin**: Can approve all requests and manage balances

---

## Common Features Across All Systems

### Search & Filter
- All systems include search functionality
- Category/Type filters available
- Real-time updates via Firestore listeners

### Status Tracking
- All requests have clear status indicators
- Color-coded status badges (pending, approved, rejected)
- Timestamps for all actions

### Role-Based Access
- All systems respect user roles
- Automatic visibility based on permissions
- Self-service for regular users, admin controls for managers

### Notifications
- Toast notifications for all actions
- Success/error feedback for user actions
- Confirmation dialogs for important actions

---

## Seeding Data

Run the seed script to populate library and leave data:

```bash
node scripts/seedLibraryAndLeaves.js
```

This will create:
- **Sample Books**: 8 different books across categories
- **Leave Types**: 5 pre-configured leave types with default days
