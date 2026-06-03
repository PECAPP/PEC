import '../../../../core/api/api_client.dart';
import '../../../../core/api/api_endpoints.dart';
import '../models/notification_model.dart';

class NotificationsRemoteDataSource {
  final ApiClient _client;
  NotificationsRemoteDataSource(this._client);

  Future<List<AppNotification>> getNotifications({int limit = 50}) async {
    final resp = await _client.dio.get(
      ApiEndpoints.notifications,
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
        .map((e) => AppNotification.fromJson(Map<String, dynamic>.from(e)))
        .toList();
  }

  Future<void> markRead(String id) async {
    await _client.dio.patch(ApiEndpoints.notificationRead(id));
  }

  Future<void> delete(String id) async {
    await _client.dio.delete(ApiEndpoints.notificationDelete(id));
  }
}
