import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../data/datasources/timetable_remote_datasource.dart';
import '../../data/models/timetable_model.dart';

final timetableDataSourceProvider = Provider<TimetableRemoteDataSource>((ref) {
  return TimetableRemoteDataSource(ref.watch(apiClientProvider));
});

// TODO: replace with real API call once backend timetable endpoint is ready
final timetableProvider = FutureProvider<List<TimetableEntry>>((ref) async {
  return _dummyTimetable;
});

final _dummyTimetable = <TimetableEntry>[
  // Monday
  TimetableEntry(id: 't1',  courseName: 'Engineering Mathematics III', courseCode: 'MA301', facultyName: 'Dr. R. Sharma',   dayOfWeek: 'Monday',    startTime: '08:00', endTime: '09:00', room: 'LH-1'),
  TimetableEntry(id: 't2',  courseName: 'Data Structures',             courseCode: 'CS302', facultyName: 'Dr. A. Gupta',    dayOfWeek: 'Monday',    startTime: '09:00', endTime: '10:00', room: 'LH-3'),
  TimetableEntry(id: 't3',  courseName: 'Operating Systems',           courseCode: 'CS303', facultyName: 'Prof. S. Singh',  dayOfWeek: 'Monday',    startTime: '11:00', endTime: '12:00', room: 'LH-2'),
  TimetableEntry(id: 't4',  courseName: 'Computer Networks',           courseCode: 'CS304', facultyName: 'Dr. P. Kaur',    dayOfWeek: 'Monday',    startTime: '14:00', endTime: '15:00', room: 'LH-4'),
  // Tuesday
  TimetableEntry(id: 't5',  courseName: 'Database Management Systems', courseCode: 'CS305', facultyName: 'Dr. M. Verma',   dayOfWeek: 'Tuesday',   startTime: '08:00', endTime: '09:00', room: 'LH-2'),
  TimetableEntry(id: 't6',  courseName: 'Engineering Mathematics III', courseCode: 'MA301', facultyName: 'Dr. R. Sharma',   dayOfWeek: 'Tuesday',   startTime: '10:00', endTime: '11:00', room: 'LH-1'),
  TimetableEntry(id: 't7',  courseName: 'Data Structures Lab',         courseCode: 'CS302L', facultyName: 'Dr. A. Gupta',  dayOfWeek: 'Tuesday',   startTime: '13:00', endTime: '15:00', room: 'CS Lab-1'),
  // Wednesday
  TimetableEntry(id: 't8',  courseName: 'Operating Systems',           courseCode: 'CS303', facultyName: 'Prof. S. Singh',  dayOfWeek: 'Wednesday', startTime: '08:00', endTime: '09:00', room: 'LH-2'),
  TimetableEntry(id: 't9',  courseName: 'Computer Networks',           courseCode: 'CS304', facultyName: 'Dr. P. Kaur',    dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '10:00', room: 'LH-4'),
  TimetableEntry(id: 't10', courseName: 'Database Management Systems', courseCode: 'CS305', facultyName: 'Dr. M. Verma',   dayOfWeek: 'Wednesday', startTime: '11:00', endTime: '12:00', room: 'LH-3'),
  // Thursday
  TimetableEntry(id: 't11', courseName: 'Data Structures',             courseCode: 'CS302', facultyName: 'Dr. A. Gupta',   dayOfWeek: 'Thursday',  startTime: '08:00', endTime: '09:00', room: 'LH-3'),
  TimetableEntry(id: 't12', courseName: 'Engineering Mathematics III', courseCode: 'MA301', facultyName: 'Dr. R. Sharma',  dayOfWeek: 'Thursday',  startTime: '10:00', endTime: '11:00', room: 'LH-1'),
  TimetableEntry(id: 't13', courseName: 'OS Lab',                      courseCode: 'CS303L', facultyName: 'Prof. S. Singh',dayOfWeek: 'Thursday',  startTime: '13:00', endTime: '15:00', room: 'CS Lab-2'),
  // Friday
  TimetableEntry(id: 't14', courseName: 'Computer Networks',           courseCode: 'CS304', facultyName: 'Dr. P. Kaur',   dayOfWeek: 'Friday',    startTime: '09:00', endTime: '10:00', room: 'LH-4'),
  TimetableEntry(id: 't15', courseName: 'Database Management Systems', courseCode: 'CS305', facultyName: 'Dr. M. Verma',  dayOfWeek: 'Friday',    startTime: '10:00', endTime: '11:00', room: 'LH-2'),
  TimetableEntry(id: 't16', courseName: 'Operating Systems',           courseCode: 'CS303', facultyName: 'Prof. S. Singh',dayOfWeek: 'Friday',    startTime: '14:00', endTime: '15:00', room: 'LH-3'),
  // Saturday
  TimetableEntry(id: 't17', courseName: 'CN Lab',                      courseCode: 'CS304L', facultyName: 'Dr. P. Kaur',  dayOfWeek: 'Saturday',  startTime: '09:00', endTime: '11:00', room: 'CS Lab-3'),
  TimetableEntry(id: 't18', courseName: 'DBMS Lab',                    courseCode: 'CS305L', facultyName: 'Dr. M. Verma', dayOfWeek: 'Saturday',  startTime: '11:00', endTime: '13:00', room: 'CS Lab-1'),
];

/// Today's classes sorted by time.
final todayTimetableProvider = Provider<AsyncValue<List<TimetableEntry>>>((ref) {
  final all = ref.watch(timetableProvider);
  return all.whenData((entries) {
    final today = _dayName(DateTime.now().weekday);
    final filtered = entries
        .where((e) => e.dayOfWeek.toLowerCase() == today.toLowerCase())
        .toList()
      ..sort((a, b) => a.startMinutes.compareTo(b.startMinutes));
    return filtered;
  });
});

String _dayName(int weekday) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return days[weekday - 1];
}
