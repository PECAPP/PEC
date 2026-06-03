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


/**
 * Export Hall Ticket as PDF
 */
export function exportHallTicket(studentData: any, courses: any[]) {
  const doc = new jsPDF();
  const yPos = addPDFHeader(doc, "Official Hall Ticket - End Semester Examination");

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Candidate Details", 20, yPos);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const details = [
    `Name: ${studentData.fullName || studentData.name || "Student"}`,
    `Roll No: ${studentData.enrollmentNumber || "N/A"}`,
    `Department: ${studentData.department || "General"}`,
    `Semester: ${studentData.semester || "Current"}`,
  ];

  let currentY = yPos + 7;
  details.forEach((info) => {
    doc.text(info, 20, currentY);
    currentY += 6;
  });

  // Table of subjects
  const tableData = courses.map((course, idx) => [
    idx + 1,
    course.courseCode || course.code || "-",
    course.subjectName || course.name || "-",
    course.examDate || "TBA",
    "________________" // Signature/Seal space
  ]);

  autoTable(doc, {
    startY: currentY + 5,
    head: [["#", "Code", "Subject Name", "Exam Date", "Invigilator Sig."]],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: [40, 40, 40] },
    styles: { fontSize: 9 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 20;

  // Signatures
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Candidate Signature", 30, finalY);
  doc.text("Controller of Examinations", 140, finalY);

  addPDFFooter(doc);
  doc.save(`hall_ticket_${studentData.enrollmentNumber || "pec"}.pdf`);
}

/**
 * Generate a fee payment receipt PDF
 */
export function exportFeeReceipt(txn: {
  receiptNo: string;
  amount: number;
  paymentMethod: string;
  status: string;
  gatewayTxnId?: string;
  createdAt: string;
  feeRecord?: { category: string; description: string; semester?: string; month?: string };
  student?: { name: string; email: string; studentProfile?: { enrollmentNumber?: string; department?: string } };
}) {
  const doc = new jsPDF();
  const y = addPDFHeader(doc, "Fee Payment Receipt");

  // Institution sub-line
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Punjab Engineering College (Deemed to be University), Chandigarh", 105, y - 5, { align: "center" });

  // Receipt box
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, y + 2, 180, 14, 3, 3, "FD");
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`Receipt No: ${txn.receiptNo}`, 20, y + 11);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    `Date: ${new Date(txn.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}`,
    195,
    y + 11,
    { align: "right" },
  );

  let cur = y + 22;

  // Student section
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Student Information", 20, cur);
  cur += 6;
  doc.setLineWidth(0.3);
  doc.setDrawColor(99, 102, 241);
  doc.line(20, cur, 100, cur);
  cur += 5;

  const studentRows = [
    ["Name", txn.student?.name ?? "—"],
    ["Email", txn.student?.email ?? "—"],
    ["Enrollment No.", txn.student?.studentProfile?.enrollmentNumber ?? "—"],
    ["Department", txn.student?.studentProfile?.department ?? "—"],
  ];

  autoTable(doc, {
    startY: cur,
    head: [],
    body: studentRows,
    theme: "plain",
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 50, textColor: [75, 85, 99] }, 1: { cellWidth: 120 } },
    margin: { left: 20 },
  });

  cur = (doc as any).lastAutoTable.finalY + 8;

  // Payment section
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Payment Details", 20, cur);
  cur += 6;
  doc.setDrawColor(16, 185, 129);
  doc.line(20, cur, 100, cur);
  cur += 5;

  const category = txn.feeRecord?.category ?? "—";
  const paymentRows = [
    ["Fee Category", category.charAt(0).toUpperCase() + category.slice(1)],
    ["Description", txn.feeRecord?.description ?? "—"],
    ...(txn.feeRecord?.semester ? [["Semester", txn.feeRecord.semester]] : []),
    ...(txn.feeRecord?.month ? [["Month", txn.feeRecord.month]] : []),
    ["Payment Method", txn.paymentMethod?.toUpperCase() ?? "—"],
    ["Transaction ID", txn.gatewayTxnId ?? "—"],
    ["Status", txn.status.toUpperCase()],
  ];

  autoTable(doc, {
    startY: cur,
    head: [],
    body: paymentRows,
    theme: "plain",
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 50, textColor: [75, 85, 99] }, 1: { cellWidth: 120 } },
    margin: { left: 20 },
  });

  cur = (doc as any).lastAutoTable.finalY + 8;

  // Amount box
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(0.8);
  doc.roundedRect(15, cur, 180, 20, 3, 3, "FD");
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(79, 70, 229);
  doc.text("Amount Paid", 20, cur + 13);
  doc.setFontSize(16);
  doc.text(
    `₹${txn.amount.toLocaleString("en-IN")}`,
    195,
    cur + 13,
    { align: "right" },
  );
  doc.setTextColor(0, 0, 0);

  cur += 28;

  // Status stamp
  if (txn.status === "success") {
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 185, 129);
    doc.text("✓ PAID", 105, cur, { align: "center" });
    doc.setTextColor(0, 0, 0);
    cur += 10;
  }

  // Note
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(107, 114, 128);
  doc.text("This is a computer-generated receipt and does not require a signature.", 105, cur, { align: "center" });

  addPDFFooter(doc);
  doc.save(`receipt_${txn.receiptNo}.pdf`);
}

export default {
  exportAttendanceReport,
  exportTimetablePDF,
  exportUserListPDF,
  exportCourseListPDF,
  exportUserProfile,
  exportCourseDetails,
  exportEnrolledStudents,
  exportHallTicket,
  exportFeeReceipt,
};
