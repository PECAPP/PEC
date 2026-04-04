import '../../../../core/api/api_client.dart';
import '../../../../core/api/api_endpoints.dart';
import '../models/timetable_model.dart';

class TimetableRemoteDataSource {
  final ApiClient _client;
  TimetableRemoteDataSource(this._client);

  Future<List<TimetableEntry>> getMyTimetable({
    String? department,
    int? semester,
  }) async {
    final resp = await _client.dio.get(
      ApiEndpoints.timetable,
      queryParameters: {
        'limit': 200,
        if (department != null) 'department': department,
        if (semester != null) 'semester': semester,
      },
    );
    final raw = resp.data as Map<String, dynamic>;
    final items = raw['data'] as List<dynamic>? ?? raw['items'] as List<dynamic>? ?? [];
    return items
        .map((e) => TimetableEntry.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
