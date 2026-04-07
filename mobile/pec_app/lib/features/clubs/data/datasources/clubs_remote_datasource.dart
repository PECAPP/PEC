import '../../../../core/api/api_client.dart';
import '../../../../core/api/api_endpoints.dart';
import '../models/club_model.dart';

class ClubsRemoteDataSource {
  final ApiClient _client;
  ClubsRemoteDataSource(this._client);

  Future<List<ClubModel>> getClubs({int limit = 100}) async {
    final resp = await _client.dio.get(
      ApiEndpoints.clubs,
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
        .map((e) => ClubModel.fromJson(Map<String, dynamic>.from(e)))
        .toList();
  }

  Future<ClubModel> getClub(String id) async {
    final resp = await _client.dio.get(ApiEndpoints.club(id));
    return ClubModel.fromJson(resp.data as Map<String, dynamic>);
  }

  Future<void> sendJoinRequest(String clubId) async {
    await _client.dio.post(ApiEndpoints.clubJoinRequest(clubId));
  }

  Future<void> cancelJoinRequest(String clubId, String requestId) async {
    await _client.dio
        .delete(ApiEndpoints.clubJoinRequestAction(clubId, requestId));
  }
}
