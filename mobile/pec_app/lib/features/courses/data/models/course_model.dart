class CourseModel {
  final String id;
  final String code;
  final String name;
  final int credits;
  final String? instructor;
  final String? instructorId;
  final String department;
  final int? semester;
  final String status;
  final int capacity;
  final List<String> prerequisiteIds;
  final int enrollmentCount;

  const CourseModel({
    required this.id,
    required this.code,
    required this.name,
    required this.credits,
    this.instructor,
    this.instructorId,
    required this.department,
    this.semester,
    required this.status,
    required this.capacity,
    required this.prerequisiteIds,
    required this.enrollmentCount,
  });

  factory CourseModel.fromJson(Map<String, dynamic> j) => CourseModel(
        id: j['id'] as String,
        code: j['code'] as String,
        name: j['name'] as String,
        credits: (j['credits'] as num).toInt(),
        instructor: j['instructor'] as String?,
        instructorId: j['facultyId'] as String?,
        department: j['department'] as String? ?? '',
        semester: j['semester'] != null ? (j['semester'] as num).toInt() : null,
        status: j['status'] as String? ?? 'active',
        capacity: (j['capacity'] as num?)?.toInt() ?? 60,
        prerequisiteIds: (j['prerequisiteIds'] as List<dynamic>?)
                ?.map((e) => e as String)
                .toList() ??
            [],
        enrollmentCount:
            (j['_count'] as Map<String, dynamic>?)?['enrollments'] as int? ?? 0,
      );
}

class EnrollmentModel {
  final String id;
  final String studentId;
  final String courseId;
  final String courseName;
  final String courseCode;
  final int? semester;
  final String? batch;
  final String status;
  final DateTime enrolledAt;

  const EnrollmentModel({
    required this.id,
    required this.studentId,
    required this.courseId,
    required this.courseName,
    required this.courseCode,
    this.semester,
    this.batch,
    required this.status,
    required this.enrolledAt,
  });

  factory EnrollmentModel.fromJson(Map<String, dynamic> j) => EnrollmentModel(
        id: j['id'] as String,
        studentId: j['studentId'] as String,
        courseId: j['courseId'] as String,
        courseName: j['courseName'] as String,
        courseCode: j['courseCode'] as String,
        semester:
            j['semester'] != null ? (j['semester'] as num).toInt() : null,
        batch: j['batch'] as String?,
        status: j['status'] as String? ?? 'active',
        enrolledAt: DateTime.parse(j['enrolledAt'] as String),
      );
}
