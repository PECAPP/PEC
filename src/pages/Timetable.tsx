import { useState, useEffect } from "react";
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
  Filter,
} from "lucide-react";
import BulkUpload from "@/components/BulkUpload";
import { exportTimetablePDF } from "@/lib/pdfExport";
import PDFExportButton from "@/components/common/PDFExportButton";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
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
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "@/config/firebase";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/usePermissions";
import {
  generateFullTimetable,
  type CourseSchedule,
} from "@/lib/timetableGenerator";

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

export default function Timetable() {
  const navigate = useNavigate();
  const { isAdmin, isFaculty, user, loading: authLoading } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<any>({});
  const [draggedCourse, setDraggedCourse] = useState<any>(null);
  const [showSlotDialog, setShowSlotDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(""); // Renamed to avoid conflict
  const [generating, setGenerating] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [slotForm, setSlotForm] = useState({
    courseId: "",
    room: "",
  });
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  const [studentEnrollments, setStudentEnrollments] = useState<string[]>([]);

  useEffect(() => {
    if (authLoading) return; // Wait for auth to load

    if (!user) {
      navigate("/auth");
      return;
    }

    const loadData = async () => {
      try {
        await fetchData();
        if (user.role === "student" && user.uid) {
          const enrollmentsQuery = query(
            collection(db, "enrollments"),
            where("studentId", "==", user.uid)
          );
          const enrollmentsSnap = await getDocs(enrollmentsQuery);
          const courseIds = enrollmentsSnap.docs.map(
            (doc) => (doc.data() as any).courseId
          );
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
  }, [authLoading, user, navigate]);

  const fetchData = async () => {
    try {
      // Fetch courses
      const coursesSnapshot = await getDocs(collection(db, "courses"));
      let coursesData = coursesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter courses for faculty
      if (isFaculty && user?.uid) {
        // Check if faculty has assignments
        const assignmentsQuery = query(
          collection(db, "facultyAssignments"),
          where("facultyId", "==", user.uid)
        );
        const assignmentsSnap = await getDocs(assignmentsQuery);

        if (assignmentsSnap.docs.length > 0) {
          // Faculty has assignments - show only assigned courses
          const assignedCourseIds = assignmentsSnap.docs.map(
            (doc) => doc.data().courseId
          );
          coursesData = coursesData.filter((course) =>
            assignedCourseIds.includes(course.id)
          );
        } else {
          // No assignments - filter by department
          const userDept = (user as any)?.department;
          if (userDept) {
            coursesData = coursesData.filter(
              (course) => (course as any).department === userDept
            );
          }
        }
      }

      setCourses(coursesData);

      // Fetch timetable entries
      const timetableSnapshot = await getDocs(collection(db, "timetable"));
      const timetableData: any = {};

      // Get filtered course IDs for timetable filtering
      const allowedCourseIds = coursesData.map((c) => c.id);

      timetableSnapshot.docs.forEach((doc) => {
        const data = doc.data();

        // Only include timetable entries for faculty's courses
        if (allowedCourseIds.includes(data.courseId)) {
          const key = `${data.day}-${data.timeSlot}`;
          if (!timetableData[key]) {
            timetableData[key] = [];
          }
          timetableData[key].push({
            id: doc.id,
            ...data,
          });
        }
      });

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
          if (specificSlot) {
            await updateDoc(doc(db, "timetable", specificSlot.id), {
              courseId: course.id,
              courseName: course.name,
              courseCode: course.code,
              room: row.room || "TBD",
              updatedAt: serverTimestamp(),
            });
          } else {
            await addDoc(collection(db, "timetable"), {
              day: row.day,
              timeSlot: row.timeSlot,
              courseId: course.id,
              courseName: course.name,
              courseCode: course.code,
              room: row.room || "TBD",
              department: course.department,
              createdAt: serverTimestamp(),
            });
          }
        } else {
          await addDoc(collection(db, "timetable"), {
            day: row.day,
            timeSlot: row.timeSlot,
            courseId: course.id,
            courseName: course.name,
            courseCode: course.code,
            room: row.room || "TBD",
            department: course.department,
            createdAt: serverTimestamp(),
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
    const exportData = Object.values(timetable).map((slot: any) => ({
      day: slot.day,
      timeSlot: slot.timeSlot,
      courseCode: slot.courseCode,
      courseName: slot.courseName,
      room: slot.room,
    }));

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
    {
      day: "Monday",
      timeSlot: "09:00-10:00",
      courseCode: "CS101",
      room: "101",
    },
  ];

  const handleAutoGenerate = async () => {
    if (!isAdmin) {
      toast.error("Only admins can auto-generate timetables");
      return;
    }

    setGenerating(true);
    try {
      // Fetch all courses
      const coursesSnapshot = await getDocs(collection(db, "courses"));
      const allCourses: CourseSchedule[] = coursesSnapshot.docs.map((doc) => ({
        courseId: doc.id,
        courseName: doc.data().name,
        courseCode: doc.data().code,
        facultyId: doc.data().facultyId || "",
        facultyName: doc.data().facultyName || "",
        department: (doc.data().department || "").trim(),
        semester: doc.data().semester || 1,
        credits: doc.data().credits || 3,
      }));

      // Get all unique departments
      const departments = [
        ...new Set(allCourses.map((c) => c.department)),
      ].filter(Boolean) as string[];

      // Generate timetable using the new grouping logic
      const { entries, summary } = generateFullTimetable(
        allCourses,
        departments
      );

      // Clear existing timetable
      const existingTimetable = await getDocs(collection(db, "timetable"));
      const deletePromises = existingTimetable.docs.map((doc) =>
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);

      // Add new entries
      const addPromises = entries.map((entry) =>
        addDoc(collection(db, "timetable"), {
          ...entry,
          createdAt: serverTimestamp(),
        })
      );
      await Promise.all(addPromises);

      await fetchData(); // Refresh display
      toast.success(`Timetable generated! ${summary}`);
    } catch (error) {
      console.error("Error generating timetable:", error);
      toast.error("Failed to generate timetable");
    } finally {
      setGenerating(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, course: any) => {
    if (!isAdmin) return;
    setDraggedCourse(course);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    e.dataTransfer.dropEffect = "copy";
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
        await updateDoc(doc(db, "timetable", existingEntry.id), {
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "timetable"), {
          day,
          timeSlot,
          courseId: draggedCourse.id,
          courseName: draggedCourse.name,
          courseCode: draggedCourse.code,
          facultyId: draggedCourse.facultyId || "",
          facultyName: draggedCourse.facultyName || "",
          department: draggedCourse.department,
          room: "TBD",
          createdAt: serverTimestamp(),
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

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm("Remove this class from timetable?")) return;
    try {
      await deleteDoc(doc(db, "timetable", slotId));
      toast.success("Slot removed!");
      fetchData();
    } catch (error) {
      console.error("Error deleting slot:", error);
      toast.error("Failed to remove slot");
    }
  };

  const openSlotDialog = (day: string, timeSlot: string) => {
    const key = `${day}-${timeSlot}`;
    const slot = timetable[key];

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
      if (selectedSlot.id) {
        // Editing an existing record
        await updateDoc(doc(db, "timetable", selectedSlot.id), {
          courseId: course.id,
          courseName: course.name,
          courseCode: course.code,
          facultyId: course.facultyId || "",
          facultyName: course.facultyName || "",
          department: course.department,
          room: slotForm.room,
          updatedAt: serverTimestamp(),
        });
      } else {
        // Adding new record to this slot
        await addDoc(collection(db, "timetable"), {
          day: selectedSlot.day,
          timeSlot: selectedSlot.timeSlot,
          courseId: course.id,
          courseName: course.name,
          courseCode: course.code,
          facultyId: course.facultyId || "",
          facultyName: course.facultyName || "",
          department: course.department,
          room: slotForm.room,
          createdAt: serverTimestamp(),
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading timetable...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Timetable</h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin ? "Manage course schedule" : "View class schedule"}
          </p>
        </div>
        <div className="flex gap-2">
          <PDFExportButton
            onExport={async () => {
              const timetableData = Object.entries(timetable).flatMap(
                ([key, slots]: [string, any]) => {
                  const [day, timeSlot] = key.split("_");
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
          {isAdmin && (
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
          <Button variant="outline" onClick={exportTimetable}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Available Courses (Admin Only) */}
      {isAdmin && (
        <div className="card-elevated p-4">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <GripVertical className="w-4 h-4" />
            Available Courses (Drag to Schedule)
          </h3>
          <div className="flex flex-wrap gap-2">
            {courses.map((course) => (
              <div
                key={course.id}
                draggable
                onDragStart={(e) => handleDragStart(e, course)}
                className="px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg cursor-move hover:bg-primary/20 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
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
      )}

      {/* Department Filter (Role-Based) */}
      <div className="card-elevated p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Filter className="w-4 h-4 text-primary" />
              {isAdmin
                ? "Institutional View"
                : isFaculty
                ? "Teaching Schedule"
                : "Enrolled Schedule"}
            </h3>
            {isAdmin && (
              <Badge
                variant="outline"
                className="text-[10px] uppercase font-bold"
              >
                Admin Override
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={departmentFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setDepartmentFilter("all")}
              className="rounded-full px-4"
            >
              All
            </Button>
            {[
              "Computer Science & Engineering",
              "Electronics & Communication Engineering",
              "Electrical Engineering",
              "Mechanical Engineering",
              "Civil Engineering",
              "Production & Industrial Engineering",
            ].map((dept) => {
              let label = dept.split(' Engineering')[0];

              if (label.endsWith(" &")) {
                label = label.replace(/ &$/, "");
              }

              return (
                <Button
                  key={dept}
                  variant={departmentFilter === dept ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDepartmentFilter(dept)}
                  className="rounded-full px-4"
                >
                  {label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="card-elevated overflow-x-auto">
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
                        isAdmin ? "hover:bg-muted/10 cursor-pointer" : ""
                      }`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, day, timeSlot)}
                      onClick={() => isAdmin && openSlotDialog(day, timeSlot)}
                    >
                      {(() => {
                        if (!slotData || slotData.length === 0) {
                          return (
                            <div className="text-xs text-muted-foreground/30 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                              {isAdmin && "Drop here"}
                            </div>
                          );
                        }

                        // 1. Role-based filtering
                        let roleFilteredSlots = slotData;

                        // Faculty: show only their own classes
                        if (user.role === "faculty") {
                          const facultyName = (user as any)?.fullName || "";
                          roleFilteredSlots = slotData.filter(
                            (s: any) =>
                              s.facultyId === user.uid ||
                              s.facultyName === facultyName
                          );
                        } else if (user.role === "student") {
                          roleFilteredSlots = slotData.filter((s: any) =>
                            studentEnrollments.includes(s.courseId)
                          );
                        }

                        // 2. Department filtering (mostly for admins)
                        const filteredSlots =
                          departmentFilter === "all"
                            ? roleFilteredSlots
                            : roleFilteredSlots.filter(
                                (s: any) => s.department === departmentFilter
                              );

                        if (filteredSlots.length === 0) {
                          return (
                            <div className="text-xs text-muted-foreground/30 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                              {isAdmin && "Drop here"}
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-1">
                            {filteredSlots.map((slot: any, idx: number) => (
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
                                {departmentFilter === "all" && (
                                  <div className="text-xs text-primary mt-1 font-medium">
                                    {slot.department}
                                  </div>
                                )}
                                {isAdmin && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteSlot(slot.id);
                                    }}
                                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Trash2 className="w-3 h-3 text-destructive" />
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
      </div>

      {/* Edit Slot Dialog */}
      <Dialog open={showSlotDialog} onOpenChange={setShowSlotDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Time Slot</DialogTitle>
            <DialogDescription>
              {selectedSlot && `${selectedSlot.day} ${selectedSlot.timeSlot}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Course</label>
              <Select
                value={slotForm.courseId}
                onValueChange={(value) =>
                  setSlotForm({ ...slotForm, courseId: value })
                }
              >
                <SelectTrigger className="mt-1">
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
            <div>
              <label className="text-sm font-medium">Room/Venue</label>
              <Input
                value={slotForm.room}
                onChange={(e) =>
                  setSlotForm({ ...slotForm, room: e.target.value })
                }
                placeholder="Room 101"
                className="mt-1"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveSlot} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Save Slot
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowSlotDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Bulk Upload Timetable</DialogTitle>
            <DialogDescription>
              Upload CSV/Excel file with columns: day, timeSlot, courseCode,
              room
            </DialogDescription>
          </DialogHeader>
          <BulkUpload
            entityType="timetable"
            onImport={handleBulkImport}
            templateColumns={bulkUploadTemplate}
            sampleData={sampleBulkData}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
