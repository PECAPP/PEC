import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../features/auth/presentation/providers/auth_provider.dart';
import '../../../faculty_dashboard/data/models/schedule_entry_model.dart';
import '../../../faculty_dashboard/presentation/providers/dashboard_provider.dart';
import '../../data/datasources/timetable_remote_datasource.dart';

final _timetableDataSourceProvider = Provider((ref) {
  return TimetableRemoteDataSource(ref.read(apiClientProvider));
});

/// Groups timetable entries by day, cross-referencing with the user's courses.
class TimetableState {
  final bool loading;
  final Map<String, List<ScheduleEntry>> byDay;
  final String? error;

  const TimetableState({
    this.loading = true,
    this.byDay = const {},
    this.error,
  });

  TimetableState copyWith({
    bool? loading,
    Map<String, List<ScheduleEntry>>? byDay,
    String? error,
  }) =>
      TimetableState(
        loading: loading ?? this.loading,
        byDay: byDay ?? this.byDay,
        error: error,
      );
}

class TimetableNotifier extends StateNotifier<TimetableState> {
  final TimetableRemoteDataSource _ds;
  final List<String> _courseIds;
  final Map<String, String> _courseNames;
  final Map<String, int> _enrollmentCounts;

  TimetableNotifier(
    this._ds,
    this._courseIds,
    this._courseNames,
    this._enrollmentCounts,
  ) : super(const TimetableState()) {
    load();
  }

  Future<void> load() async {
    state = state.copyWith(loading: true, error: null);
    try {
      final entries = await _ds.getAll();

      // Filter to only the user's courses
      final relevant = entries.where((t) {
        final courseId = t['courseId']?.toString() ?? '';
        return _courseIds.contains(courseId);
      });

      // Group by day
      final Map<String, List<ScheduleEntry>> byDay = {};
      for (final t in relevant) {
        final day = t['day']?.toString() ?? 'Unknown';
        final courseId = t['courseId']?.toString() ?? '';
        final entry = ScheduleEntry(
          id: (t['id'] ?? '').toString(),
          time: '${t['startTime'] ?? ''} - ${t['endTime'] ?? ''}',
          course: _courseNames[courseId] ?? 'Class',
          section: t['section']?.toString() ?? 'N/A',
          room: t['room']?.toString() ?? 'TBA',
          students: _enrollmentCounts[courseId] ?? 0,
        );
        byDay.putIfAbsent(day, () => []).add(entry);
      }

      // Sort each day's entries by start time
      for (final list in byDay.values) {
        list.sort((a, b) => a.time.compareTo(b.time));
      }

      state = TimetableState(loading: false, byDay: byDay);
    } catch (e) {
      state = state.copyWith(loading: false, error: e.toString());
    }
  }
}

final timetableProvider =
    StateNotifierProvider<TimetableNotifier, TimetableState>((ref) {
  final dashboard = ref.watch(dashboardProvider);
  final courses = dashboard.courses;

  final courseIds = courses.map((c) => c.id).toList();
  final courseNames = {for (final c in courses) c.id: c.name};
  final enrollmentCounts = {for (final c in dashboard.courseCards) c.id: c.students};

  return TimetableNotifier(
    ref.read(_timetableDataSourceProvider),
    courseIds,
    courseNames,
    enrollmentCounts,
  );
});
