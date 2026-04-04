import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../data/datasources/exam_remote_datasource.dart';
import '../../data/models/exam_model.dart';

final examDataSourceProvider = Provider<ExamRemoteDataSource>((ref) {
  return ExamRemoteDataSource(ref.watch(apiClientProvider));
});

final examsProvider = FutureProvider<List<ExamModel>>((ref) async {
  final user = ref.watch(authNotifierProvider).user;
  final ds = ref.watch(examDataSourceProvider);
  return ds.getExams(studentId: user?.id);
});

final upcomingExamsProvider = Provider<AsyncValue<List<ExamModel>>>((ref) {
  return ref.watch(examsProvider).whenData(
      (list) => list.where((e) => e.status == 'upcoming').toList()
        ..sort((a, b) => a.examDate.compareTo(b.examDate)));
});
