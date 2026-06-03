import '../../../../core/api/api_client.dart';
import '../../../../core/api/api_endpoints.dart';

class MarketplaceDataSource {
  final ApiClient _client;
  MarketplaceDataSource(this._client);

  Future<List<Map<String, dynamic>>> getListings() async {
    final res = await _client.dio.get(
      ApiEndpoints.marketplaceListings,
      queryParameters: {'limit': 100},
    );
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
