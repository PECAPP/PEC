import '../../../../core/api/api_client.dart';
import '../../../../core/api/api_endpoints.dart';
import '../models/canteen_models.dart';

class CanteenRemoteDataSource {
  final ApiClient _client;
  CanteenRemoteDataSource(this._client);

  Future<List<CanteenItem>> getItems({String? category}) async {
    final resp = await _client.dio.get(
      ApiEndpoints.canteenItems,
      queryParameters: {
        'limit': 200,
        if (category != null) 'category': category,
      },
    );
    final raw = resp.data as Map<String, dynamic>;
    final items = raw['data'] as List<dynamic>? ??
        raw['items'] as List<dynamic>? ??
        (resp.data is List ? resp.data as List<dynamic> : []);
    return items
        .map((e) => CanteenItem.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<List<CanteenOrder>> getMyOrders({int limit = 20}) async {
    final resp = await _client.dio.get(
      ApiEndpoints.canteenOrders,
      queryParameters: {'limit': limit, 'mine': true},
    );
    final raw = resp.data as Map<String, dynamic>;
    final items = raw['data'] as List<dynamic>? ??
        raw['items'] as List<dynamic>? ??
        (resp.data is List ? resp.data as List<dynamic> : []);
    return items
        .map((e) => CanteenOrder.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<CanteenOrder> placeOrder(List<Map<String, dynamic>> lines) async {
    final resp = await _client.dio.post(
      ApiEndpoints.canteenOrders,
      data: {'items': lines},
    );
    return CanteenOrder.fromJson(resp.data as Map<String, dynamic>);
  }
}
