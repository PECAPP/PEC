import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/utils/hive_cache.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../data/datasources/calendar_remote_datasource.dart';
import '../../data/models/calendar_event_model.dart';

const _cacheCalendarEventsKey = 'academic_calendar:events:v1';

final calendarDataSourceProvider = Provider<CalendarRemoteDataSource>((ref) {
  return CalendarRemoteDataSource(ref.watch(apiClientProvider));
});

final calendarEventsProvider =
    FutureProvider<List<CalendarEventModel>>((ref) async {
  final ds = ref.watch(calendarDataSourceProvider);

  List<CalendarEventModel> events;
  try {
    events = await ds.getEvents();
    await HiveCache.put(
      _cacheCalendarEventsKey,
      events.map((e) => e.toJson()).toList(),
      ttl: const Duration(days: 14),
    );
  } catch (_) {
    final cachedRaw = await HiveCache.get<List>(_cacheCalendarEventsKey);
    if (cachedRaw != null) {
      events = cachedRaw
          .whereType<Map>()
          .map((e) => CalendarEventModel.fromJson(Map<String, dynamic>.from(e)))
          .toList();
    } else {
      events = _fallbackCalendarEvents();
    }
  }

  events.sort((a, b) => a.date.compareTo(b.date));
  return events;
});

/// Events indexed by date string "yyyy-MM-dd"
final eventsByDayProvider =
    Provider<AsyncValue<Map<String, List<CalendarEventModel>>>>((ref) {
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
    '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

List<CalendarEventModel> _fallbackCalendarEvents() {
  final now = DateTime.now();
  final y = now.year;
  return [
    CalendarEventModel(
      id: 'fallback-cal-1',
      title: 'Academic Calendar Offline Mode',
      description:
          'Live events will sync automatically once backend is reachable.',
      date: DateTime(y, now.month, now.day),
      eventType: 'event',
      category: 'academic',
      importance: 'medium',
    ),
    CalendarEventModel(
      id: 'fallback-cal-2',
      title: 'Mid-Semester Assessment Window',
      description: 'Tentative schedule for planning and preparation.',
      date: DateTime(y, now.month, now.day).add(const Duration(days: 7)),
      eventType: 'exam',
      category: 'academic',
      importance: 'high',
    ),
    CalendarEventModel(
      id: 'fallback-cal-3',
      title: 'Assignment Submission Deadline',
      description:
          'Submit coursework before the deadline to avoid late penalties.',
      date: DateTime(y, now.month, now.day).add(const Duration(days: 14)),
      eventType: 'deadline',
      category: 'academic',
      importance: 'high',
    ),
  ];
}
