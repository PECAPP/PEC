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

  static String _asString(dynamic value, {String fallback = ''}) {
    if (value == null) return fallback;
    if (value is String) return value;
    return value.toString();
  }

  static int _asInt(dynamic value, {int fallback = 0}) {
    if (value is int) return value;
    if (value is num) return value.toInt();
    return int.tryParse(value?.toString() ?? '') ?? fallback;
  }

  factory CourseModel.fromJson(Map<String, dynamic> j) => CourseModel(
        id: _asString(j['id']),
        code: _asString(j['code']),
        name: _asString(j['name'], fallback: 'Untitled Course'),
        credits: _asInt(j['credits'], fallback: 0),
        instructor: j['instructor']?.toString(),
        instructorId: j['facultyId']?.toString(),
        department: _asString(j['department']),
        semester: j['semester'] != null ? _asInt(j['semester']) : null,
        status: _asString(j['status'], fallback: 'active'),
        capacity: _asInt(j['capacity'], fallback: 60),
        prerequisiteIds: (j['prerequisiteIds'] as List<dynamic>?)
                ?.map((e) => e.toString())
                .toList() ??
            [],
        enrollmentCount: _asInt(
          (j['_count'] as Map<String, dynamic>?)?['enrollments'] ??
              j['enrollmentCount'],
          fallback: 0,
        ),
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'code': code,
        'name': name,
        'credits': credits,
        'instructor': instructor,
        'facultyId': instructorId,
        'department': department,
        'semester': semester,
        'status': status,
        'capacity': capacity,
        'prerequisiteIds': prerequisiteIds,
        'enrollmentCount': enrollmentCount,
      };
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

  static String _asString(dynamic value, {String fallback = ''}) {
    if (value == null) return fallback;
    if (value is String) return value;
    return value.toString();
  }

  static int _asInt(dynamic value, {int fallback = 0}) {
    if (value is int) return value;
    if (value is num) return value.toInt();
    return int.tryParse(value?.toString() ?? '') ?? fallback;
  }

  factory EnrollmentModel.fromJson(Map<String, dynamic> j) => EnrollmentModel(
        id: _asString(j['id']),
        studentId: _asString(j['studentId']),
        courseId: _asString(j['courseId']),
        courseName: _asString(
          j['courseName'] ?? (j['course'] as Map<String, dynamic>?)?['name'],
          fallback: 'Unknown Course',
        ),
        courseCode: _asString(
          j['courseCode'] ?? (j['course'] as Map<String, dynamic>?)?['code'],
        ),
        semester: j['semester'] != null ? _asInt(j['semester']) : null,
        batch: j['batch']?.toString(),
        status: _asString(j['status'], fallback: 'active'),
        enrolledAt:
            DateTime.tryParse(_asString(j['enrolledAt'])) ?? DateTime.now(),
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'studentId': studentId,
        'courseId': courseId,
        'courseName': courseName,
        'courseCode': courseCode,
        'semester': semester,
        'batch': batch,
        'status': status,
        'enrolledAt': enrolledAt.toIso8601String(),
      };
}
