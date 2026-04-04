import '../../../../core/api/api_client.dart';
import '../../../../core/api/api_endpoints.dart';
import '../models/calendar_event_model.dart';

class CalendarRemoteDataSource {
  final ApiClient _client;
  CalendarRemoteDataSource(this._client);

  Future<List<CalendarEventModel>> getEvents({int limit = 300}) async {
    final resp = await _client.dio.get(
      ApiEndpoints.academicCalendar,
      queryParameters: {'limit': limit},
    );
    final raw = resp.data as Map<String, dynamic>;
    final items = raw['data'] as List<dynamic>? ?? raw['items'] as List<dynamic>? ?? [];
    return items
        .map((e) => CalendarEventModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
