import 'package:flutter/foundation.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../auth/token_storage.dart';

class WebSocketClient {
  late io.Socket _socket;
  final TokenStorage _tokenStorage;

  static const String _wsUrl =
      String.fromEnvironment('WS_URL', defaultValue: 'http://10.0.2.2:8000');

  WebSocketClient(this._tokenStorage);

  Future<void> connect() async {
    final token = await _tokenStorage.getAccessToken();
    _socket = io.io(
      _wsUrl,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .setAuth({'token': token})
          .enableAutoConnect()
          .enableReconnection()
          .setReconnectionDelay(2000)
          .setReconnectionDelayMax(10000)
          .build(),
    );

    _socket.onConnect((_) => debugPrint('[WS] Connected'));
    _socket.onDisconnect((_) => debugPrint('[WS] Disconnected'));
    _socket.onConnectError((e) => debugPrint('[WS] Connect error: $e'));
  }

  void joinRoom(String roomId) => _socket.emit('join_room', {'roomId': roomId});
  void leaveRoom(String roomId) => _socket.emit('leave_room', {'roomId': roomId});

  void sendMessage({
    required String roomId,
    required String content,
    String type = 'text',
  }) =>
      _socket.emit('send_message', {'roomId': roomId, 'content': content, 'type': type});

  void typingStart(String roomId) => _socket.emit('typing_start', {'roomId': roomId});
  void typingStop(String roomId) => _socket.emit('typing_stop', {'roomId': roomId});
  void markRead(String roomId, String messageId) =>
      _socket.emit('mark_read', {'roomId': roomId, 'messageId': messageId});

  void on(String event, Function(dynamic) handler) => _socket.on(event, handler);
  void off(String event) => _socket.off(event);

  void disconnect() => _socket.disconnect();

  bool get isConnected => _socket.connected;
}
