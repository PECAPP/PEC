'use client';

import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  Loader2,
  Plus,
  Trash2,
  Edit,
  Save,
  GripVertical,
  Upload,
  Download,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import BulkUpload from "@/components/BulkUpload";

import PDFExportButton from "@/components/common/PDFExportButton";
import * as XLSX from "xlsx";
import { useRouter } from 'next/navigation';
;
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/usePermissions";
import {
  generateFullTimetable,
  type CourseSchedule,
} from "@/lib/timetableGenerator";
import { EmptyState, LoadingGrid } from '@/components/common/AsyncState';
import TimetableFilters, { type TimetableFilterValues } from "@/components/timetable/TimetableFilters";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const TIME_SLOTS = [
  "08:00-09:00",
  "09:00-10:00",
  "10:00-11:00",
  "11:00-12:00",
  "12:00-13:00",
  "13:00-14:00", // LUNCH
  "14:00-15:00",
  "15:00-16:00",
  "16:00-17:00",
];

type ApiResponse<T> = { success: boolean; data: T; meta?: any };
const MAX_PAGE_SIZE = 200;

const extractData = <T,>(response: any): T => {
  if (response?.data?.data !== undefined) return response.data.data as T;
  return response?.data as T;
};

const parseTimeSlot = (timeSlot: string) => {
  const [startTime, endTime] = timeSlot.split("-");
  return { startTime, endTime };
};

const getAcademicYearFromSemester = (semester: unknown) => {
  const numericSemester = Number(semester);
  if (!Number.isFinite(numericSemester) || numericSemester <= 0) return null;
  return Math.ceil(numericSemester / 2);
};

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const getValidUuid = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return UUID_V4_PATTERN.test(trimmed) ? trimmed : undefined;
};

const getFacultyPayload = (course: any) => {
  const facultyId = getValidUuid(course?.facultyId ?? course?.instructor);
  const instructorName =
    typeof course?.instructor === "string" ? course.instructor : "";
  const facultyName =
    course?.facultyName || course?.instructorName || instructorName || undefined;

  return { facultyId, facultyName };
};

const isAxiosStatus = (error: unknown, status: number) =>
  (error as any)?.response?.status === status;

const fetchAllPages = async <T,>(
  path: string,
  params: Record<string, unknown> = {},
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
      }),
    ),
  );

  return [
    ...firstItems,
    ...remainingResponses.flatMap((response) => extractData<T[]>(response) || []),
  ];
};

