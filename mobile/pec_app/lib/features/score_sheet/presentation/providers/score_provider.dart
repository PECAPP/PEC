import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../data/datasources/score_remote_datasource.dart';
import '../../data/models/score_model.dart';

final scoreDataSourceProvider = Provider<ScoreRemoteDataSource>((ref) {
  return ScoreRemoteDataSource(ref.watch(apiClientProvider));
});

final cgpaProvider = FutureProvider<CgpaData>((ref) async {
  final user = ref.watch(authNotifierProvider).user;
  final ds = ref.watch(scoreDataSourceProvider);
  final scores = await ds.getMyScores(studentId: user?.id);
  return CgpaData.fromScores(scores);
});
