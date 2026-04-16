class ExamPlanItem {
  final String id;
  final DateTime date;
  final String subjectCode;
  final String subjectName;
  final String className;
  final String section;
  final String startTime;
  final String endTime;
  final String venue;
  final String examType;

  const ExamPlanItem({
    required this.id,
    required this.date,
    required this.subjectCode,
    required this.subjectName,
    required this.className,
    required this.section,
    required this.startTime,
    required this.endTime,
    required this.venue,
    required this.examType,
  });

  String get classSection => section.isEmpty ? className : '$className • Sec $section';

  String get timeSlot => '$startTime - $endTime';

  factory ExamPlanItem.fromJson(Map<String, dynamic> json) {
    DateTime parsedDate;
    final dateRaw = json['examDate'] ?? json['date'] ?? json['scheduledDate'];
    if (dateRaw is String) {
      parsedDate = DateTime.tryParse(dateRaw) ?? DateTime.now();
    } else {
      parsedDate = DateTime.now();
    }

    return ExamPlanItem(
      id: (json['id'] ?? json['_id'] ?? '').toString(),
      date: DateTime(parsedDate.year, parsedDate.month, parsedDate.day),
      subjectCode: (json['subjectCode'] ?? json['courseCode'] ?? json['code'] ?? 'SUB').toString(),
      subjectName: (json['subjectName'] ?? json['courseName'] ?? json['subject'] ?? 'Subject').toString(),
      className: (json['className'] ?? json['program'] ?? json['class'] ?? 'Class').toString(),
      section: (json['section'] ?? '').toString(),
      startTime: (json['startTime'] ?? json['slotStart'] ?? '10:00').toString(),
      endTime: (json['endTime'] ?? json['slotEnd'] ?? '12:00').toString(),
      venue: (json['venue'] ?? json['room'] ?? 'TBA').toString(),
      examType: (json['examType'] ?? json['type'] ?? 'Midterm').toString(),
    );
  }
}