export default function Timetable() {
  const router = useRouter();
  const { isFaculty, user, loading: authLoading } = usePermissions();
  const userRole = user?.role || "";
  const isCollegeAdmin = userRole === "admin" || userRole === "college_admin" || userRole === "moderator";
  const canAutoGenerate = isCollegeAdmin;
  const canManageAllTimetable = isCollegeAdmin;
  const canScheduleExtraClass = userRole === "faculty";
  const facultyDisplayName = ((user as any)?.fullName || (user as any)?.name || "").trim();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<any>({});
  const [draggedCourse, setDraggedCourse] = useState<any>(null);
  const [showSlotDialog, setShowSlotDialog] = useState(false);
  
  // Smart Day Selection: Default to today if Mon-Sat, else Monday
  const todayIndex = new Date().getDay(); // 0=Sun, 1=Mon...
  const initialDay = todayIndex > 0 && todayIndex <= 6 ? DAYS[todayIndex - 1] : "Monday";
  const [selectedDay, setSelectedDay] = useState(initialDay);

  const [generating, setGenerating] = useState(false);
  const [filterValues, setFilterValues] = useState<TimetableFilterValues>({
    department: "all",
    academicYear: "all",
    batch: "all",
    courseQuery: "",
    facultyQuery: "",
    roomQuery: "",
  });
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [slotForm, setSlotForm] = useState({
    courseId: "",
    room: "",
  });
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showExtraClassDialog, setShowExtraClassDialog] = useState(false);
  const [extraClassForm, setExtraClassForm] = useState({
    courseId: "",
    slotKey: "",
    room: "",
  });
  const [coursesWrapperOpen, setCoursesWrapperOpen] = useState(true);
  const [facultyDepartment, setFacultyDepartment] = useState("");
  const [availableDepartments, setAvailableDepartments] = useState<string[]>([]);
  const [availableBatches, setAvailableBatches] = useState<string[]>([]);

  const [studentEnrollments, setStudentEnrollments] = useState<string[]>([]);

  useEffect(() => {
    if (authLoading) return; // Wait for ({} as any) to load

    if (!user) {
      router.replace('/auth');
      return;
    }

    const loadData = async () => {
      try {
        await fetchData();
        if (user.role === "student" && user.uid) {
          const enrollments = await fetchAllPages<any>('/enrollments', {
            studentId: user.uid,
            status: 'active',
          });
          const courseIds = enrollments.map((item: any) => item.courseId);
          setStudentEnrollments(courseIds);
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [authLoading, user, router]);

  const fetchData = async () => {
    try {
      const allCourses = await fetchAllPages<any>('/courses');
      const facultyOwnedCourses =
        isFaculty && user?.uid
          ? allCourses.filter(
              (course: any) =>
                course.instructor === user.uid || course.facultyId === user.uid,
            )
          : [];
      
      // Resolve faculty department from owned courses, or fall back to user's department
      const resolvedFacultyDepartment = (
        (user as any)?.department ||
        facultyOwnedCourses[0]?.department ||
        ""
      ).trim();

      if (isFaculty) {
        setFacultyDepartment(resolvedFacultyDepartment);
      } else {
        setFacultyDepartment("");
      }

      // For faculty: show owned courses; if none, fall back to department courses
      let coursesData: any[] = [];
      if (isFaculty) {
        if (facultyOwnedCourses.length > 0) {
          coursesData = facultyOwnedCourses;
        } else if (resolvedFacultyDepartment) {
          // Fall back to all courses in faculty's department
          coursesData = allCourses.filter(
            (course: any) => 
              (course.department || "").trim() === resolvedFacultyDepartment
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
            .map((item: any) => String(item?.department || "").trim())
            .filter(Boolean),
        ),
      ).sort();
      const batchesFromData = Array.from(
        new Set(
          timetableItems
            .map((item: any) => String(item?.batch || "").trim())
            .filter(Boolean),
        ),
      ).sort();

      setAvailableDepartments(departmentsFromData);
      setAvailableBatches(batchesFromData);
      setTimetable(timetableData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load timetable data");
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
          const specificSlot = existingSlot.find(
            (s: any) => s.courseCode === row.courseCode
          );
          const { startTime, endTime } = parseTimeSlot(row.timeSlot);
          if (specificSlot) {
            await api.patch(`/timetable/${specificSlot.id}`, {
              courseId: course.id,
              courseName: course.name,
              courseCode: course.code,
              day: row.day,
              startTime,
              endTime,
              room: row.room || "TBD",
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
              room: row.room || "TBD",
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
            room: row.room || "TBD",
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

  const exportTimetable = () => {
    const exportData = Object.values(timetable).flatMap((slotGroup: any) =>
      (Array.isArray(slotGroup) ? slotGroup : [slotGroup]).map((slot: any) => ({
        day: slot.day,
        timeSlot: slot.timeSlot,
        courseCode: slot.courseCode,
        courseName: slot.courseName,
        room: slot.room,
      })),
    );

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Timetable");
    XLSX.writeFile(
      workbook,
      `timetable_export_${new Date().toISOString().split("T")[0]}.xlsx`
    );
    toast.success("Timetable exported successfully!");
  };

  const bulkUploadTemplate = ["day", "timeSlot", "courseCode", "room"];

  const sampleBulkData = [
    { day: "Monday", timeSlot: "09:00-10:00", courseCode: "MATH101", room: "101" },
    { day: "Wednesday", timeSlot: "11:00-12:00", courseCode: "ENG202", room: "204" },
  ];

  const handleAutoGenerate = async () => {
    if (!canAutoGenerate) {
      toast.error("Only college admins can auto-generate timetables");
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
          facultyId: facultyId || "",
          facultyName: facultyName || "",
          department: (course.department || "").trim(),
          semester: course.semester || 1,
          credits: course.credits || 3,
        };
      });

      // Get all unique departments
      const departments = [
        ...new Set(allCourses.map((c) => c.department)),
      ].filter(Boolean) as string[];

      // Generate timetable using the new grouping logic
      const { entries, summary } = generateFullTimetable(
        allCourses,
        departments
      );

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
          chunk.map((item: any) => api.delete(`/timetable/${item.id}`)),
        );
        const fatalDeleteErrors = deleteResults
          .filter((result): result is PromiseRejectedResult => result.status === "rejected")
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
      console.error("Error generating timetable:", error);
      if (isAxiosStatus(error, 401)) {
        toast.error("Session expired. Please login again.");
        router.replace("/auth");
        return;
      }
      toast.error("Failed to generate timetable");
    } finally {
      setGenerating(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, course: any) => {
    if (!canManageAllTimetable) return;
    setDraggedCourse(course);
    e.dataTransfer!.effectAllowed = "copy";
    e.dataTransfer!.setData("text/plain", JSON.stringify(course));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canManageAllTimetable) return;
    e.dataTransfer!.dropEffect = "copy";
    
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

  const handleDrop = async (
    e: React.DragEvent,
    day: string,
    timeSlot: string
  ) => {
    e.preventDefault();
    if (!draggedCourse) return;

    const key = `${day}-${timeSlot}`;
    const existingSlot = timetable[key];

    try {
      // Check if this course already has a slot at this time
      const existingEntry = existingSlot?.find(
        (s: any) => s.courseId === draggedCourse.id
      );

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
          room: "TBD",
        });
      }

      toast.success("Timetable updated!");
      await fetchData();
      setDraggedCourse(null);
    } catch (error) {
      console.error("Error updating timetable:", error);
      toast.error("Failed to update timetable");
    }
  };

  const handleDragEnd = () => {
    setDraggedCourse(null);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if actually leaving the table
    if ((e.target as HTMLElement).tagName === 'TD' || (e.target as HTMLElement).tagName === 'TABLE') {
      e.preventDefault();
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm("Remove this class from timetable?")) return;
    try {
      await api.delete(`/timetable/${slotId}`);
      toast.success("Slot removed!");
      fetchData();
    } catch (error) {
      console.error("Error deleting slot:", error);
      toast.error("Failed to remove slot");
    }
  };

  const openSlotDialog = (day: string, timeSlot: string) => {
    const key = `${day}-${timeSlot}`;
    const slotsInCell = timetable[key] || [];
    
    // Only edit the first slot by default. If empty, starts a new form.
    const slot = slotsInCell.length > 0 ? slotsInCell[0] : null;

    setSelectedSlot({ day, timeSlot, ...slot });
    setSlotForm({
      courseId: slot?.courseId || "",
      room: slot?.room || "",
    });
    setShowSlotDialog(true);
  };

  const handleSaveSlot = async () => {
    if (!selectedSlot) return;

    const key = `${selectedSlot.day}-${selectedSlot.timeSlot}`;
    const existingSlot = timetable[key];
    const course = courses.find((c) => c.id === slotForm.courseId);

    if (!course) {
      toast.error("Please select a course");
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

      toast.success("Slot saved!");
      setShowSlotDialog(false);
      fetchData();
    } catch (error) {
      console.error("Error saving slot:", error);
      toast.error("Failed to save slot");
    }
  };

  const isSlotOwnedByFaculty = (slot: any) => {
    if (!canScheduleExtraClass || !user?.uid) return false;
    return (
      slot?.facultyId === user.uid ||
      (!!facultyDisplayName && slot?.facultyName === facultyDisplayName)
    );
  };

  const availableFacultySlots = DAYS
    .flatMap((day) =>
      TIME_SLOTS.filter((timeSlot) => timeSlot !== "13:00-14:00").map((timeSlot) => {
        const key = `${day}-${timeSlot}`;
        const slots = timetable[key] || [];
        const hasFacultyClass = slots.some((slot: any) => isSlotOwnedByFaculty(slot));
        return hasFacultyClass ? null : { key, label: `${day} ${timeSlot}` };
      }),
    )
    .filter(Boolean) as Array<{ key: string; label: string }>;

  const handleScheduleExtraClass = async () => {
    if (!canScheduleExtraClass) return;

    // Use selected course from form
    const course = courses.find((item) => item.id === extraClassForm.courseId);
    if (!course) {
      toast.error("Please select a course");
      return;
    }
    
    if (!extraClassForm.slotKey || extraClassForm.slotKey.endsWith("-")) {
      toast.error("Please select a time slot");
      return;
    }

    const [day, ...timeSlotParts] = extraClassForm.slotKey.split("-");
    const timeSlot = timeSlotParts.join("-");
    const { startTime, endTime } = parseTimeSlot(timeSlot);
    const slotsAtTime = timetable[extraClassForm.slotKey] || [];

    const hasFacultyClash = slotsAtTime.some((slot: any) => isSlotOwnedByFaculty(slot));
    if (hasFacultyClash) {
      toast.error("You already have a class in this slot");
      return;
    }

    const room = extraClassForm.room.trim() || "TBD";
    const roomOccupied = slotsAtTime.some(
      (slot: any) => String(slot.room || "").toLowerCase() === room.toLowerCase(),
    );
    if (roomOccupied) {
      toast.error("Selected room is occupied in this slot");
      return;
    }

    try {
      const { facultyId, facultyName } = getFacultyPayload({
        ...course,
        facultyId: user.uid,
        facultyName: facultyDisplayName || course.facultyName,
      });

      await api.post("/timetable", {
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

      toast.success("Extra class scheduled");
      setShowExtraClassDialog(false);
      setExtraClassForm({ courseId: "", slotKey: "", room: "" });
      await fetchData();
    } catch (error) {
      console.error("Error scheduling extra class:", error);
      toast.error("Failed to schedule extra class");
    }
  };

  // Helper to determine status of a time slot relative to NOW
  const getTimeStatus = (slotTime: string, day: string) => {
      const now = new Date();
      const currentDayName = DAYS[now.getDay() - 1] || "Sunday"; // Mon=1 -> Index 0
      
      // If the selected day isn't today, everything is just "upcoming" (or normal)
      if (day !== currentDayName) return "upcoming"; 

      const [start, end] = slotTime.split('-').map(t => parseInt(t.split(':')[0]));
      const currentHour = now.getHours();

      if (currentHour >= end) return "completed"; // Class over
      if (currentHour >= start && currentHour < end) return "live"; // Class in progress
      return "upcoming";
  };

  const handleFilterChange = (next: Partial<TimetableFilterValues>) => {
    setFilterValues((previous) => ({ ...previous, ...next }));
  };

  const applySlotFilters = (slots: any[]) => {
    let filteredSlots = slots || [];

    if (user.role === "student") {
      filteredSlots = filteredSlots.filter((slot: any) =>
        studentEnrollments.includes(slot.courseId),
      );
    }

    if (user.role === "faculty" && facultyDepartment) {
      filteredSlots = filteredSlots.filter(
        (slot: any) => slot.department === facultyDepartment,
      );
    }

    if (
      canManageAllTimetable &&
      filterValues.department !== "all" &&
      filteredSlots.length > 0
    ) {
      filteredSlots = filteredSlots.filter(
        (slot: any) => slot.department === filterValues.department,
      );
    }

    if (filterValues.academicYear !== "all" && filteredSlots.length > 0) {
      filteredSlots = filteredSlots.filter((slot: any) => {
        const year = getAcademicYearFromSemester(slot.semester);
        return year !== null && year === Number(filterValues.academicYear);
      });
    }

    if (
      canManageAllTimetable &&
      filterValues.batch !== "all" &&
      filteredSlots.length > 0
    ) {
      filteredSlots = filteredSlots.filter(
        (slot: any) => String(slot.batch || "").trim() === filterValues.batch,
      );
    }

    const courseQuery = filterValues.courseQuery.trim().toLowerCase();
    if (canManageAllTimetable && courseQuery && filteredSlots.length > 0) {
      filteredSlots = filteredSlots.filter((slot: any) =>
        `${slot.courseCode || ""} ${slot.courseName || ""}`
          .toLowerCase()
          .includes(courseQuery),
      );
    }

    const facultyQuery = filterValues.facultyQuery.trim().toLowerCase();
    if (canManageAllTimetable && facultyQuery && filteredSlots.length > 0) {
      filteredSlots = filteredSlots.filter((slot: any) =>
        String(slot.facultyName || "").toLowerCase().includes(facultyQuery),
      );
    }

    const roomQuery = filterValues.roomQuery.trim().toLowerCase();
    if (canManageAllTimetable && roomQuery && filteredSlots.length > 0) {
      filteredSlots = filteredSlots.filter((slot: any) =>
        String(slot.room || "").toLowerCase().includes(roomQuery),
      );
    }

    return filteredSlots;
  };

  if (loading) {
    return (
      <div className="space-y-6 md:space-y-8">
        <div className="h-8 w-56 bg-muted rounded-md animate-pulse" />
        <LoadingGrid count={3} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" itemClassName="h-28 rounded-md" />
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Timetable</h1>
          <p className="text-muted-foreground mt-1">
            {canManageAllTimetable
              ? "Manage course schedule"
              : canScheduleExtraClass
              ? "View and schedule your classes"
              : "View class schedule"}
          </p>
        </div>
        <div className="button-group">
          <PDFExportButton
            onExport={async () => {
              const { exportTimetablePDF } = await import('@/lib/pdfExport');
              const timetableData = Object.entries(timetable).flatMap(
                ([key, slots]: [string, any]) => {
                  const [day, ...timeSlotParts] = key.split("-");
                  const timeSlot = timeSlotParts.join("-");
                  return (Array.isArray(slots) ? slots : [slots]).map(
                    (slot: any) => ({
                      day,
                      startTime: timeSlot.split("-")[0],
                      endTime: timeSlot.split("-")[1],
                      courseName: slot.courseName || slot.courseCode,
                      room: slot.room,
                      facultyName: slot.facultyName,
                    })
                  );
                }
              );
              exportTimetablePDF(timetableData, "Weekly Timetable");
            }}
            label="Export PDF"
            variant="outline"
          />
          {canManageAllTimetable && (
            <>
              <Button
                onClick={handleAutoGenerate}
                disabled={generating}
                className="gap-2"
              >
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
          <Button variant="outline" onClick={exportTimetable}>
            <Download className="w-4 h-4 mr-2" />
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
              coursesWrapperOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
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
                        <p className="text-sm font-semibold text-foreground">
                          {course.code}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {course.name}
                        </p>
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

      {/* Mobile View (Cards) - "Shoe Type Shi" Design */}
      <div className="md:hidden space-y-5">
        {/* Day Selector */}
        <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar snap-x">
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`snap-center shrink-0 px-6 py-2 rounded-full text-sm font-bold transition-all ${
                selectedDay === day
                  ? "bg-primary text-primary-foreground shadow-lg scale-105"
                  : "bg-card text-muted-foreground border border-border"
              }`}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>

        {/* Timeline Feed */}
        <div className="space-y-4">
          {TIME_SLOTS.map((timeSlot) => {
            const key = `${selectedDay}-${timeSlot}`;
            const slotData = timetable[key];
            const isLunch = timeSlot === "13:00-14:00";
            const status = getTimeStatus(timeSlot, selectedDay);
            
            const filteredSlots = applySlotFilters(slotData || []);

            if (isLunch) {
                return (
                    <div key={timeSlot} className="flex items-center gap-4 opacity-50 my-4">
                        <span className="text-xs font-mono text-muted-foreground w-12 text-right">{timeSlot.split('-')[0]}</span>
                        <div className="h-[1px] flex-1 bg-border border-dashed border-b"></div>
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Lunch</span>
                        <div className="h-[1px] flex-1 bg-border border-dashed border-b"></div>
                    </div>
                );
            }

            // Status Logic
            const isCompleted = status === "completed";
            const isLive = status === "live";

            if (!filteredSlots || filteredSlots.length === 0) {
                 return (
                    <div key={timeSlot} className={`flex gap-4 group ${isCompleted ? 'opacity-40 grayscale' : ''}`}>
                        <div className="flex flex-col items-end w-12 shrink-0">
                            <span className="text-sm font-bold text-foreground">{timeSlot.split('-')[0]}</span>
                            <span className="text-[10px] text-muted-foreground">{timeSlot.split('-')[1]}</span>
                        </div>
                        {isLive ? (
                            <div className="flex-1 p-3 rounded-2xl border-2 border-primary bg-primary/5 flex items-center justify-center min-h-[80px] relative">
                                <span className="absolute -top-3 left-4 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">NOW</span>
                                <span className="text-xs text-primary font-medium">Free Slot</span>
                            </div>
                        ) : (
                            <div className="flex-1 p-3 rounded-2xl border border-dashed border-border bg-muted/5 flex items-center justify-center min-h-[80px]">
                                <span className="text-xs text-muted-foreground/40 font-medium">Free Slot</span>
                            </div>
                        )}
                    </div>
                 );
            }

            return (
              <div key={timeSlot} className={`flex gap-4 ${isCompleted ? 'opacity-50' : ''}`}>
                 {/* Time Column */}
                 <div className="flex flex-col items-end w-12 shrink-0">
                    <span className={`text-sm font-bold ${isLive ? 'text-primary' : 'text-foreground'}`}>{timeSlot.split('-')[0]}</span>
                    <span className="text-[10px] text-muted-foreground">{timeSlot.split('-')[1]}</span>
                    {/* Line connector */}
                    <div className={`h-full w-[2px] my-2 rounded-full relative ${isLive ? 'bg-primary' : (isCompleted ? 'bg-primary/20' : 'bg-border')}`}>
                        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ring-4 ring-background ${isLive ? 'bg-primary animate-ping' : (isCompleted ? 'bg-primary/50' : 'bg-primary')}`}></div>
                        {isLive && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary ring-4 ring-background"></div>}
                    </div>
                 </div>

                 {/* Cards Stack */}
                 <div className="flex-1 space-y-3 pb-6">
                    {filteredSlots.map((slot: any, idx: number) => (
                        <div 
                          key={idx} 
                          className={`relative overflow-hidden rounded-2xl border-l-4 p-4 transition-all
                              ${isLive ? 'bg-card border-l-primary shadow-lg ring-1 ring-primary/20' : ''}
                              ${!isLive && !isCompleted ? 'bg-card border-l-primary shadow-sm hover:shadow-md' : ''}
                              ${isCompleted ? 'bg-muted/10 border-l-muted-foreground/30 shadow-none' : ''}
                          `}
                          onClick={() => canManageAllTimetable && openSlotDialog(selectedDay, timeSlot)}
                        >
                             {isLive && (
                                 <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-primary/10 px-2 py-1 rounded-full">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                                    <span className="text-[10px] font-bold text-primary">LIVE</span>
                                 </div>
                             )}
                             {isCompleted && (
                                  <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-muted">
                                    <span className="text-[10px] font-bold text-muted-foreground">COMPLETED</span>
                                 </div>
                             )}

{/* Clock icon removed */}
                             
                             <div className="relative z-10">
                                 <h4 className={`font-bold text-lg line-clamp-1 ${isCompleted ? 'text-muted-foreground' : 'text-foreground'}`}>{slot.courseName}</h4>
                                 <div className="flex items-center gap-2 mt-1 mb-3">
                                     <Badge variant={isCompleted ? "outline" : "secondary"} className="text-[10px] uppercase tracking-wider font-bold">{slot.courseCode}</Badge>
                                     <span className="text-xs text-muted-foreground">|</span>
                                     <span className={`text-xs font-medium px-2 py-0.5 rounded text-nowrap ${isLive ? 'text-primary bg-primary/10' : 'text-muted-foreground bg-muted'}`}>Room {slot.room}</span>
                                 </div>
                                 
                                 <div className="flex items-center justify-between text-xs text-muted-foreground">
                                     <div className="flex items-center gap-1.5">
                                         <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold ${isCompleted ? 'bg-gray-400' : 'bg-gradient-to-br from-primary to-purple-600'}`}>
                                             {slot.facultyName?.[0] || "?"}
                                         </div>
                                         <span className="font-medium">{slot.facultyName || "TBD"}</span>
                                     </div>
                                 </div>
                             </div>
                        </div>
                    ))}
                 </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block card-elevated overflow-x-auto overflow-y-auto max-h-[70vh] timetable-scroll-container">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/30">
              <th className="border border-border p-3 text-left text-sm font-medium text-muted-foreground min-w-[100px]">
                Time
              </th>
              {DAYS.map((day) => (
                <th
                  key={day}
                  className="border border-border p-3 text-center text-sm font-medium text-muted-foreground min-w-[150px]"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((timeSlot) => (
              <tr key={timeSlot}>
                <td className="border border-border p-3 text-sm font-medium text-muted-foreground bg-muted/20">
                  {timeSlot}
                </td>
                {DAYS.map((day) => {
                  const key = `${day}-${timeSlot}`;
                  const slotData = timetable[key];
                  const isLunch = timeSlot === "13:00-14:00";

                  if (isLunch) {
                    return (
                      <td
                        key={`${day}-${timeSlot}`}
                        className="border border-border p-2 bg-muted/40 text-center align-middle"
                      >
                        {day === "Wednesday" && (
                          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground/60 vertical-text block rotate-0">
                            Lunch Break
                          </span>
                        )}
                      </td>
                    );
                  }

                  return (
                    <td
                      key={`${day}-${timeSlot}`}
                      className={`border border-border p-2 relative group transition-colors min-h-[80px] ${
                        canManageAllTimetable ? "hover:bg-muted/10 cursor-pointer" : ""
                      } ${draggedCourse ? "drag-target" : ""}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, day, timeSlot)}
                      onDragEnd={handleDragEnd}
                      onClick={() => canManageAllTimetable && openSlotDialog(day, timeSlot)}
                    >
                      {(() => {
                        if (!slotData || slotData.length === 0) {
                          return (
                            <div className="text-xs text-muted-foreground/30 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                              {canManageAllTimetable && "Drop here"}
                            </div>
                          );
                        }

                        const scopedSlots = applySlotFilters(slotData);

                        if (scopedSlots.length === 0) {
                          return (
                            <div className="text-xs text-muted-foreground/30 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                              {canManageAllTimetable && "Drop here"}
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-1">
                            {scopedSlots.map((slot: any, idx: number) => (
                              <div
                                key={idx}
                                className="p-2 bg-primary/10 rounded-lg border border-primary/20 relative"
                              >
                                <div className="font-medium text-sm text-foreground">
                                  {slot.courseCode || slot.courseName}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {slot.facultyName}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Room: {slot.room}
                                </div>
                                {(user.role === "student" || filterValues.department === "all") && (
                                  <div className="text-xs text-primary mt-1 font-medium">
                                    {slot.department}
                                  </div>
                                )}
                                
                                {canManageAllTimetable && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteSlot(slot.id);
                                    }}
                                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded text-destructive transition-all"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {Object.keys(timetable).length === 0 && (
          <div className="p-4">
            <EmptyState title="No timetable entries" description="Add slots manually or use auto-generate." />
          </div>
        )}
      </div>

      {/* Edit Slot Dialog (Admin) */}
      <Dialog open={showSlotDialog} onOpenChange={setShowSlotDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Timetable Slot</DialogTitle>
            <DialogDescription>
              {selectedSlot?.day} - {selectedSlot?.timeSlot}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Course</label>
              <Select
                value={slotForm.courseId}
                onValueChange={(val) =>
                  setSlotForm((prev) => ({ ...prev, courseId: val }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Room</label>
              <Input
                placeholder="e.g. 101, Lab 2"
                value={slotForm.room}
                onChange={(e) =>
                  setSlotForm((prev) => ({ ...prev, room: e.target.value }))
                }
              />
            </div>
            <Button onClick={handleSaveSlot} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Faculty Extra Class Dialog */}
      <Dialog open={showExtraClassDialog} onOpenChange={setShowExtraClassDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Extra Class</DialogTitle>
            <DialogDescription>
              Add an extra class session to your timetable
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Course Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Course *</label>
              <Select
                value={extraClassForm.courseId}
                onValueChange={(value) =>
                  setExtraClassForm((prev) => ({ 
                    ...prev, 
                    courseId: value,
                    slotKey: "" // Reset slot when course changes
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.length > 0 ? (
                    courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground">
                      No courses assigned
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Day Selection */}
            {extraClassForm.courseId && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Day *</label>
                <Select
                  value={extraClassForm.slotKey?.split("-")[0] || ""}
                  onValueChange={(day) => {
                    setExtraClassForm((prev) => ({
                      ...prev,
                      slotKey: `${day}-`, // Placeholder for time selection
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a day" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map((day) => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Time Slot Selection */}
            {extraClassForm.courseId && extraClassForm.slotKey?.split("-")[0] && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Time Slot *</label>
                <Select
                  value={extraClassForm.slotKey || ""}
                  onValueChange={(value) =>
                    setExtraClassForm((prev) => ({ ...prev, slotKey: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select available time" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.filter((t) => t !== "13:00-14:00").map((timeSlot) => {
                      const selectedDay = extraClassForm.slotKey?.split("-")[0];
                      const key = `${selectedDay}-${timeSlot}`;
                      const slots = timetable[key] || [];
                      const hasFacultyClass = slots.some((slot: any) => isSlotOwnedByFaculty(slot));
                      const isAvailable = !hasFacultyClass;

                      return (
                        <SelectItem key={key} value={key} disabled={!isAvailable}>
                          <span>
                            {timeSlot}
                            {!isAvailable && " (Busy)"}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Room Input */}
            {extraClassForm.courseId && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Room</label>
                <Input
                  placeholder="e.g. L-10, Lab 2, or leave blank for TBD"
                  value={extraClassForm.room}
                  onChange={(e) =>
                    setExtraClassForm((prev) => ({ ...prev, room: e.target.value }))
                  }
                />
              </div>
            )}

            {/* Auto-populated Fields Info */}
            {extraClassForm.courseId && extraClassForm.slotKey && !extraClassForm.slotKey.endsWith("-") && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2 text-sm">
                <p className="font-medium text-blue-900">Auto-populated from course:</p>
                <div className="text-xs text-blue-800 space-y-1">
                  {(() => {
                    const course = courses.find(c => c.id === extraClassForm.courseId);
                    return (
                      <>
                        <div>• <strong>Program:</strong> {course?.department || "N/A"}</div>
                        <div>• <strong>Semester:</strong> {course?.semester || "N/A"}</div>
                        {course?.batch && <div>• <strong>Batch:</strong> {course.batch}</div>}
                        <div>• <strong>Slot:</strong> {extraClassForm.slotKey.replace("-", " at ")}</div>
                        <div>• <strong>Room:</strong> {extraClassForm.room || "TBD"}</div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowExtraClassDialog(false);
                  setExtraClassForm({ courseId: "", slotKey: "", room: "" });
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleScheduleExtraClass} 
                className="flex-1"
                disabled={
                  !extraClassForm.courseId || 
                  !extraClassForm.slotKey || 
                  extraClassForm.slotKey.endsWith("-") ||
                  courses.length === 0
                }
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Upload Timetable</DialogTitle>
            <DialogDescription>
              Upload Excel/CSV file with columns: day, timeSlot,
              courseCode, room
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

