import '../../../../core/api/api_client.dart';
import '../../../../core/api/api_endpoints.dart';

class ExaminationsRemoteDataSource {
  final ApiClient _client;

  ExaminationsRemoteDataSource(this._client);

  Future<List<Map<String, dynamic>>> getAll({String? department}) async {
    final query = <String, dynamic>{'limit': 300, 'offset': 0};
    if (department != null && department.trim().isNotEmpty) {
      query['department'] = department;
    }

    final res = await _client.dio.get(
      ApiEndpoints.examinations,
      queryParameters: query,
    );

    final data = res.data;
    if (data is Map && data.containsKey('data')) {
      return List<Map<String, dynamic>>.from(data['data'] as List);
    }
    if (data is List) {
      return List<Map<String, dynamic>>.from(data);
    }
    return [];
  }
}
