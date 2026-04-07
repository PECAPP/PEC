import '../../../../core/api/api_client.dart';
import '../../../../core/api/api_endpoints.dart';
import '../models/canteen_models.dart';

class CanteenRemoteDataSource {
  final ApiClient _client;
  CanteenRemoteDataSource(this._client);

  List<dynamic> _extractItems(dynamic raw) {
    if (raw is List) return raw;
    if (raw is Map<String, dynamic>) {
      final data = raw['data'];
      if (data is List) return data;
      final items = raw['items'];
      if (items is List) return items;
      final results = raw['results'];
      if (results is List) return results;
    }
    return const [];
  }

  Future<List<CanteenItem>> getItems({String? category}) async {
    final resp = await _client.dio.get(
      ApiEndpoints.canteenItems,
      queryParameters: {
        'limit': 200,
        if (category != null) 'category': category,
      },
    );
    final items = _extractItems(resp.data);
    return items
        .whereType<Map<String, dynamic>>()
        .map(CanteenItem.fromJson)
        .toList(growable: false);
  }

  Future<List<CanteenOrder>> getMyOrders({int limit = 20}) async {
    final resp = await _client.dio.get(
      ApiEndpoints.canteenOrders,
      queryParameters: {'limit': limit, 'mine': true},
    );
    final items = _extractItems(resp.data);
    return items
        .whereType<Map<String, dynamic>>()
        .map(CanteenOrder.fromJson)
        .toList(growable: false);
  }

  Future<CanteenOrder> placeOrder(List<Map<String, dynamic>> lines) async {
    final resp = await _client.dio.post(
      ApiEndpoints.canteenOrders,
      data: {'items': lines},
    );
    return CanteenOrder.fromJson(resp.data as Map<String, dynamic>);
  }
}
