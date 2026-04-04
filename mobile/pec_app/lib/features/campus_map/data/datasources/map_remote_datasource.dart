import '../../../../core/api/api_client.dart';
import '../../../../core/api/api_endpoints.dart';
import '../models/map_model.dart';

class MapRemoteDataSource {
  final ApiClient _client;
  MapRemoteDataSource(this._client);

  Future<List<MapRegion>> getRegions() async {
    final resp = await _client.dio.get(ApiEndpoints.campusMapRegions);
    final raw = resp.data as Map<String, dynamic>;
    final items = raw['data'] as List<dynamic>? ??
        raw['features'] as List<dynamic>? ??
        raw['items'] as List<dynamic>? ??
        (resp.data is List ? resp.data as List<dynamic> : []);
    return items
        .map((e) => MapRegion.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
