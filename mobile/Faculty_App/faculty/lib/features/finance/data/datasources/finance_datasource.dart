import '../../../../core/api/api_client.dart';
import '../../../../core/api/api_endpoints.dart';

class FinanceDataSource {
  final ApiClient _client;
  FinanceDataSource(this._client);

  Future<List<Map<String, dynamic>>> getFees() async {
    final res = await _client.dio.get(ApiEndpoints.financeFees);
    final data = res.data;
    if (data is Map && data['data'] is List) {
      return List<Map<String, dynamic>>.from(data['data'] as List);
    }
    if (data is List) {
      return List<Map<String, dynamic>>.from(data);
    }
    return [];
  }

  Future<List<Map<String, dynamic>>> getTransactions() async {
    final res = await _client.dio.get(ApiEndpoints.financeTransactions);
    final data = res.data;
    if (data is Map && data['data'] is List) {
      return List<Map<String, dynamic>>.from(data['data'] as List);
    }
    if (data is List) {
      return List<Map<String, dynamic>>.from(data);
    }
    return [];
  }
}
