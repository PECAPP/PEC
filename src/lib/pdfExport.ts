import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";

// Institution branding
const INSTITUTION_NAME = "PEC Campus OS";
const INSTITUTION_LOGO = ""; // Add logo URL if available

/**
 * Generate PDF with institution header
 */
function addPDFHeader(doc: jsPDF, title: string) {
  // Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(INSTITUTION_NAME, 105, 20, { align: "center" });

  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text(title, 105, 30, { align: "center" });

  // Line separator
  doc.setLineWidth(0.5);
  doc.line(20, 35, 190, 35);

  return 40; // Return Y position for content start
}

/**
 * Add PDF footer with page numbers
 */
function addPDFFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  doc.setFontSize(10);

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Page ${i} of ${pageCount}`,
      105,
      doc.internal.pageSize.height - 10,
      { align: "center" },
    );
    doc.text(
      `Generated on ${new Date().toLocaleDateString()}`,
      20,
      doc.internal.pageSize.height - 10,
    );
  }
}

/**
 * Export attendance report as PDF
 */
export function exportAttendanceReport(
  courseName: string,
  attendanceData: any[],
  dateRange?: { start: string; end: string },
) {
  const doc = new jsPDF();

  const title = `Attendance Report - ${courseName}`;
  let yPos = addPDFHeader(doc, title);

  // Date range if provided
  if (dateRange) {
    doc.setFontSize(10);
    doc.text(`Period: ${dateRange.start} to ${dateRange.end}`, 105, yPos + 5, {
      align: "center",
    });
    yPos += 15;
  } else {
    yPos += 10;
  }

  // Prepare table data
  const tableData = attendanceData.map((record) => [
    record.studentName || record.studentId,
    record.enrollmentNumber || "-",
    record.present || 0,
    record.absent || 0,
    record.total || 0,
    `${record.percentage || 0}%`,
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [
      [
        "Student Name",
        "Enrollment No",
        "Present",
        "Absent",
        "Total",
        "Percentage",
      ],
    ],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [66, 139, 202] },
    styles: { fontSize: 10 },
  });

  addPDFFooter(doc);

  const filename = `attendance_${courseName.replace(/\s+/g, "_")}_${Date.now()}.pdf`;
  doc.save(filename);
}

/**
 * Export timetable as PDF
 */

export function exportTimetablePDF(
  timetableData: any[],
  title: string = "Weekly Timetable",
) {
  const doc = new jsPDF("landscape");

  const yPos = addPDFHeader(doc, title);

  // Group by day
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const groupedData: any = {};

  days.forEach((day) => {
    groupedData[day] = timetableData.filter((slot) => slot.day === day);
  });

  let currentY = yPos;

  days.forEach((day) => {
    if (groupedData[day].length > 0) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(day, 20, currentY);
      currentY += 5;

      const dayData = groupedData[day].map((slot: any) => [
        slot.startTime || "-",
        slot.endTime || "-",
        slot.courseName || slot.courseCode || "-",
        slot.room || "-",
        slot.facultyName || "-",
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [["Start Time", "End Time", "Course", "Room", "Faculty"]],
        body: dayData,
        theme: "grid",
        headStyles: { fillColor: [66, 139, 202] },
        styles: { fontSize: 9 },
        margin: { left: 20 },
      });

      currentY = (doc as any).lastAutoTable.finalY + 10;
    }
  });

  addPDFFooter(doc);

  const filename = `timetable_${Date.now()}.pdf`;
  doc.save(filename);
}

/**
 * Export grade sheet as PDF
 */

export function exportGradeSheet(courseName: string, gradesData: any[]) {
  const doc = new jsPDF();

  const title = `Grade Sheet - ${courseName}`;
  const yPos = addPDFHeader(doc, title);

  const tableData = gradesData.map((record) => [
    record.studentName || record.studentId,
    record.enrollmentNumber || "-",
    record.internalMarks || "-",
    record.externalMarks || "-",
    record.totalMarks || "-",
    record.grade || "-",
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [
      [
        "Student Name",
        "Enrollment No",
        "Internal",
        "External",
        "Total",
        "Grade",
      ],
    ],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [66, 139, 202] },
    styles: { fontSize: 10 },
  });

  addPDFFooter(doc);

  const filename = `grades_${courseName.replace(/\s+/g, "_")}_${Date.now()}.pdf`;
  doc.save(filename);
}

/**
 * Export user list as PDF
 */

export function exportUserListPDF(users: any[], role: string = "All Users") {
  const doc = new jsPDF();

  const title = `${role} List`;
  const yPos = addPDFHeader(doc, title);

  const tableData = users.map((user) => [
    user.name || user.displayName || "-",
    user.email || "-",
    user.role || "-",
    user.department || "-",
    user.enrollmentNumber || user.employeeId || "-",
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [["Name", "Email", "Role", "Department", "ID"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [66, 139, 202] },
    styles: { fontSize: 9 },
  });

  addPDFFooter(doc);

  const filename = `users_${role.replace(/\s+/g, "_")}_${Date.now()}.pdf`;
  doc.save(filename);
}

/**
 * Export course list as PDF
 */
export function exportCourseListPDF(courses: any[]) {
  const doc = new jsPDF();

  const title = "Course Catalog";
  const yPos = addPDFHeader(doc, title);

  const tableData = courses.map((course) => [
    course.code || "-",
    course.name || "-",
    course.credits || "-",
    course.semester || "-",
    course.department || "-",
    course.enrolledStudents || 0,
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [
      ["Code", "Course Name", "Credits", "Semester", "Department", "Enrolled"],
    ],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [66, 139, 202] },
    styles: { fontSize: 9 },
  });

  addPDFFooter(doc);

  const filename = `courses_${Date.now()}.pdf`;
  doc.save(filename);
}

/**
 * Export assignment report as PDF
 */

export function exportAssignmentReport(
  assignmentTitle: string,
  submissions: any[],
) {
  const doc = new jsPDF();

  const title = `Assignment Report - ${assignmentTitle}`;
  const yPos = addPDFHeader(doc, title);

  const tableData = submissions.map((sub) => [
    sub.studentName || sub.studentId,
    sub.enrollmentNumber || "-",
    sub.submittedAt
      ? new Date(sub.submittedAt).toLocaleDateString()
      : "Not Submitted",
    sub.grade || "Pending",
    sub.status || "-",
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [
      ["Student Name", "Enrollment No", "Submitted On", "Grade", "Status"],
    ],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [66, 139, 202] },
    styles: { fontSize: 10 },
  });

  addPDFFooter(doc);

  const filename = `assignment_${assignmentTitle.replace(/\s+/g, "_")}_${Date.now()}.pdf`;
  doc.save(filename);
}

/**
 * Export hall ticket for examination
 */

export function exportHallTicket(studentData: any, examDetails: any[]) {
  const doc = new jsPDF();

  const title = "Examination Hall Ticket";
  let yPos = addPDFHeader(doc, title);

  // Student Information Box
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Student Information", 20, yPos);
  yPos += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Name: ${studentData.fullName || studentData.name}`, 20, yPos);
  yPos += 6;
  doc.text(`Enrollment No: ${studentData.enrollmentNumber || "-"}`, 20, yPos);
  yPos += 6;
  doc.text(`Department: ${studentData.department || "-"}`, 20, yPos);
  yPos += 6;
  doc.text(`Semester: ${studentData.semester || "-"}`, 20, yPos);
  yPos += 12;

  // Exam Schedule
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Examination Schedule", 20, yPos);
  yPos += 7;

  const tableData = examDetails.map((exam) => [
    exam.date || "-",
    exam.courseName || exam.courseCode || "-",
    exam.startTime || "-",
    exam.endTime || "-",
    exam.room || "-",
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [["Date", "Subject", "Start Time", "End Time", "Room"]],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: [66, 139, 202] },
    styles: { fontSize: 9 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Instructions
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Instructions:", 20, yPos);
  yPos += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const instructions = [
    "1. Bring this hall ticket to the examination hall",
    "2. Arrive 15 minutes before the exam starts",
    "3. Carry a valid ID proof",
    "4. Mobile phones are strictly prohibited",
    "5. Follow all examination rules and regulations",
  ];

  instructions.forEach((instruction) => {
    doc.text(instruction, 25, yPos);
    yPos += 5;
  });

  addPDFFooter(doc);

  const filename = `hall_ticket_${studentData.enrollmentNumber}_${Date.now()}.pdf`;
  doc.save(filename);
}

/**
 * Export defaulter list (students with low attendance)
 */

export function exportDefaulterList(
  courseName: string,
  defaulters: any[],
  threshold: number = 75,
) {
  const doc = new jsPDF();

  const title = `Attendance Defaulter List - ${courseName}`;
  let yPos = addPDFHeader(doc, title);

  // Threshold info
  doc.setFontSize(10);
  doc.setTextColor(220, 53, 69); // Red color
  doc.text(`Students below ${threshold}% attendance threshold`, 105, yPos, {
    align: "center",
  });
  doc.setTextColor(0, 0, 0); // Reset to black
  yPos += 10;

  const tableData = defaulters.map((student) => [
    student.studentName || student.name,
    student.enrollmentNumber || "-",
    student.department || "-",
    student.present || 0,
    student.absent || 0,
    student.total || 0,
    `${student.percentage || 0}%`,
    student.phone || student.contactNumber || "-",
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [
      [
        "Student Name",
        "Enrollment No",
        "Dept",
        "Present",
        "Absent",
        "Total",
        "Percentage",
        "Contact",
      ],
    ],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [220, 53, 69] }, // Red header for defaulters
    styles: { fontSize: 8 },
    columnStyles: {
      6: { textColor: [220, 53, 69], fontStyle: "bold" }, // Highlight percentage in red
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Summary
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Total Defaulters: ${defaulters.length}`, 20, yPos);

  addPDFFooter(doc);

  const filename = `defaulters_${courseName.replace(/\s+/g, "_")}_${Date.now()}.pdf`;
  doc.save(filename);
}

/**
 * Export grading summary for assignments
 */

export function exportGradingSummary(
  assignmentTitle: string,
  gradingStats: {
    totalSubmissions: number;
    graded: number;
    pending: number;
    averageScore: number;
    gradeDistribution: { grade: string; count: number }[];
    topPerformers: any[];
  },
) {
  const doc = new jsPDF();

  const title = `Grading Summary - ${assignmentTitle}`;
  let yPos = addPDFHeader(doc, title);

  // Statistics Overview
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Overview", 20, yPos);
  yPos += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Total Submissions: ${gradingStats.totalSubmissions}`, 20, yPos);
  yPos += 6;
  doc.text(`Graded: ${gradingStats.graded}`, 20, yPos);
  yPos += 6;
  doc.text(`Pending: ${gradingStats.pending}`, 20, yPos);
  yPos += 6;
  doc.text(`Average Score: ${gradingStats.averageScore.toFixed(2)}%`, 20, yPos);
  yPos += 12;

  // Grade Distribution
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Grade Distribution", 20, yPos);
  yPos += 7;

  const distributionData = gradingStats.gradeDistribution.map((item) => [
    item.grade,
    item.count,
    `${((item.count / gradingStats.totalSubmissions) * 100).toFixed(1)}%`,
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [["Grade", "Count", "Percentage"]],
    body: distributionData,
    theme: "grid",
    headStyles: { fillColor: [66, 139, 202] },
    styles: { fontSize: 10 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 12;

  // Top Performers
  if (gradingStats.topPerformers && gradingStats.topPerformers.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Top Performers", 20, yPos);
    yPos += 7;

    const topPerformersData = gradingStats.topPerformers.map(
      (student, index) => [
        index + 1,
        student.studentName || student.name,
        student.enrollmentNumber || "-",
        `${student.score || 0}%`,
        student.grade || "-",
      ],
    );

    autoTable(doc, {
      startY: yPos,
      head: [["Rank", "Student Name", "Enrollment No", "Score", "Grade"]],
      body: topPerformersData,
      theme: "striped",
      headStyles: { fillColor: [40, 167, 69] }, // Green for top performers
      styles: { fontSize: 10 },
    });
  }

  addPDFFooter(doc);

  const filename = `grading_summary_${assignmentTitle.replace(/\s+/g, "_")}_${Date.now()}.pdf`;
  doc.save(filename);
}

/**
 * Export individual user profile as PDF
 */

export function exportUserProfile(
  userData: any,
  academicHistory?: any[],
  achievements?: any[],
) {
  const doc = new jsPDF();

  const title = "Student Profile";
  let yPos = addPDFHeader(doc, title);

  // Personal Information
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Personal Information", 20, yPos);
  yPos += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const personalInfo = [
    `Name: ${userData.fullName || userData.name || "-"}`,
    `Email: ${userData.email || "-"}`,
    `Enrollment No: ${userData.enrollmentNumber || "-"}`,
    `Department: ${userData.department || "-"}`,
    `Semester: ${userData.semester || "-"}`,
    `Phone: ${userData.phone || "-"}`,
    `Date of Birth: ${userData.dateOfBirth || "-"}`,
  ];

  personalInfo.forEach((info) => {
    doc.text(info, 20, yPos);
    yPos += 6;
  });

  yPos += 8;

  // Academic History
  if (academicHistory && academicHistory.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Academic History", 20, yPos);
    yPos += 7;

    const historyData = academicHistory.map((record) => [
      record.semester || "-",
      record.courseName || record.courseCode || "-",
      record.grade || "-",
      record.credits || "-",
      record.sgpa || "-",
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [["Semester", "Course", "Grade", "Credits", "SGPA"]],
      body: historyData,
      theme: "striped",
      headStyles: { fillColor: [66, 139, 202] },
      styles: { fontSize: 9 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Achievements
  if (achievements && achievements.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Achievements & Certifications", 20, yPos);
    yPos += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    achievements.forEach((achievement, index) => {
      doc.text(
        `${index + 1}. ${achievement.title || achievement.name}`,
        25,
        yPos,
      );
      yPos += 5;
      if (achievement.date) {
        doc.setTextColor(100, 100, 100);
        doc.text(`   Date: ${achievement.date}`, 25, yPos);
        doc.setTextColor(0, 0, 0);
        yPos += 5;
      }
    });
  }

  addPDFFooter(doc);

  const filename = `profile_${userData.enrollmentNumber || "user"}_${Date.now()}.pdf`;
  doc.save(filename);
}

/**
 * Export course details with syllabus as PDF
 */

export function exportCourseDetails(
  courseData: any,
  syllabus?: any[],
  schedule?: any[],
) {
  const doc = new jsPDF();

  const title = `Course Details - ${courseData.code}`;
  let yPos = addPDFHeader(doc, title);

  // Course Information
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Course Information", 20, yPos);
  yPos += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const courseInfo = [
    `Course Code: ${courseData.code || "-"}`,
    `Course Name: ${courseData.name || "-"}`,
    `Credits: ${courseData.credits || "-"}`,
    `Department: ${courseData.department || "-"}`,
    `Semester: ${courseData.semester || "-"}`,
    `Faculty: ${courseData.facultyName || "-"}`,
    `Max Students: ${courseData.maxStudents || "-"}`,
    `Enrolled: ${courseData.enrolledStudents || 0}`,
  ];

  courseInfo.forEach((info) => {
    doc.text(info, 20, yPos);
    yPos += 6;
  });

  yPos += 8;

  // Description
  if (courseData.description) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Description", 20, yPos);
    yPos += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const splitDescription = doc.splitTextToSize(courseData.description, 170);
    doc.text(splitDescription, 20, yPos);
    yPos += splitDescription.length * 5 + 8;
  }

  // Syllabus
  if (syllabus && syllabus.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Course Syllabus", 20, yPos);
    yPos += 7;

    const syllabusData = syllabus.map((topic) => [
      topic.week || topic.unit || "-",
      topic.topic || topic.title || "-",
      topic.hours || "-",
      topic.learningOutcome || "-",
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [["Week/Unit", "Topic", "Hours", "Learning Outcome"]],
      body: syllabusData,
      theme: "grid",
      headStyles: { fillColor: [66, 139, 202] },
      styles: { fontSize: 8 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Schedule
  if (schedule && schedule.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Class Schedule", 20, yPos);
    yPos += 7;

    const scheduleData = schedule.map((slot) => [
      slot.day || "-",
      slot.startTime || "-",
      slot.endTime || "-",
      slot.room || "-",
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [["Day", "Start Time", "End Time", "Room"]],
      body: scheduleData,
      theme: "striped",
      headStyles: { fillColor: [66, 139, 202] },
      styles: { fontSize: 9 },
    });
  }

  addPDFFooter(doc);

  const filename = `course_${courseData.code.replace(/\s+/g, "_")}_${Date.now()}.pdf`;
  doc.save(filename);
}

/**
 * Export enrolled students list for a course
 */

export function exportEnrolledStudents(
  courseName: string,
  courseCode: string,
  students: any[],
) {
  const doc = new jsPDF();

  const title = `Enrolled Students - ${courseCode}`;
  let yPos = addPDFHeader(doc, title);

  doc.setFontSize(11);
  doc.text(`Course: ${courseName}`, 20, yPos);
  yPos += 6;
  doc.text(`Total Students: ${students.length}`, 20, yPos);
  yPos += 12;

  const tableData = students.map((student, index) => [
    index + 1,
    student.name || student.fullName || "-",
    student.enrollmentNumber || "-",
    student.email || "-",
    student.semester || "-",
    student.phone || "-",
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [
      ["#", "Student Name", "Enrollment No", "Email", "Semester", "Contact"],
    ],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [66, 139, 202] },
    styles: { fontSize: 9 },
  });

  addPDFFooter(doc);

  const filename = `enrolled_students_${courseCode.replace(/\s+/g, "_")}_${Date.now()}.pdf`;
  doc.save(filename);
}

/**
 * Export room-wise timetable schedule
 */
export function exportRoomSchedule(roomName: string, scheduleData: any[]) {
  const doc = new jsPDF("landscape");

  const title = `Room Schedule - ${roomName}`;
  const yPos = addPDFHeader(doc, title);

  // Group by day
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const groupedData: any = {};

  days.forEach((day) => {
    groupedData[day] = scheduleData.filter((slot) => slot.day === day);
  });

  let currentY = yPos;

  days.forEach((day) => {
    if (groupedData[day].length > 0) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(day, 20, currentY);
      currentY += 5;

      const dayData = groupedData[day].map((slot: any) => [
        slot.startTime || "-",
        slot.endTime || "-",
        slot.courseName || slot.courseCode || "-",
        slot.facultyName || "-",
        slot.section || "-",
        slot.capacity || "-",
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [["Start", "End", "Course", "Faculty", "Section", "Capacity"]],
        body: dayData,
        theme: "grid",
        headStyles: { fillColor: [66, 139, 202] },
        styles: { fontSize: 9 },
        margin: { left: 20 },
      });

      currentY = (doc as any).lastAutoTable.finalY + 10;
    }
  });

  addPDFFooter(doc);

  const filename = `room_schedule_${roomName.replace(/\s+/g, "_")}_${Date.now()}.pdf`;
  doc.save(filename);
}

/**
 * Export comprehensive result report
 */
export function exportResultReport(
  examName: string,
  semester: string,
  results: any[],
) {
  const doc = new jsPDF();

  const title = `Result Report - ${examName}`;
  let yPos = addPDFHeader(doc, title);

  doc.setFontSize(10);
  doc.text(`Semester: ${semester}`, 20, yPos);
  yPos += 6;
  doc.text(`Total Students: ${results.length}`, 20, yPos);
  yPos += 12;

  const tableData = results.map((result) => [
    result.studentName || "-",
    result.enrollmentNumber || "-",
    result.courseName || "-",
    result.internalMarks || "-",
    result.externalMarks || "-",
    result.totalMarks || "-",
    result.grade || "-",
    result.status || "Pass",
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [
      [
        "Student",
        "Enrollment",
        "Course",
        "Internal",
        "External",
        "Total",
        "Grade",
        "Status",
      ],
    ],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [66, 139, 202] },
    styles: { fontSize: 8 },
    columnStyles: {
      6: { fontStyle: "bold" }, // Grade column
      7: {
        cellWidth: 20,
        halign: "center",
      },
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Summary statistics
  const passCount = results.filter((r) => r.status !== "Fail").length;
  const failCount = results.length - passCount;
  const passPercentage = ((passCount / results.length) * 100).toFixed(1);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Summary:", 20, yPos);
  yPos += 6;

  doc.setFont("helvetica", "normal");
  doc.text(`Pass: ${passCount} (${passPercentage}%)`, 20, yPos);
  yPos += 5;
  doc.text(`Fail: ${failCount}`, 20, yPos);

  addPDFFooter(doc);

  const filename = `result_report_${examName.replace(/\s+/g, "_")}_${Date.now()}.pdf`;
  doc.save(filename);
}

export default {
  exportAttendanceReport,
  exportTimetablePDF,
  exportGradeSheet,
  exportUserListPDF,
  exportCourseListPDF,
  exportAssignmentReport,
  exportHallTicket,
  exportDefaulterList,
  exportGradingSummary,
  exportUserProfile,
  exportCourseDetails,
  exportEnrolledStudents,
  exportRoomSchedule,
  exportResultReport,
};
