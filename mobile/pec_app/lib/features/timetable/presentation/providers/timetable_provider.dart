import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/utils/hive_cache.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../data/datasources/timetable_remote_datasource.dart';
import '../../data/models/timetable_model.dart';

final timetableDataSourceProvider = Provider<TimetableRemoteDataSource>((ref) {
  return TimetableRemoteDataSource(ref.watch(apiClientProvider));
});

final timetableProvider = FutureProvider<List<TimetableEntry>>((ref) async {
  const cacheKey = 'timetable_v1';
  // Try cache first
  final cached = await HiveCache.get<List<dynamic>>(cacheKey);
  if (cached != null) {
    return cached
        .map((e) => TimetableEntry.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  final user = ref.watch(authNotifierProvider).user;
  final ds = ref.watch(timetableDataSourceProvider);
  final entries = await ds.getMyTimetable(
    department: user?.department,
    semester: user?.semester,
  );

  // Cache 24 h
  await HiveCache.put(
    cacheKey,
    entries.map((e) => {
          'id': e.id,
          'courseName': e.courseName,
          'courseCode': e.courseCode,
          'facultyName': e.facultyName,
          'dayOfWeek': e.dayOfWeek,
          'startTime': e.startTime,
          'endTime': e.endTime,
          'room': e.room,
          'department': e.department,
          'semester': e.semester,
        }).toList(),
    ttl: const Duration(hours: 24),
  );
  return entries;
});

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
