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
        .map((e) => CalendarEventModel.fromJson(Map<String, dynamic>.from(e)))
        .toList();
  }
}
