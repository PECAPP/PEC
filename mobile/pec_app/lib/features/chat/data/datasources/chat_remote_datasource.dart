import '../../../../core/api/api_client.dart';
import '../../../../core/api/api_endpoints.dart';
import '../models/chat_models.dart';

class ChatRemoteDataSource {
  final ApiClient _client;
  ChatRemoteDataSource(this._client);

  Future<List<ChatRoom>> getRooms() async {
    final resp = await _client.dio.get(ApiEndpoints.chatRooms);
    final raw = resp.data as Map<String, dynamic>;
    final items = raw['data'] as List<dynamic>? ??
        raw['items'] as List<dynamic>? ??
        (resp.data is List ? resp.data as List<dynamic> : []);
    return items
        .map((e) => ChatRoom.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<List<ChatMessage>> getMessages(String roomId,
      {String? before, int limit = 50}) async {
    final resp = await _client.dio.get(
      ApiEndpoints.chatRoomMessages(roomId),
      queryParameters: {
        'limit': limit,
        if (before != null) 'before': before,
      },
    );
    final raw = resp.data as Map<String, dynamic>;
    final items = raw['data'] as List<dynamic>? ??
        raw['items'] as List<dynamic>? ??
        (resp.data is List ? resp.data as List<dynamic> : []);
    return items
        .map((e) => ChatMessage.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<ChatRoom> createDirectRoom(String otherUserId) async {
    final resp = await _client.dio.post(ApiEndpoints.chatRooms, data: {
      'isGroup': false,
      'memberIds': [otherUserId],
    });
    return ChatRoom.fromJson(resp.data as Map<String, dynamic>);
  }

  Future<ChatRoom> createGroupRoom(
      String name, List<String> memberIds) async {
    final resp = await _client.dio.post(ApiEndpoints.chatRooms, data: {
      'isGroup': true,
      'name': name,
      'memberIds': memberIds,
    });
    return ChatRoom.fromJson(resp.data as Map<String, dynamic>);
  }
}
