import '../../../../core/api/api_client.dart';
import '../../../../core/api/api_endpoints.dart';
import '../models/room_model.dart';

class RoomsRemoteDataSource {
  final ApiClient _client;
  RoomsRemoteDataSource(this._client);

  Future<List<RoomModel>> getRooms({String? type}) async {
    final resp = await _client.dio.get(
      ApiEndpoints.rooms,
      queryParameters: {
        'limit': 100,
        if (type != null) 'type': type,
      },
    );
    final raw = resp.data as Map<String, dynamic>;
    final items = raw['data'] as List<dynamic>? ??
        raw['items'] as List<dynamic>? ??
        (resp.data is List ? resp.data as List<dynamic> : []);
    return items
        .map((e) => RoomModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<List<RoomBooking>> getMyBookings() async {
    final resp = await _client.dio.get(
      ApiEndpoints.roomBooking,
      queryParameters: {'mine': true, 'limit': 50},
    );
    final raw = resp.data as Map<String, dynamic>;
    final items = raw['data'] as List<dynamic>? ??
        raw['items'] as List<dynamic>? ??
        (resp.data is List ? resp.data as List<dynamic> : []);
    return items
        .map((e) => RoomBooking.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<RoomBooking> createBooking({
    required String roomId,
    required String purpose,
    required DateTime startTime,
    required DateTime endTime,
  }) async {
    final resp = await _client.dio.post(
      ApiEndpoints.roomBooking,
      data: {
        'roomId': roomId,
        'purpose': purpose,
        'startTime': startTime.toIso8601String(),
        'endTime': endTime.toIso8601String(),
      },
    );
    return RoomBooking.fromJson(resp.data as Map<String, dynamic>);
  }

  Future<void> cancelBooking(String id) async {
    await _client.dio.delete(ApiEndpoints.roomBookingById(id));
  }
}
