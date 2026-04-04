import '../../../../core/api/api_client.dart';
import '../../../../core/api/api_endpoints.dart';
import '../models/material_model.dart';

class MaterialsRemoteDataSource {
  final ApiClient _client;
  MaterialsRemoteDataSource(this._client);

  Future<List<CourseMaterialModel>> getMaterials({
    String? courseId,
    int limit = 200,
  }) async {
    final resp = await _client.dio.get(
      ApiEndpoints.courseMaterials,
      queryParameters: {
        'limit': limit,
        if (courseId != null) 'courseId': courseId,
      },
    );
    final raw = resp.data as Map<String, dynamic>;
    final items = raw['data'] as List<dynamic>? ?? raw['items'] as List<dynamic>? ?? [];
    return items
        .map((e) => CourseMaterialModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
