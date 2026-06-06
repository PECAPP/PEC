'use client';

import { useEffect, useState } from 'react';
import {
  Calendar,
  Loader2,
  Plus,
  GripVertical,
  Upload,
  Download,
  FileText,
  ChevronDown,
  ChevronUp,
  List,
} from 'lucide-react';
import PDFExportButton from '@/components/common/PDFExportButton';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const BulkUpload = dynamic(() => import('@/components/BulkUpload'), {
  loading: () => (
    <div className="p-8 flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
      <span className="ml-2 text-sm text-muted-foreground">Loading Uploader...</span>
    </div>
  ),
  ssr: false,
});

const EditSlotDialog = dynamic(() => import('./components/EditSlotDialog'), {
  ssr: false,
});

const ExtraClassDialog = dynamic(() => import('./components/ExtraClassDialog'), {
  ssr: false,
});

import TimetableDesktopView from './components/TimetableDesktopView';
import TimetableMobileView from './components/TimetableMobileView';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import api from '@/lib/api';
import { isAuthError } from '@/lib/api';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/usePermissions';
import { generateFullTimetable, type CourseSchedule } from '@/lib/timetableGenerator';
import { LoadingGrid } from '@/components/common/AsyncState';
import TimetableFilters, {
  type TimetableFilterValues,
} from '@/features/timetable/TimetableFilters';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = [
  '08:00-09:00',
  '09:00-10:00',
  '10:00-11:00',
  '11:00-12:00',
  '12:00-13:00',
  '13:00-14:00', // LUNCH
  '14:00-15:00',
  '15:00-16:00',
  '16:00-17:00',
];

type ApiResponse<T> = { success: boolean; data: T; meta?: any };
const MAX_PAGE_SIZE = 200;

const extractData = <T,>(response: any): T => {
  if (response?.data?.data !== undefined) return response.data.data as T;
  return response?.data as T;
};

const parseTimeSlot = (timeSlot: string) => {
  const [startTime, endTime] = timeSlot.split('-');
  return { startTime, endTime };
};

const getAcademicYearFromSemester = (semester: unknown) => {
  const numericSemester = Number(semester);
  if (!Number.isFinite(numericSemester) || numericSemester <= 0) return null;
  return Math.ceil(numericSemester / 2);
};

const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const getValidUuid = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return UUID_V4_PATTERN.test(trimmed) ? trimmed : undefined;
};

const getFacultyPayload = (course: any) => {
  const facultyId = getValidUuid(course?.facultyId ?? course?.instructor);
  const instructorName = typeof course?.instructor === 'string' ? course.instructor : '';
  const facultyName = course?.facultyName || course?.instructorName || instructorName || undefined;

  return { facultyId, facultyName };
};

const isAxiosStatus = (error: unknown, status: number) =>
  (error as any)?.response?.status === status;

const fetchAllPages = async <T,>(
  path: string,
  params: Record<string, unknown> = {}
): Promise<T[]> => {
  const firstResponse = await api.get<ApiResponse<T[]>>(path, {
    params: { ...params, limit: MAX_PAGE_SIZE, offset: 0 },
  });
  const firstItems = extractData<T[]>(firstResponse) || [];
  const total = Number(firstResponse?.data?.meta?.total ?? firstItems.length);

  if (total <= MAX_PAGE_SIZE) {
    return firstItems;
  }

  const remainingOffsets: number[] = [];
  for (let offset = MAX_PAGE_SIZE; offset < total; offset += MAX_PAGE_SIZE) {
    remainingOffsets.push(offset);
  }

  const remainingResponses = await Promise.all(
    remainingOffsets.map((offset) =>
      api.get<ApiResponse<T[]>>(path, {
        params: { ...params, limit: MAX_PAGE_SIZE, offset },
      })
    )
  );

  return [
    ...firstItems,
    ...remainingResponses.flatMap((response) => extractData<T[]>(response) || []),
  ];
};

