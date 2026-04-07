import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/utils/hive_cache.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../data/datasources/exam_remote_datasource.dart';
import '../../data/models/exam_model.dart';

const _cacheExamsKey = 'examinations:list:v1';

final examDataSourceProvider = Provider<ExamRemoteDataSource>((ref) {
  return ExamRemoteDataSource(ref.watch(apiClientProvider));
});

final examsProvider = FutureProvider<List<ExamModel>>((ref) async {
  final user = ref.watch(authNotifierProvider).user;
  final ds = ref.watch(examDataSourceProvider);

  List<ExamModel> exams;
  try {
    exams = await ds.getExams(studentId: user?.id);
    await HiveCache.put(
      _cacheExamsKey,
      exams.map((e) => e.toJson()).toList(),
      ttl: const Duration(days: 7),
    );
  } catch (_) {
    final cachedRaw = await HiveCache.get<List>(_cacheExamsKey);
    if (cachedRaw != null) {
      exams = cachedRaw
          .whereType<Map>()
          .map((e) => ExamModel.fromJson(Map<String, dynamic>.from(e)))
          .toList();
    } else {
      exams = _fallbackExams();
    }
  }

  return exams;
});

List<ExamModel> _fallbackExams() {
  final now = DateTime.now();
  return [
    ExamModel(
      id: 'fallback-exam-1',
      courseName: 'Applied Mathematics',
      courseCode: 'MA201',
      examType: 'midterm',
      examDate: now.add(const Duration(days: 5, hours: 3)),
      venue: 'Hall A-101',
      duration: '2h',
      instructions: 'Bring ID card and writing material.',
      status: 'upcoming',
    ),
    ExamModel(
      id: 'fallback-exam-2',
      courseName: 'Data Structures',
      courseCode: 'CS202',
      examType: 'quiz',
      examDate: now.add(const Duration(days: 9, hours: 1)),
      venue: 'Block C-204',
      duration: '1h',
      status: 'upcoming',
    ),
    ExamModel(
      id: 'fallback-exam-3',
      courseName: 'Digital Electronics',
      courseCode: 'EC203',
      examType: 'endterm',
      examDate: now.subtract(const Duration(days: 10)),
      venue: 'Hall B-02',
      duration: '3h',
      status: 'completed',
    ),
  ];
}

final upcomingExamsProvider = Provider<AsyncValue<List<ExamModel>>>((ref) {
  return ref.watch(examsProvider).whenData((list) =>
      list.where((e) => e.status == 'upcoming').toList()
        ..sort((a, b) => a.examDate.compareTo(b.examDate)));
});
