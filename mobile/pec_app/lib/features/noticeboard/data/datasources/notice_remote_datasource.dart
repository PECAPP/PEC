import '../../../../core/api/api_client.dart';
import '../../../../core/api/api_endpoints.dart';
import '../models/notice_model.dart';

class NoticeRemoteDataSource {
  final ApiClient _client;
  NoticeRemoteDataSource(this._client);

  Future<List<NoticeModel>> getNotices({int limit = 50}) async {
    final resp = await _client.dio.get(
      ApiEndpoints.noticeboard,
      queryParameters: {'limit': limit},
    );
    final raw = resp.data as Map<String, dynamic>;
    final items = raw['data'] as List<dynamic>? ??
        raw['items'] as List<dynamic>? ??
        (resp.data is List ? resp.data as List<dynamic> : []);
    return items
        .map((e) => NoticeModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
