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
    final data = resp.data;
    List<dynamic> items;
    if (data is Map<String, dynamic>) {
      items = data['data'] as List<dynamic>? ??
          data['items'] as List<dynamic>? ??
          <dynamic>[];
    } else if (data is List) {
      items = data;
    } else {
      items = <dynamic>[];
    }

    return items
        .whereType<Map>()
        .map((e) => ExamModel.fromJson(Map<String, dynamic>.from(e)))
        .toList();
  }
}
