class ExamModel {
  final String id;
  final String courseName;
  final String courseCode;
  final String examType; // midterm | endterm | quiz | assignment
  final DateTime examDate;
  final String? venue;
  final String? duration;
  final String? instructions;
  final String status; // upcoming | ongoing | completed

  const ExamModel({
    required this.id,
    required this.courseName,
    required this.courseCode,
    required this.examType,
    required this.examDate,
    this.venue,
    this.duration,
    this.instructions,
    required this.status,
  });

  factory ExamModel.fromJson(Map<String, dynamic> j) {
    final dateStr = j['examDate'] as String? ?? j['date'] as String? ?? DateTime.now().toIso8601String();
    final examDate = DateTime.tryParse(dateStr) ?? DateTime.now();
    final now = DateTime.now();
    String status;
    if (examDate.isBefore(now.subtract(const Duration(hours: 3)))) {
      status = 'completed';
    } else if (examDate.isBefore(now.add(const Duration(hours: 3)))) {
      status = 'ongoing';
    } else {
      status = 'upcoming';
    }
    return ExamModel(
      id: j['id'] as String,
      courseName: j['courseName'] as String? ?? j['course']?['name'] as String? ?? '',
      courseCode: j['courseCode'] as String? ?? j['course']?['code'] as String? ?? '',
      examType: j['examType'] as String? ?? j['type'] as String? ?? 'exam',
      examDate: examDate,
      venue: j['venue'] as String?,
      duration: j['duration'] as String?,
      instructions: j['instructions'] as String?,
      status: status,
    );
  }

  Duration get timeUntil => examDate.difference(DateTime.now());
}
