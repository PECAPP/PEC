import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../data/datasources/attendance_remote_datasource.dart';
import '../../data/models/attendance_model.dart';

final attendanceDataSourceProvider = Provider<AttendanceRemoteDataSource>((ref) {
  return AttendanceRemoteDataSource(ref.watch(apiClientProvider));
});

final attendanceSummaryProvider =
    FutureProvider<List<AttendanceSummary>>((ref) async {
  final user = ref.watch(authNotifierProvider).user;
  if (user == null) return [];
  final ds = ref.watch(attendanceDataSourceProvider);
  return ds.getSummary(studentId: user.id);
});

final attendanceHistoryProvider =
    FutureProvider<List<AttendanceRecord>>((ref) async {
  final user = ref.watch(authNotifierProvider).user;
  if (user == null) return [];
  final ds = ref.watch(attendanceDataSourceProvider);
  return ds.getHistory(studentId: user.id);
});

// Derived: overall stats across all courses
final overallAttendanceProvider = Provider<AsyncValue<Map<String, dynamic>>>((ref) {
  return ref.watch(attendanceSummaryProvider).whenData((summaries) {
    if (summaries.isEmpty) return {'present': 0, 'absent': 0, 'pct': 0.0};
    final totalPresent = summaries.fold<int>(0, (s, e) => s + e.present);
    final totalAbsent = summaries.fold<int>(0, (s, e) => s + e.absent);
    final total = totalPresent + totalAbsent;
    return {
      'present': totalPresent,
      'absent': totalAbsent,
      'pct': total > 0 ? (totalPresent / total * 100) : 0.0,
    };
  });
});
