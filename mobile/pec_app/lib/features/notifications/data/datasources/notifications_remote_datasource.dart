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
    final raw = resp.data as Map<String, dynamic>;
    final items = raw['data'] as List<dynamic>? ??
        raw['items'] as List<dynamic>? ??
        (resp.data is List ? resp.data as List<dynamic> : []);
    return items
        .map((e) => AppNotification.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<void> markRead(String id) async {
    await _client.dio.patch(ApiEndpoints.notificationRead(id));
  }

  Future<void> delete(String id) async {
    await _client.dio.delete(ApiEndpoints.notificationDelete(id));
  }
}