export default function Timetable() {
  const router = useRouter();
  const { isFaculty, user, loading: authLoading } = usePermissions();
  const userRole = user?.role || '';
  const isCollegeAdmin = userRole === 'college_admin';
  const canAutoGenerate = isCollegeAdmin;
  const canManageAllTimetable = isCollegeAdmin;
  const canScheduleExtraClass = userRole === 'faculty';
  const facultyDisplayName = ((user as any)?.fullName || (user as any)?.name || '').trim();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<any>({});
  const [draggedCourse, setDraggedCourse] = useState<any>(null);
  const [showSlotDialog, setShowSlotDialog] = useState(false);

  // Smart Day Selection: Default to today if Mon-Sat, else Monday
  const todayIndex = new Date().getDay(); // 0=Sun, 1=Mon...
  const initialDay = todayIndex > 0 && todayIndex <= 6 ? DAYS[todayIndex - 1] : 'Monday';
  const [selectedDay, setSelectedDay] = useState(initialDay);

  const [generating, setGenerating] = useState(false);
  const [filterValues, setFilterValues] = useState<TimetableFilterValues>({
    department: 'all',
    academicYear: 'all',
    batch: 'all',
    courseQuery: '',
    facultyQuery: '',
    roomQuery: '',
  });
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [slotForm, setSlotForm] = useState({
    courseId: '',
    room: '',
  });
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [isWeeklyView, setIsWeeklyView] = useState(false);
  const [showExtraClassDialog, setShowExtraClassDialog] = useState(false);
  const [extraClassForm, setExtraClassForm] = useState({
    courseId: '',
    slotKey: '',
    room: '',
  });
  const [coursesWrapperOpen, setCoursesWrapperOpen] = useState(true);
  const [facultyDepartment, setFacultyDepartment] = useState('');
  const [availableDepartments, setAvailableDepartments] = useState<string[]>([]);
  const [availableBatches, setAvailableBatches] = useState<string[]>([]);

  const [studentEnrollments, setStudentEnrollments] = useState<string[]>([]);
  const [studentAttendanceMap, setStudentAttendanceMap] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    if (authLoading) return; // Wait for ({} as any) to load

    if (!user) {
      router.replace('/auth');
      return;
    }

    const loadData = async () => {
      try {
        await fetchData();
        if (user.role === 'student' && user.uid) {
          const [enrollments, attendanceRes] = await Promise.all([
            fetchAllPages<any>('/enrollments', {
              studentId: user.uid,
              status: 'active',
            }),
            api.get<ApiResponse<any>>('/attendance/summary'),
          ]);

          setStudentEnrollments(enrollments.map((e: any) => e.courseId));

          const summary = extractData<any>(attendanceRes);
          if (summary && summary.courses) {
            const attMap = new Map();
            summary.courses.forEach((c: any) => attMap.set(c.courseId, c.percentage));
            setStudentAttendanceMap(attMap);
          }
        }
      } catch (error) {
        if (isAuthError(error)) {
          toast.error('Session expired. Please login again.');
          router.replace('/auth');
          return;
        }

        console.error('Error:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [authLoading, user, router]);

  const fetchData = async () => {
    try {
      const allCourses = await fetchAllPages<any>('/courses');
      let facultyOwnedCourses =
        isFaculty && user?.uid
          ? allCourses.filter(
              (course: any) => course.facultyId === user.uid || course.instructorId === user.uid
            )
          : [];

      if (isFaculty && facultyOwnedCourses.length === 0 && facultyDisplayName) {
        const name = facultyDisplayName.toLowerCase();
        facultyOwnedCourses = allCourses.filter((course: any) => {
          const instructor = String(course.instructor || course.facultyName || '').toLowerCase();
          return instructor.includes(name);
        });
      }

      // Resolve faculty department from owned courses, or fall back to user's department
      const resolvedFacultyDepartment = (
        (user as any)?.department ||
        facultyOwnedCourses[0]?.department ||
        ''
      ).trim();

      if (isFaculty) {
        setFacultyDepartment(resolvedFacultyDepartment);
      } else {
        setFacultyDepartment('');
      }

      // For faculty: show owned courses; if none, fall back to department courses
      let coursesData: any[] = [];
      if (isFaculty) {
        if (facultyOwnedCourses.length > 0) {
          coursesData = facultyOwnedCourses;
        } else if (resolvedFacultyDepartment) {
          // Fall back to all courses in faculty's department
          coursesData = allCourses.filter(
            (course: any) => (course.department || '').trim() === resolvedFacultyDepartment
          );
        } else {
          // Last resort: show all courses
          coursesData = allCourses;
        }
      } else {
        // Non-faculty sees all courses
        coursesData = allCourses;
      }

      setCourses(coursesData);

      const timetableItems = await fetchAllPages<any>('/timetable');
      const timetableData: any = {};

      timetableItems.forEach((item: any) => {
        if (
          isFaculty &&
          resolvedFacultyDepartment &&
          item.department !== resolvedFacultyDepartment
        ) {
          return;
        }

        const timeSlot = item.timeSlot || `${item.startTime}-${item.endTime}`;
        const key = `${item.day}-${timeSlot}`;
        if (!timetableData[key]) {
          timetableData[key] = [];
        }
        timetableData[key].push({
          ...item,
          timeSlot,
        });
      });

      const departmentsFromData = Array.from(
        new Set(
          [...allCourses, ...timetableItems]
            .map((item: any) => String(item?.department || '').trim())
            .filter(Boolean)
        )
      ).sort();
      const batchesFromData = Array.from(
        new Set(timetableItems.map((item: any) => String(item?.batch || '').trim()).filter(Boolean))
      ).sort();

      setAvailableDepartments(departmentsFromData);
      setAvailableBatches(batchesFromData);
      setTimetable(timetableData);
    } catch (error) {
      if (isAuthError(error)) {
        toast.error('Session expired. Please login again.');
        router.replace('/auth');
        return;
      }

      console.error('Error fetching data:', error);
      toast.error('Failed to load timetable data');
    }
  };

  const handleBulkImport = async (data: any[]) => {
    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (const row of data) {
      try {
        const course = courses.find((c) => c.code === row.courseCode);
        if (!course) throw new Error(`Course code ${row.courseCode} not found`);

        const key = `${row.day}-${row.timeSlot}`;
        const existingSlot = timetable[key];

        if (existingSlot && existingSlot.length > 0) {
          // If a slot for this EXACT course/dept exists, update it, otherwise add new
          const specificSlot = existingSlot.find((s: any) => s.courseCode === row.courseCode);
          const { startTime, endTime } = parseTimeSlot(row.timeSlot);
          if (specificSlot) {
            await api.patch(`/timetable/${specificSlot.id}`, {
              courseId: course.id,
              courseName: course.name,
              courseCode: course.code,
              day: row.day,
              startTime,
              endTime,
              room: row.room || 'TBD',
            });
          } else {
            const { facultyId, facultyName } = getFacultyPayload(course);
            await api.post('/timetable', {
              day: row.day,
              startTime,
              endTime,
              courseId: course.id,
              courseName: course.name,
              courseCode: course.code,
              facultyId,
              facultyName,
              room: row.room || 'TBD',
              department: course.department,
            });
          }
        } else {
          const { startTime, endTime } = parseTimeSlot(row.timeSlot);
          const { facultyId, facultyName } = getFacultyPayload(course);
          await api.post('/timetable', {
            day: row.day,
            startTime,
            endTime,
            courseId: course.id,
            courseName: course.name,
            courseCode: course.code,
            facultyId,
            facultyName,
            room: row.room || 'TBD',
            department: course.department,
          });
        }
        successCount++;
      } catch (error) {
        failCount++;
        errors.push(`${row.courseCode}: ${(error as Error).message}`);
      }
    }

    await fetchData();
    return { success: successCount, failed: failCount, errors };
  };

  const exportTimetable = async () => {
    const exportData = Object.values(timetable).flatMap((slotGroup: any) =>
      (Array.isArray(slotGroup) ? slotGroup : [slotGroup]).map((slot: any) => ({
        day: slot.day,
        timeSlot: slot.timeSlot,
        courseCode: slot.courseCode,
        courseName: slot.courseName,
        room: slot.room,
      }))
    );

    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Timetable');

    worksheet.columns = [
      { header: 'day', key: 'day' },
      { header: 'timeSlot', key: 'timeSlot' },
      { header: 'courseCode', key: 'courseCode' },
      { header: 'courseName', key: 'courseName' },
      { header: 'room', key: 'room' },
    ];

    exportData.forEach((row) => worksheet.addRow(row));

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timetable_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Timetable exported successfully!');
  };

  const bulkUploadTemplate = ['day', 'timeSlot', 'courseCode', 'room'];

  const sampleBulkData = [
    { day: 'Monday', timeSlot: '09:00-10:00', courseCode: 'MATH101', room: '101' },
    { day: 'Wednesday', timeSlot: '11:00-12:00', courseCode: 'ENG202', room: '204' },
  ];

  const handleAutoGenerate = async () => {
    if (!canAutoGenerate) {
      toast.error('Only college admins can auto-generate timetables');
      return;
    }

    setGenerating(true);
    try {
      const allCoursesRaw = await fetchAllPages<any>('/courses');
      const allCourses: CourseSchedule[] = allCoursesRaw.map((course: any) => {
        const { facultyId, facultyName } = getFacultyPayload(course);
        return {
          courseId: course.id,
          courseName: course.name,
          courseCode: course.code,
          facultyId: facultyId || '',
          facultyName: facultyName || '',
          department: (course.department || '').trim(),
          semester: course.semester || 1,
          credits: course.credits || 3,
        };
      });

      // Get all unique departments
      const departments = [...new Set(allCourses.map((c) => c.department))].filter(
        Boolean
      ) as string[];

      // Generate timetable using the new grouping logic
      const { entries, summary } = generateFullTimetable(allCourses, departments);

      const chunkArray = <T,>(array: T[], size: number): T[][] => {
        const result = [];
        for (let i = 0; i < array.length; i += size) {
          result.push(array.slice(i, i + size));
        }
        return result;
      };

      const existingTimetable = await fetchAllPages<any>('/timetable');
      const deleteChunks = chunkArray(existingTimetable, 20);
      for (const chunk of deleteChunks) {
        const deleteResults = await Promise.allSettled(
          chunk.map((item: any) => api.delete(`/timetable/${item.id}`))
        );
        const fatalDeleteErrors = deleteResults
          .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
          .map((result) => result.reason)
          .filter((error) => !isAxiosStatus(error, 404));

        if (fatalDeleteErrors.length > 0) {
          throw fatalDeleteErrors[0];
        }
      }

      const addChunks = chunkArray(entries, 20);
      for (const chunk of addChunks) {
        const addPromises = chunk.map((entry) => {
          const { startTime, endTime } = parseTimeSlot(entry.timeSlot);
          return api.post('/timetable', {
            day: entry.day,
            startTime,
            endTime,
            courseId: entry.courseId,
            courseName: entry.courseName,
            courseCode: entry.courseCode,
            facultyId: getValidUuid(entry.facultyId),
            facultyName: entry.facultyName || undefined,
            department: entry.department || undefined,
            room: entry.room || 'TBD',
            semester: entry.semester || undefined,
            batch: entry.batch || undefined,
          });
        });
        await Promise.all(addPromises);
      }

      await fetchData(); // Refresh display
      toast.success(`Timetable generated! ${summary}`);
    } catch (error) {
      console.error('Error generating timetable:', error);
      if (isAxiosStatus(error, 401)) {
        toast.error('Session expired. Please login again.');
        router.replace('/auth');
        return;
      }
      toast.error('Failed to generate timetable');
    } finally {
      setGenerating(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, course: any) => {
    if (!canManageAllTimetable) return;
    setDraggedCourse(course);
    e.dataTransfer!.effectAllowed = 'copy';
    e.dataTransfer!.setData('text/plain', JSON.stringify(course));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canManageAllTimetable) return;
    e.dataTransfer!.dropEffect = 'copy';

    // Auto-scroll when dragging near edges
    const scrollContainer = document.querySelector('.timetable-scroll-container');
    if (scrollContainer) {
      const rect = scrollContainer.getBoundingClientRect();
      const scrollThreshold = 50;
      const scrollSpeed = 10;

      if (e.clientY < rect.top + scrollThreshold) {
        scrollContainer.scrollTop -= scrollSpeed;
      } else if (e.clientY > rect.bottom - scrollThreshold) {
        scrollContainer.scrollTop += scrollSpeed;
      }

      if (e.clientX < rect.left + scrollThreshold) {
        scrollContainer.scrollLeft -= scrollSpeed;
      } else if (e.clientX > rect.right - scrollThreshold) {
        scrollContainer.scrollLeft += scrollSpeed;
      }
    }
  };

  const handleDrop = async (e: React.DragEvent, day: string, timeSlot: string) => {
    e.preventDefault();
    if (!draggedCourse) return;

    const key = `${day}-${timeSlot}`;
    const existingSlot = timetable[key];

    try {
      // Check if this course already has a slot at this time
      const existingEntry = existingSlot?.find((s: any) => s.courseId === draggedCourse.id);

      if (existingEntry) {
        const { startTime, endTime } = parseTimeSlot(timeSlot);
        await api.patch(`/timetable/${existingEntry.id}`, {
          day,
          startTime,
          endTime,
        });
      } else {
        const { startTime, endTime } = parseTimeSlot(timeSlot);
        const { facultyId, facultyName } = getFacultyPayload(draggedCourse);
        await api.post('/timetable', {
          day,
          startTime,
          endTime,
          courseId: draggedCourse.id,
          courseName: draggedCourse.name,
          courseCode: draggedCourse.code,
          facultyId,
          facultyName,
          department: draggedCourse.department || undefined,
          room: 'TBD',
        });
      }

      toast.success('Timetable updated!');
      await fetchData();
      setDraggedCourse(null);
    } catch (error) {
      console.error('Error updating timetable:', error);
      toast.error('Failed to update timetable');
    }
  };

  const handleDragEnd = () => {
    setDraggedCourse(null);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if actually leaving the table
    if (
      (e.target as HTMLElement).tagName === 'TD' ||
      (e.target as HTMLElement).tagName === 'TABLE'
    ) {
      e.preventDefault();
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('Remove this class from timetable?')) return;
    try {
      await api.delete(`/timetable/${slotId}`);
      toast.success('Slot removed!');
      fetchData();
    } catch (error) {
      console.error('Error deleting slot:', error);
      toast.error('Failed to remove slot');
    }
  };

  const openSlotDialog = (day: string, timeSlot: string) => {
    const key = `${day}-${timeSlot}`;
    const slotsInCell = timetable[key] || [];

    // Only edit the first slot by default. If empty, starts a new form.
    const slot = slotsInCell.length > 0 ? slotsInCell[0] : null;

    setSelectedSlot({ day, timeSlot, ...slot });
    setSlotForm({
      courseId: slot?.courseId || '',
      room: slot?.room || '',
    });
    setShowSlotDialog(true);
  };

  const handleSaveSlot = async () => {
    if (!selectedSlot) return;

    const key = `${selectedSlot.day}-${selectedSlot.timeSlot}`;
    const existingSlot = timetable[key];
    const course = courses.find((c) => c.id === slotForm.courseId);

    if (!course) {
      toast.error('Please select a course');
      return;
    }

    try {
      const { facultyId, facultyName } = getFacultyPayload(course);
      if (selectedSlot.id) {
        const { startTime, endTime } = parseTimeSlot(selectedSlot.timeSlot);
        await api.patch(`/timetable/${selectedSlot.id}`, {
          day: selectedSlot.day,
          startTime,
          endTime,
          courseId: course.id,
          courseName: course.name,
          courseCode: course.code,
          facultyId,
          facultyName,
          department: course.department || undefined,
          room: slotForm.room,
        });
      } else {
        const { startTime, endTime } = parseTimeSlot(selectedSlot.timeSlot);
        await api.post('/timetable', {
          day: selectedSlot.day,
          startTime,
          endTime,
          courseId: course.id,
          courseName: course.name,
          courseCode: course.code,
          facultyId,
          facultyName,
          department: course.department || undefined,
          room: slotForm.room,
        });
      }

      toast.success('Slot saved!');
      setShowSlotDialog(false);
      fetchData();
    } catch (error) {
      console.error('Error saving slot:', error);
      toast.error('Failed to save slot');
    }
  };

  const isSlotOwnedByFaculty = (slot: any) => {
    if (!canScheduleExtraClass || !user?.uid) return false;
    return (
      slot?.facultyId === user.uid ||
      (!!facultyDisplayName && slot?.facultyName === facultyDisplayName)
    );
  };

  const availableFacultySlots = DAYS.flatMap((day) =>
    TIME_SLOTS.filter((timeSlot) => timeSlot !== '13:00-14:00').map((timeSlot) => {
      const key = `${day}-${timeSlot}`;
      const slots = timetable[key] || [];
      const hasFacultyClass = slots.some((slot: any) => isSlotOwnedByFaculty(slot));
      return hasFacultyClass ? null : { key, label: `${day} ${timeSlot}` };
    })
  ).filter(Boolean) as Array<{ key: string; label: string }>;

  const handleScheduleExtraClass = async () => {
    if (!canScheduleExtraClass) return;

    // Use selected course from form
    const course = courses.find((item) => item.id === extraClassForm.courseId);
    if (!course) {
      toast.error('Please select a course');
      return;
    }

    if (!extraClassForm.slotKey || extraClassForm.slotKey.endsWith('-')) {
      toast.error('Please select a time slot');
      return;
    }

    const [day, ...timeSlotParts] = extraClassForm.slotKey.split('-');
    const timeSlot = timeSlotParts.join('-');
    const { startTime, endTime } = parseTimeSlot(timeSlot);
    const slotsAtTime = timetable[extraClassForm.slotKey] || [];

    const hasFacultyClash = slotsAtTime.some((slot: any) => isSlotOwnedByFaculty(slot));
    if (hasFacultyClash) {
      toast.error('You already have a class in this slot');
      return;
    }

    const room = extraClassForm.room.trim() || 'TBD';
    const roomOccupied = slotsAtTime.some(
      (slot: any) => String(slot.room || '').toLowerCase() === room.toLowerCase()
    );
    if (roomOccupied) {
      toast.error('Selected room is occupied in this slot');
      return;
    }

    try {
      const { facultyId, facultyName } = getFacultyPayload({
        ...course,
        facultyId: user.uid,
        facultyName: facultyDisplayName || course.facultyName,
      });

      await api.post('/timetable', {
        day,
        startTime,
        endTime,
        courseId: course.id,
        courseName: course.name,
        courseCode: course.code,
        facultyId,
        facultyName,
        department: course.department || undefined,
        semester: course.semester || undefined,
        room,
      });

      toast.success('Extra class scheduled');
      setShowExtraClassDialog(false);
      setExtraClassForm({ courseId: '', slotKey: '', room: '' });
      await fetchData();
    } catch (error) {
      console.error('Error scheduling extra class:', error);
      toast.error('Failed to schedule extra class');
    }
  };

  // Helper to determine status of a time slot relative to NOW
  const getTimeStatus = (slotTime: string, day: string) => {
    const now = new Date();
    const currentDayName = DAYS[now.getDay() - 1] || 'Sunday'; // Mon=1 -> Index 0

    // If the selected day isn't today, everything is just "upcoming" (or normal)
    if (day !== currentDayName) return 'upcoming';

    const [start, end] = slotTime.split('-').map((t) => parseInt(t.split(':')[0]));
    const currentHour = now.getHours();

    if (currentHour >= end) return 'completed'; // Class over
    if (currentHour >= start && currentHour < end) return 'live'; // Class in progress
    return 'upcoming';
  };

  const handleFilterChange = (next: Partial<TimetableFilterValues>) => {
    setFilterValues((previous) => ({ ...previous, ...next }));
  };

  const applySlotFilters = (slots: any[]) => {
    let filteredSlots = slots || [];

    if (user.role === 'student') {
      filteredSlots = filteredSlots.filter((slot: any) =>
        studentEnrollments.includes(slot.courseId)
      );
    }

    if (user.role === 'faculty' && facultyDepartment) {
      filteredSlots = filteredSlots.filter((slot: any) => slot.department === facultyDepartment);
    }

    if (canManageAllTimetable && filterValues.department !== 'all' && filteredSlots.length > 0) {
      filteredSlots = filteredSlots.filter(
        (slot: any) => slot.department === filterValues.department
      );
    }

    if (filterValues.academicYear !== 'all' && filteredSlots.length > 0) {
      filteredSlots = filteredSlots.filter((slot: any) => {
        const year = getAcademicYearFromSemester(slot.semester);
        return year !== null && year === Number(filterValues.academicYear);
      });
    }

    if (canManageAllTimetable && filterValues.batch !== 'all' && filteredSlots.length > 0) {
      filteredSlots = filteredSlots.filter(
        (slot: any) => String(slot.batch || '').trim() === filterValues.batch
      );
    }

    const courseQuery = filterValues.courseQuery.trim().toLowerCase();
    if (canManageAllTimetable && courseQuery && filteredSlots.length > 0) {
      filteredSlots = filteredSlots.filter((slot: any) =>
        `${slot.courseCode || ''} ${slot.courseName || ''}`.toLowerCase().includes(courseQuery)
      );
    }

    const facultyQuery = filterValues.facultyQuery.trim().toLowerCase();
    if (canManageAllTimetable && facultyQuery && filteredSlots.length > 0) {
      filteredSlots = filteredSlots.filter((slot: any) =>
        String(slot.facultyName || '')
          .toLowerCase()
          .includes(facultyQuery)
      );
    }

    const roomQuery = filterValues.roomQuery.trim().toLowerCase();
    if (canManageAllTimetable && roomQuery && filteredSlots.length > 0) {
      filteredSlots = filteredSlots.filter((slot: any) =>
        String(slot.room || '')
          .toLowerCase()
          .includes(roomQuery)
      );
    }

    return filteredSlots;
  };

  if (loading) {
    return (
      <div className="space-y-6 md:space-y-8">
        <div className="h-8 w-56 bg-muted rounded-md animate-pulse" />
        <LoadingGrid
          count={3}
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          itemClassName="h-28 rounded-md"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <Calendar className="w-8 h-8 text-primary" />
            Timetable
          </h1>
          <p className="text-muted-foreground mt-1 font-medium italic">
            Official academic schedule for Punjab Engineering College
          </p>
        </div>
        <div className="hidden md:flex flex-wrap items-center gap-2 md:gap-3">
          <Button
            variant={isWeeklyView ? 'default' : 'outline'}
            size="sm"
            className="hidden sm:flex gap-2 font-bold uppercase tracking-wider text-[10px] border-2"
            onClick={() => setIsWeeklyView(!isWeeklyView)}
          >
            {isWeeklyView ? <List className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
            {isWeeklyView ? 'Show Today Only' : 'Show Full Week Grid'}
          </Button>

          <PDFExportButton
            onExport={async () => {
              const { exportTimetablePDF } = await import('@/lib/pdfExport');
              const timetableData = Object.entries(timetable).flatMap(
                ([key, slots]: [string, any]) => {
                  const [day, ...timeSlotParts] = key.split('-');
                  const timeSlot = timeSlotParts.join('-');
                  return (Array.isArray(slots) ? slots : [slots]).map((slot: any) => ({
                    day,
                    startTime: timeSlot.split('-')[0],
                    endTime: timeSlot.split('-')[1],
                    courseName: slot.courseName || slot.courseCode,
                    room: slot.room,
                    facultyName: slot.facultyName,
                  }));
                }
              );
              exportTimetablePDF(timetableData, 'Weekly Timetable');
            }}
            label="PDF"
            size="sm"
            variant="outline"
          />
          {canManageAllTimetable && (
            <>
              <Button onClick={handleAutoGenerate} disabled={generating} className="gap-2">
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    Auto Generate Timetable
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowBulkUpload(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Bulk Upload
              </Button>
            </>
          )}
          {canScheduleExtraClass && (
            <Button variant="outline" onClick={() => setShowExtraClassDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Schedule Extra Class
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="text-[10px] font-bold uppercase"
            onClick={exportTimetable}
          >
            <Download className="w-3 h-3 mr-1.5" />
            Export
          </Button>
        </div>
      </div>

      {/* Available Courses (Admin Only) */}
      {canManageAllTimetable && (
        <div className="card-elevated ui-card-pad">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
              <GripVertical className="w-5 h-5" />
              Available Courses (Drag to Schedule)
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCoursesWrapperOpen((previous) => !previous)}
              className="gap-2"
            >
              {coursesWrapperOpen ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Collapse
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Expand
                </>
              )}
            </Button>
          </div>
          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              coursesWrapperOpen
                ? 'max-h-[80vh] opacity-100'
                : 'max-h-0 opacity-0 pointer-events-none'
            }`}
          >
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
              <div className="available-courses-wrapper rounded-lg border border-border/40 bg-background/30 p-3">
                <div className="flex flex-wrap gap-3">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, course)}
                      onDragEnd={handleDragEnd}
                      className="px-4 py-3 bg-primary/10 border-2 border-primary/20 rounded-lg cursor-move hover:bg-primary/20 active:bg-primary/30 transition-all select-none md:hover:shadow-md md:hover:border-primary/40 opacity-100 hover:opacity-95"
                    >
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">{course.code}</p>
                          <p className="text-xs text-muted-foreground">{course.name}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isFaculty && facultyDepartment && (
        <div className="card-elevated ui-card-pad">
          <p className="text-sm font-medium text-foreground">
            Showing branch timetable: <span className="text-primary">{facultyDepartment}</span>
          </p>
        </div>
      )}

      <TimetableFilters
        canManageAllTimetable={canManageAllTimetable}
        isFaculty={isFaculty}
        facultyDepartment={facultyDepartment}
        departmentOptions={availableDepartments}
        batchOptions={availableBatches}
        values={filterValues}
        onChange={handleFilterChange}
      />

      {/* Mobile Primary Actions Toolbar */}
      <div className="md:hidden grid grid-cols-3 gap-2 mb-6 p-2 rounded-2xl bg-muted/20 border border-border/40">
        <Button
          variant="outline"
          size="sm"
          className="h-10 text-[9px] font-black uppercase tracking-tighter rounded-xl"
          onClick={async () => {
            const { exportTimetablePDF } = await import('@/lib/pdfExport');
            const timetableData = Object.entries(timetable).flatMap(
              ([key, slots]: [string, any]) => {
                const [day, ...timeSlotParts] = key.split('-');
                return (Array.isArray(slots) ? slots : [slots]).map((slot: any) => ({
                  day,
                  startTime: timeSlotParts.join('-').split('-')[0],
                  endTime: timeSlotParts.join('-').split('-')[1],
                  courseName: slot.courseName || slot.courseCode,
                  room: slot.room,
                  facultyName: slot.facultyName,
                }));
              }
            );
            exportTimetablePDF(timetableData, 'Weekly Timetable');
          }}
        >
          <FileText className="w-3.5 h-3.5 mr-1" />
          PDF
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-10 text-[9px] font-black uppercase tracking-tighter rounded-xl"
          onClick={exportTimetable}
        >
          <Download className="w-3.5 h-3.5 mr-1" />
          EXPORT
        </Button>
        <Button
          variant={isWeeklyView ? 'default' : 'outline'}
          size="sm"
          className={`h-10 text-[9px] font-black uppercase tracking-tighter rounded-xl ${isWeeklyView ? 'glow-primary ring-2 ring-primary/20' : ''}`}
          onClick={() => setIsWeeklyView(!isWeeklyView)}
        >
          {isWeeklyView ? (
            <List className="w-3.5 h-3.5 mr-1" />
          ) : (
            <Calendar className="w-3.5 h-3.5 mr-1" />
          )}
          {isWeeklyView ? 'Daily' : 'Weekly'}
        </Button>
      </div>

      <TimetableMobileView
        timetable={timetable}
        DAYS={DAYS}
        TIME_SLOTS={TIME_SLOTS}
        isWeeklyView={isWeeklyView}
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
        applySlotFilters={applySlotFilters}
        getTimeStatus={getTimeStatus}
        canManageAllTimetable={canManageAllTimetable}
        openSlotDialog={openSlotDialog}
        user={user}
        studentAttendanceMap={studentAttendanceMap}
        facultyDisplayName={facultyDisplayName}
      />

      <TimetableDesktopView
        timetable={timetable}
        DAYS={DAYS}
        TIME_SLOTS={TIME_SLOTS}
        canManageAllTimetable={canManageAllTimetable}
        draggedCourse={draggedCourse}
        user={user}
        studentAttendanceMap={studentAttendanceMap}
        filterValues={filterValues}
        handleDragOver={handleDragOver}
        handleDragLeave={handleDragLeave}
        handleDrop={handleDrop}
        handleDragEnd={handleDragEnd}
        openSlotDialog={openSlotDialog}
        applySlotFilters={applySlotFilters}
        handleDeleteSlot={handleDeleteSlot}
      />

      {/* Edit Slot Dialog (Admin) */}
      {showSlotDialog && (
        <EditSlotDialog
          open={showSlotDialog}
          onOpenChange={setShowSlotDialog}
          selectedSlot={selectedSlot}
          courses={courses}
          slotForm={slotForm}
          setSlotForm={setSlotForm}
          onSave={handleSaveSlot}
        />
      )}

      {/* Faculty Extra Class Dialog */}
      {showExtraClassDialog && (
        <ExtraClassDialog
          open={showExtraClassDialog}
          onOpenChange={setShowExtraClassDialog}
          extraClassForm={extraClassForm}
          setExtraClassForm={setExtraClassForm}
          courses={courses}
          timetable={timetable}
          days={DAYS}
          timeSlots={TIME_SLOTS}
          isSlotOwnedByFaculty={isSlotOwnedByFaculty}
          onSchedule={handleScheduleExtraClass}
          onCancel={() => {
            setShowExtraClassDialog(false);
            setExtraClassForm({ courseId: '', slotKey: '', room: '' });
          }}
        />
      )}

      {/* Bulk Upload Dialog */}
      <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Upload Timetable</DialogTitle>
            <DialogDescription>
              Upload Excel/CSV file with columns: day, timeSlot, courseCode, room
            </DialogDescription>
          </DialogHeader>
          <BulkUpload
            entityType="timetable"
            templateColumns={bulkUploadTemplate}
            onImport={handleBulkImport}
            sampleData={sampleBulkData}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
