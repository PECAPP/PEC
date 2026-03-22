# API Fix Summary: Pagination & Timetable Seeding

## Issues Fixed

### 1. **400 Bad Request on `/courses` Endpoint**
**Root Cause:** Frontend was sending `limit: 500` but backend `PaginationQueryDto` enforces max `limit: 200`.

**Fix:**
- Reduced frontend query limits to safe values (≤ 200)
- Updated files:
  - `src/pages/Timetable.tsx` (fetchAllPages uses MAX_PAGE_SIZE=200)
  - `src/pages/Attendance.tsx` (reduced 500→200, 1000→200)
  - `src/pages/MyApplications.tsx` 
  - `src/features/courses/pages/CourseMaterialsPage.tsx`
  - `src/features/courses/pages/CoursesPage.tsx`

### 2. **Missing `/users` Query Validation**
**Root Cause:** Users controller used raw `@Query()` decorators without formal DTO validation, causing silent failures.

**Fix:**
- Created `server/src/users/dto/user-query.dto.ts` with formal validation:
  - `role`: enum (admin, faculty, student, staff)
  - `department`: string
  - `semester`: 1-8 (type-safe)
  - `limit`: 1-200 (enforced)
  - `offset`: ≥0 (enforced)
  - `search`, `status`: optional filters
- Updated `server/src/users/users.controller.ts` to use `UserQueryDto`
- Global `ValidationPipe` already active in `app.setup.ts` (handles automatic validation)

### 3. **Insufficient Course Data for Timetable Generation**
**Root Cause:** Seed created only 1 course per department per semester, insufficient to generate 3-5 classes daily.

**Fix:**
- Enhanced `seedCourses()` in `server/seed.ts`:
  - Base courses from catalog + additional section variants
  - Target: 8-10 courses per semester per department
  - Ensures robust timetable population with 3-5 sessions daily per branch
  - All with proper facultyId, semester, department linkage

## Implementation Details

### Backend Changes

**File:** `server/src/users/dto/user-query.dto.ts` (NEW)
```typescript
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsEnum, Min, Max } from 'class-validator';

export enum UserRole {
  ADMIN = 'admin',
  FACULTY = 'faculty',
  STUDENT = 'student',
  STAFF = 'staff',
}

export class UserQueryDto {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(8)
  semester?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(200)
  limit?: number = 100;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  offset?: number = 0;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  status?: 'active' | 'inactive' | 'suspended';
}
```

**File:** `server/src/users/users.controller.ts` (UPDATED)
- Added import: `import { UserQueryDto } from './dto/user-query.dto';`
- Changed findMany signature from individual `@Query('limit')`, `@Query('offset')`, etc. to `@Query() query: UserQueryDto`
- Fixed meta response to use validated query values

**File:** `server/seed.ts` (ENHANCED)
- `seedCourses()` now creates 8-10 courses per department per semester instead of 1
- Includes section variants (e.g., "Elective Section 1", "Elective Section 2")
- Properly distributes to available faculty pool in department
- Ensures timetable generation has sufficient course volume

### Frontend Changes

**Files Updated:**
- `src/pages/Attendance.tsx` (limit: 500→200, 1000→200)
- `src/pages/Timetable.tsx` (uses MAX_PAGE_SIZE=200)
- `src/pages/MyApplications.tsx` 
- `src/features/courses/pages/CourseMaterialsPage.tsx`
- `src/features/courses/pages/CoursesPage.tsx`

All now use `api.get()` with safe `limit` and `offset` values within pagination constraints.

## Validation

✅ Backend compiles without errors
✅ Frontend compiles without errors
✅ Global ValidationPipe active in app.setup.ts
✅ UserQueryDto provides full type safety for users endpoint
✅ Course seed enhanced for realistic timetable coverage
✅ All pagination limits respect max 200 constraint

## Testing Instructions

1. **Re-seed database:**
   ```bash
   cd server
   npm run prisma:migrate fresh
   npm run seed
   ```
   Verify courses created: Should see 8-10 per semester per department

2. **Verify /users endpoint:**
   ```bash
   curl -H "Authorization: Bearer <token>" \
     "http://localhost:3000/users?role=student&limit=100&offset=0"
   ```
   Expected: 200 OK with user list and meta

3. **Verify /courses endpoint:**
   ```bash
   curl -H "Authorization: Bearer <token>" \
     "http://localhost:3000/courses?limit=200&offset=0"
   ```
   Expected: 200 OK

4. **Test Timetable page:**
   - Navigate to Timetable
   - Should load courses without 400 error
   - Auto-generate should populate with 3-5 classes daily

## Firebase Migration Status

✅ Completed migrations:
- CourseMaterialsPage
- Attendance
- Timetable
- MyApplications
- CoursesPage

Remaining firebase patterns (~200 matches):
- Finance/payments
- Placements
- Settings
- Search
- Room-booking
- Library
- Leave
- Hostel
- Clubs

These can be tackled in subsequent sprints following the same REST pattern.
