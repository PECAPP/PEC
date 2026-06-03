class AttendanceSummary {
  final int present;
  final int absent;
  final double percentage;
  final String courseId;
  final String courseName;
  final String courseCode;

  const AttendanceSummary({
    required this.present,
    required this.absent,
    required this.percentage,
    required this.courseId,
    required this.courseName,
    required this.courseCode,
  });

  factory AttendanceSummary.fromJson(Map<String, dynamic> j) =>
      AttendanceSummary(
        present: (j['present'] as num?)?.toInt() ?? 0,
        absent: (j['absent'] as num?)?.toInt() ?? 0,
        percentage: (j['percentage'] as num?)?.toDouble() ?? 0.0,
        courseId: j['courseId'] as String? ?? '',
        courseName: j['courseName'] as String? ?? '',
        courseCode: j['courseCode'] as String? ?? '',
      );
}

class AttendanceRecord {
  final String id;
  final String courseId;
  final String courseName;
  final String courseCode;
  final String status; // present | absent | late
  final DateTime date;

  const AttendanceRecord({
    required this.id,
    required this.courseId,
    required this.courseName,
    required this.courseCode,
    required this.status,
    required this.date,
  });

  factory AttendanceRecord.fromJson(Map<String, dynamic> j) => AttendanceRecord(
        id: j['id'] as String,
        courseId: j['courseId'] as String? ?? '',
        courseName: j['courseName'] as String? ?? '',
        courseCode: j['courseCode'] as String? ?? '',
        status: j['status'] as String? ?? 'absent',
        date: DateTime.parse(j['date'] as String? ?? j['createdAt'] as String),
      );
}
