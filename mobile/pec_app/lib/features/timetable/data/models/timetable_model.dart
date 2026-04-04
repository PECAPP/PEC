class TimetableEntry {
  final String id;
  final String courseName;
  final String courseCode;
  final String? facultyName;
  final String dayOfWeek; // Monday..Saturday
  final String startTime;
  final String endTime;
  final String? room;
  final String? department;
  final int? semester;

  const TimetableEntry({
    required this.id,
    required this.courseName,
    required this.courseCode,
    this.facultyName,
    required this.dayOfWeek,
    required this.startTime,
    required this.endTime,
    this.room,
    this.department,
    this.semester,
  });

  factory TimetableEntry.fromJson(Map<String, dynamic> j) => TimetableEntry(
        id: j['id'] as String,
        courseName: j['courseName'] as String? ?? '',
        courseCode: j['courseCode'] as String? ?? '',
        facultyName: j['facultyName'] as String?,
        dayOfWeek: j['dayOfWeek'] as String? ?? 'Monday',
        startTime: j['startTime'] as String? ?? '08:00',
        endTime: j['endTime'] as String? ?? '09:00',
        room: j['room'] as String?,
        department: j['department'] as String?,
        semester: j['semester'] != null ? (j['semester'] as num).toInt() : null,
      );

  /// Returns a comparable 24h int like 800, 1430 for sorting.
  int get startMinutes {
    final parts = startTime.split(':');
    return int.parse(parts[0]) * 60 + int.parse(parts[1]);
  }
}
