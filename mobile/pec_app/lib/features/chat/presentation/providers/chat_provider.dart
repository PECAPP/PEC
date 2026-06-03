import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../data/datasources/chat_remote_datasource.dart';
import '../../data/models/chat_models.dart';
import '../../../../core/api/websocket_client.dart';
// import '../../../../core/auth/token_storage.dart';

// ── Infrastructure ────────────────────────────────────────────────────────────
final chatDataSourceProvider = Provider<ChatRemoteDataSource>((ref) {
  return ChatRemoteDataSource(ref.watch(apiClientProvider));
});

final wsClientProvider = Provider<WebSocketClient>((ref) {
  return WebSocketClient(ref.watch(tokenStorageProvider));
});

// ── Room list ─────────────────────────────────────────────────────────────────
final chatRoomsProvider = FutureProvider<List<ChatRoom>>((ref) async {
  final ds = ref.watch(chatDataSourceProvider);
  List<ChatRoom> rooms;
  try {
    rooms = await ds.getRooms();
  } catch (_) {
    rooms = <ChatRoom>[];
  }

  // Always show key default rooms even when backend chat endpoint fails/returns empty.
  final required = _defaultRooms();
  final byName = {
    for (final r in rooms) r.name.trim().toLowerCase(): r,
  };
  for (final r in required) {
    byName.putIfAbsent(r.name.trim().toLowerCase(), () => r);
  }
  rooms = byName.values.toList();

  rooms.sort((a, b) => b.updatedAt.compareTo(a.updatedAt));
  return rooms;
});

List<ChatRoom> _defaultRooms() {
  final now = DateTime.now();
  return [
    ChatRoom(
      id: 'seed-global-announcements',
      name: 'PEC Global Announcements',
      isGroup: true,
      memberIds: const [],
      unreadCount: 0,
      updatedAt: now,
    ),
    ChatRoom(
      id: 'seed-ds-timetable',
      name: 'DS TimeTable',
      isGroup: true,
      memberIds: const [],
      unreadCount: 0,
      updatedAt: now.subtract(const Duration(minutes: 1)),
    ),
  ];
}

List<ChatMessage> _dummyMessagesForRoom(String roomId) {
  final now = DateTime.now();
  return [
    ChatMessage(
      id: 'dummy-msg-1',
      roomId: roomId,
      senderId: 'pec-ai',
      senderName: 'PEC AI Assistant',
      content: 'Chat backend is temporarily offline. You are in demo mode.',
      createdAt: now.subtract(const Duration(minutes: 4)),
    ),
    ChatMessage(
      id: 'dummy-msg-2',
      roomId: roomId,
      senderId: 'pec-ai',
      senderName: 'PEC AI Assistant',
      content:
          'Try these options: Attendance help, Placement updates, Exam schedule, Campus services.',
      createdAt: now.subtract(const Duration(minutes: 3)),
    ),
  ];
}

// ── Message stream per room ───────────────────────────────────────────────────
class MessagesNotifier extends StateNotifier<AsyncValue<List<ChatMessage>>> {
  final ChatRemoteDataSource _ds;
  final WebSocketClient _ws;
  final String roomId;
  bool _connected = false;

  MessagesNotifier(this._ds, this._ws, this.roomId)
      : super(const AsyncValue.loading()) {
    _init();
  }

  Future<void> _init() async {
    try {
      final messages = await _ds.getMessages(roomId);
      // Oldest first for ListView
      messages.sort((a, b) => a.createdAt.compareTo(b.createdAt));
      state = AsyncValue.data(messages);
    } catch (_) {
      state = AsyncValue.data(_dummyMessagesForRoom(roomId));
      return;
    }
    _connectWs();
  }

  void _connectWs() {
    if (_connected) return;
    _ws.connect().then((_) {
      _ws.joinRoom(roomId);
      _connected = true;
      _ws.on('new_message', (data) {
        if (data == null) return;
        try {
          final msg = ChatMessage.fromJson(
              Map<String, dynamic>.from(data as Map));
          if (msg.roomId != roomId) return;
          state.whenData((msgs) {
            state = AsyncValue.data([...msgs, msg]);
          });
        } catch (_) {}
      });
    });
  }

  Future<void> sendMessage(String content) async {
    _ws.sendMessage(roomId: roomId, content: content);
  }

  void typingStart() => _ws.typingStart(roomId);
  void typingStop() => _ws.typingStop(roomId);

  Future<void> loadOlder() async {
    final current = state.value;
    if (current == null || current.isEmpty) return;
    final oldest = current.first.id;
    final older = await _ds.getMessages(roomId, before: oldest);
    older.sort((a, b) => a.createdAt.compareTo(b.createdAt));
    state = AsyncValue.data([...older, ...current]);
  }

  @override
  void dispose() {
    if (_connected) {
      _ws.off('new_message');
      _ws.leaveRoom(roomId);
    }
    super.dispose();
  }
}

final messagesProvider = StateNotifierProvider.family<
    MessagesNotifier, AsyncValue<List<ChatMessage>>, String>(
  (ref, roomId) {
    final ds = ref.watch(chatDataSourceProvider);
    final ws = ref.watch(wsClientProvider);
    return MessagesNotifier(ds, ws, roomId);
  },
);

// ── Typing indicator ──────────────────────────────────────────────────────────
final typingUsersProvider =
    StateProvider.family<Set<String>, String>((ref, roomId) => {});
