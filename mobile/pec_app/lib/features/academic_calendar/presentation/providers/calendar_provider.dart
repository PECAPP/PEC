import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../data/datasources/calendar_remote_datasource.dart';
import '../../data/models/calendar_event_model.dart';

final calendarDataSourceProvider = Provider<CalendarRemoteDataSource>((ref) {
  return CalendarRemoteDataSource(ref.watch(apiClientProvider));
});

final calendarEventsProvider = FutureProvider<List<CalendarEventModel>>((ref) async {
  final ds = ref.watch(calendarDataSourceProvider);
  return ds.getEvents();
});

/// Events indexed by date string "yyyy-MM-dd"
final eventsByDayProvider = Provider<AsyncValue<Map<String, List<CalendarEventModel>>>>((ref) {
  return ref.watch(calendarEventsProvider).whenData((events) {
    final map = <String, List<CalendarEventModel>>{};
    for (final e in events) {
      final key = _dateKey(e.date);
      map.putIfAbsent(key, () => []).add(e);
    }
    return map;
  });
});

String _dateKey(DateTime d) =>
    '${d.year}-${d.month.toString().padLeft(2,'0')}-${d.day.toString().padLeft(2,'0')}';
