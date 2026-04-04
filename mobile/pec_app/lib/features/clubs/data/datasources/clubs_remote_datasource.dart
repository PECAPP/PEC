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
    final raw = resp.data as Map<String, dynamic>;
    final items = raw['data'] as List<dynamic>? ??
        raw['items'] as List<dynamic>? ??
        (resp.data is List ? resp.data as List<dynamic> : []);
    return items
        .map((e) => ClubModel.fromJson(e as Map<String, dynamic>))
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
    await _client.dio.delete(
        ApiEndpoints.clubJoinRequestAction(clubId, requestId));
  }
}
