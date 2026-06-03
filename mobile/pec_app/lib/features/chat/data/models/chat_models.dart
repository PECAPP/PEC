class ChatRoom {
  final String id;
  final String name;
  final bool isGroup;
  final List<String> memberIds;
  final String? avatarUrl;
  final ChatMessage? lastMessage;
  final int unreadCount;
  final DateTime updatedAt;

  const ChatRoom({
    required this.id,
    required this.name,
    this.isGroup = false,
    required this.memberIds,
    this.avatarUrl,
    this.lastMessage,
    this.unreadCount = 0,
    required this.updatedAt,
  });

  factory ChatRoom.fromJson(Map<String, dynamic> j) {
    final last = j['lastMessage'] as Map<String, dynamic>?;
    return ChatRoom(
      id: j['id'] as String,
      name: j['name'] as String? ?? 'Chat',
      isGroup: j['isGroup'] as bool? ?? false,
      memberIds: (j['memberIds'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      avatarUrl: j['avatarUrl'] as String?,
      lastMessage: last != null ? ChatMessage.fromJson(last) : null,
      unreadCount: (j['unreadCount'] as num?)?.toInt() ?? 0,
      updatedAt:
          DateTime.tryParse(j['updatedAt'] as String? ?? '') ?? DateTime.now(),
    );
  }
}

class ChatMessage {
  final String id;
  final String roomId;
  final String senderId;
  final String senderName;
  final String? senderAvatar;
  final String content;
  final String type; // text | image | file
  final bool isRead;
  final DateTime createdAt;

  const ChatMessage({
    required this.id,
    required this.roomId,
    required this.senderId,
    required this.senderName,
    this.senderAvatar,
    required this.content,
    this.type = 'text',
    this.isRead = false,
    required this.createdAt,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> j) {
    return ChatMessage(
      id: j['id'] as String,
      roomId: j['roomId'] as String? ?? '',
      senderId: j['senderId'] as String? ??
          j['sender']?['id'] as String? ?? '',
      senderName: j['senderName'] as String? ??
          j['sender']?['name'] as String? ?? 'Unknown',
      senderAvatar: j['senderAvatar'] as String? ??
          j['sender']?['avatarUrl'] as String?,
      content: j['content'] as String? ?? '',
      type: j['type'] as String? ?? 'text',
      isRead: j['isRead'] as bool? ?? false,
      createdAt:
          DateTime.tryParse(j['createdAt'] as String? ?? '') ?? DateTime.now(),
    );
  }
}
