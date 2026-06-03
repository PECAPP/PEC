class ScheduleEntry {
  final String id;
  final String time;
  final String course;
  final String section;
  final String room;
  final int students;
  final ScheduleStatus status;

  const ScheduleEntry({
    required this.id,
    required this.time,
    required this.course,
    this.section = 'N/A',
    this.room = 'TBA',
    this.students = 0,
    this.status = ScheduleStatus.upcoming,
  });
}

enum ScheduleStatus { completed, ongoing, upcoming }
