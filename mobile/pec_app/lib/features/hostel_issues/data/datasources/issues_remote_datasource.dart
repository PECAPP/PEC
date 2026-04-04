import '../../../../core/api/api_client.dart';
import '../../../../core/api/api_endpoints.dart';
import '../models/issue_model.dart';

class IssuesRemoteDataSource {
  final ApiClient _client;
  IssuesRemoteDataSource(this._client);

  Future<List<HostelIssue>> getMyIssues() async {
    final resp = await _client.dio.get(
      ApiEndpoints.hostelIssues,
      queryParameters: {'mine': true, 'limit': 100},
    );
    final raw = resp.data as Map<String, dynamic>;
    final items = raw['data'] as List<dynamic>? ??
        raw['items'] as List<dynamic>? ??
        (resp.data is List ? resp.data as List<dynamic> : []);
    return items
        .map((e) => HostelIssue.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<HostelIssue> createIssue({
    required String title,
    required String description,
    required String category,
    required String priority,
    String? roomNumber,
    String? imageUrl,
  }) async {
    final resp = await _client.dio.post(
      ApiEndpoints.hostelIssues,
      data: {
        'title': title,
        'description': description,
        'category': category,
        'priority': priority,
        if (roomNumber != null) 'roomNumber': roomNumber,
        if (imageUrl != null) 'imageUrl': imageUrl,
      },
    );
    return HostelIssue.fromJson(resp.data as Map<String, dynamic>);
  }

  Future<void> deleteIssue(String id) async {
    await _client.dio.delete(ApiEndpoints.hostelIssue(id));
  }
}
