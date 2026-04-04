import '../../../../core/api/api_client.dart';
import '../../../../core/api/api_endpoints.dart';
import '../models/score_model.dart';

class ScoreRemoteDataSource {
  final ApiClient _client;
  ScoreRemoteDataSource(this._client);

  Future<List<SubjectScore>> getMyScores({String? studentId}) async {
    final resp = await _client.dio.get(
      ApiEndpoints.cgpaEntries,
      queryParameters: {
        'limit': 200,
        if (studentId != null) 'studentId': studentId,
      },
    );
    final raw = resp.data as Map<String, dynamic>;
    final items = raw['data'] as List<dynamic>? ??
        raw['items'] as List<dynamic>? ??
        (resp.data is List ? resp.data as List<dynamic> : []);
    return items
        .map((e) => SubjectScore.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
