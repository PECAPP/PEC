class CourseCardModel {
  final String id;
  final String code;
  final String name;
  final int students;
  final int progress;
  final int avgAttendance;
  final String? facultyId;
  final String? instructorName;
  final String? semester;
  final String? department;
  final String? status;

  const CourseCardModel({
    required this.id,
    required this.code,
    required this.name,
    this.students = 0,
    this.progress = 0,
    this.avgAttendance = 0,
    this.facultyId,
    this.instructorName,
    this.semester,
    this.department,
    this.status,
  });

  factory CourseCardModel.fromJson(Map<String, dynamic> json) {
    return CourseCardModel(
      id: (json['id'] ?? '').toString(),
      code: json['code'] as String? ?? 'COURSE',
      name: json['name'] as String? ?? 'Untitled',
      students: json['students'] as int? ?? 0,
      progress: json['progress'] as int? ?? 0,
      avgAttendance: json['avgAttendance'] as int? ?? 0,
      facultyId: json['facultyId'] as String?,
      instructorName: json['instructor'] as String? ?? json['facultyName'] as String?,
      semester: json['semester']?.toString(),
      department: json['department'] as String?,
      status: json['status'] as String?,
    );
  }
}
