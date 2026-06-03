import '../../../../core/api/api_client.dart';
import '../../../../core/api/api_endpoints.dart';
import '../models/material_model.dart';

class MaterialsRemoteDataSource {
  final ApiClient _client;
  MaterialsRemoteDataSource(this._client);

  List<dynamic> _extractItems(dynamic raw) {
    if (raw is List) return raw;
    if (raw is Map<String, dynamic>) {
      final data = raw['data'];
      if (data is List) return data;
      if (data is Map<String, dynamic>) {
        final nestedItems = data['items'];
        if (nestedItems is List) return nestedItems;
      }
      final items = raw['items'];
      if (items is List) return items;
      final results = raw['results'];
      if (results is List) return results;
    }
    return const [];
  }

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

    final items = _extractItems(resp.data);
    return items
        .whereType<Map<String, dynamic>>()
        .map(CourseMaterialModel.fromJson)
        .toList(growable: false);
  }
}
