import '../../../../core/api/api_client.dart';
import '../../../../core/api/api_endpoints.dart';

class CourseMaterialsDataSource {
  final ApiClient _client;
  CourseMaterialsDataSource(this._client);

  /// GET /course-materials?courseId=...
  Future<List<Map<String, dynamic>>> getMaterials(String courseId) async {
    final res = await _client.dio.get(
      ApiEndpoints.courseMaterials,
      queryParameters: {'courseId': courseId, 'limit': 100},
    );
    final data = res.data;
    if (data is Map && data.containsKey('data')) {
      return List<Map<String, dynamic>>.from(data['data'] as List);
    }
    if (data is List) return List<Map<String, dynamic>>.from(data);
    return [];
  }

  /// POST /course-materials
  Future<Map<String, dynamic>> create(Map<String, dynamic> body) async {
    final res = await _client.dio.post(ApiEndpoints.courseMaterials, data: body);
    return res.data as Map<String, dynamic>;
  }

  /// DELETE /course-materials/:id
  Future<void> delete(String id) async {
    await _client.dio.delete(ApiEndpoints.courseMaterial(id));
  }
}
