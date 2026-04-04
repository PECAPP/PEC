import '../../../../core/api/api_client.dart';
import '../../../../core/api/api_endpoints.dart';
import '../models/exam_model.dart';

class ExamRemoteDataSource {
  final ApiClient _client;
  ExamRemoteDataSource(this._client);

  Future<List<ExamModel>> getExams({String? studentId, int limit = 100}) async {
    final resp = await _client.dio.get(
      ApiEndpoints.examinations,
      queryParameters: {
        'limit': limit,
        if (studentId != null) 'studentId': studentId,
      },
    );
    final raw = resp.data as Map<String, dynamic>;
    final items = raw['data'] as List<dynamic>? ?? raw['items'] as List<dynamic>? ?? [];
    return items.map((e) => ExamModel.fromJson(e as Map<String, dynamic>)).toList();
  }
}
