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
    final items = _extractItems(resp.data);
    return items
        .whereType<Map<String, dynamic>>()
        .map(HostelIssue.fromJson)
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
    final payload = resp.data;
    if (payload is Map<String, dynamic>) {
      final data = payload['data'];
      if (data is Map<String, dynamic>) {
        return HostelIssue.fromJson(data);
      }
      return HostelIssue.fromJson(payload);
    }
    if (payload is List && payload.isNotEmpty && payload.first is Map<String, dynamic>) {
      return HostelIssue.fromJson(payload.first as Map<String, dynamic>);
    }
    return HostelIssue.fromJson({
      'id': DateTime.now().millisecondsSinceEpoch.toString(),
      'title': title,
      'description': description,
      'category': category,
      'priority': priority,
      'status': 'open',
      'roomNumber': roomNumber,
      'imageUrl': imageUrl,
      'createdAt': DateTime.now().toIso8601String(),
    });
  }

  Future<void> deleteIssue(String id) async {
    await _client.dio.delete(ApiEndpoints.hostelIssue(id));
  }

  List<dynamic> _extractItems(dynamic payload) {
    if (payload is List) {
      return payload;
    }
    if (payload is Map<String, dynamic>) {
      final candidates = [
        payload['data'],
        payload['items'],
        payload['results'],
        payload['issues'],
      ];
      for (final candidate in candidates) {
        if (candidate is List) {
          return candidate;
        }
        if (candidate is Map<String, dynamic>) {
          final nested = _extractItems(candidate);
          if (nested.isNotEmpty) {
            return nested;
          }
        }
      }
    }
    return const [];
  }
}
