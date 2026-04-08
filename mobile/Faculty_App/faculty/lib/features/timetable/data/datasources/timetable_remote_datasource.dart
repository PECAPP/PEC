import '../../../../core/api/api_client.dart';
import '../../../../core/api/api_endpoints.dart';

class TimetableRemoteDataSource {
  final ApiClient _client;
  TimetableRemoteDataSource(this._client);

  /// GET /timetable — returns all entries for the current user.
  Future<List<Map<String, dynamic>>> getAll() async {
    final res = await _client.dio.get(ApiEndpoints.timetable);
    final data = res.data;
    if (data is Map && data.containsKey('data')) {
      return List<Map<String, dynamic>>.from(data['data'] as List);
    }
    if (data is List) return List<Map<String, dynamic>>.from(data);
    return [];
  }
}
