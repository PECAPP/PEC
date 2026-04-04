import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../features/auth/presentation/providers/auth_provider.dart';
import '../../../../shared/widgets/pec_avatar.dart';
import '../../../../shared/widgets/pec_error_state.dart';
import '../../data/models/chat_models.dart';
import '../providers/chat_provider.dart';

class ChatRoomScreen extends ConsumerStatefulWidget {
  final String roomId;
  const ChatRoomScreen({super.key, required this.roomId});

  @override
  ConsumerState<ChatRoomScreen> createState() => _ChatRoomScreenState();
}

class _ChatRoomScreenState extends ConsumerState<ChatRoomScreen> {
  final _msgCtrl = TextEditingController();
  final _scrollCtrl = ScrollController();
  bool _isTyping = false;

  @override
  void dispose() {
    _msgCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(
          _scrollCtrl.position.maxScrollExtent,
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final messagesAsync = ref.watch(messagesProvider(widget.roomId));
    final me = ref.watch(authNotifierProvider).user;
    final notifier = ref.read(messagesProvider(widget.roomId).notifier);

    // Scroll to bottom when new messages arrive
    ref.listen(messagesProvider(widget.roomId), (_, next) {
      next.whenData((_) => _scrollToBottom());
    });

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('CHAT', style: TextStyle(fontSize: 14)),
            Text(widget.roomId,
                style: AppTextStyles.caption.copyWith(fontSize: 10),
                maxLines: 1,
                overflow: TextOverflow.ellipsis),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.info_outline),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          // Messages
          Expanded(
            child: messagesAsync.when(
              loading: () => const Center(
                  child: CircularProgressIndicator(color: AppColors.yellow)),
              error: (e, _) => PecErrorState(
                message: e.toString(),
                onRetry: () =>
                    ref.invalidate(messagesProvider(widget.roomId)),
              ),
              data: (messages) {
                if (messages.isEmpty) {
                  return Center(
                    child: Text('No messages yet. Say hello!',
                        style: AppTextStyles.bodySmall
                            .copyWith(color: AppColors.textSecondary)),
                  );
                }
                return NotificationListener<ScrollNotification>(
                  onNotification: (n) {
                    if (n is ScrollStartNotification &&
                        _scrollCtrl.position.pixels <= 40) {
                      notifier.loadOlder();
                    }
                    return false;
                  },
                  child: ListView.builder(
                    controller: _scrollCtrl,
                    padding: const EdgeInsets.all(AppDimensions.md),
                    itemCount: messages.length,
                    itemBuilder: (_, i) {
                      final msg = messages[i];
                      final isMe = msg.senderId == me?.id;
                      final showAvatar = i == 0 ||
                          messages[i - 1].senderId != msg.senderId;
                      return _MessageBubble(
                        message: msg,
                        isMe: isMe,
                        showAvatar: showAvatar,
                      );
                    },
                  ),
                );
              },
            ),
          ),

          // Typing indicator
          Consumer(builder: (ctx, r, _) {
            final typers =
                r.watch(typingUsersProvider(widget.roomId));
            if (typers.isEmpty) return const SizedBox.shrink();
            return Container(
              padding: const EdgeInsets.symmetric(
                  horizontal: AppDimensions.md, vertical: 4),
              child: Text(
                '${typers.join(', ')} ${typers.length == 1 ? 'is' : 'are'} typing…',
                style: AppTextStyles.caption
                    .copyWith(color: AppColors.textSecondary),
              ),
            );
          }),

          // Input bar
          Container(
            decoration: const BoxDecoration(
              border:
                  Border(top: BorderSide(color: AppColors.black, width: 2)),
              color: AppColors.white,
            ),
            padding: const EdgeInsets.symmetric(
                horizontal: AppDimensions.sm, vertical: AppDimensions.xs),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _msgCtrl,
                    maxLines: null,
                    textCapitalization: TextCapitalization.sentences,
                    decoration: InputDecoration(
                      hintText: 'Type a message…',
                      hintStyle: AppTextStyles.bodySmall,
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 8),
                    ),
                    onChanged: (v) {
                      if (v.isNotEmpty && !_isTyping) {
                        _isTyping = true;
                        notifier.typingStart();
                      } else if (v.isEmpty && _isTyping) {
                        _isTyping = false;
                        notifier.typingStop();
                      }
                    },
                  ),
                ),
                const SizedBox(width: AppDimensions.xs),
                GestureDetector(
                  onTap: _send,
                  child: Container(
                    width: 44,
                    height: 44,
                    color: AppColors.yellow,
                    child: const Icon(Icons.send_rounded,
                        color: AppColors.black, size: 20),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _send() {
    final content = _msgCtrl.text.trim();
    if (content.isEmpty) return;
    _msgCtrl.clear();
    _isTyping = false;
    ref
        .read(messagesProvider(widget.roomId).notifier)
        .sendMessage(content);
  }
}

class _MessageBubble extends StatelessWidget {
  final ChatMessage message;
  final bool isMe;
  final bool showAvatar;
  const _MessageBubble(
      {required this.message,
      required this.isMe,
      required this.showAvatar});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        bottom: AppDimensions.xs,
        left: isMe ? 48 : 0,
        right: isMe ? 0 : 48,
      ),
      child: Row(
        mainAxisAlignment:
            isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!isMe && showAvatar) ...[
            PecAvatar(
                name: message.senderName,
                imageUrl: message.senderAvatar,
                size: 28),
            const SizedBox(width: AppDimensions.xs),
          ] else if (!isMe) ...[
            const SizedBox(width: 28 + AppDimensions.xs),
          ],
          Column(
            crossAxisAlignment:
                isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
            children: [
              if (!isMe && showAvatar)
                Padding(
                  padding: const EdgeInsets.only(bottom: 2),
                  child: Text(message.senderName,
                      style: AppTextStyles.caption
                          .copyWith(color: AppColors.textSecondary)),
                ),
              Container(
                constraints: BoxConstraints(
                    maxWidth:
                        MediaQuery.of(context).size.width * 0.65),
                padding: const EdgeInsets.symmetric(
                    horizontal: AppDimensions.sm,
                    vertical: AppDimensions.xs),
                decoration: BoxDecoration(
                  color: isMe ? AppColors.yellow : AppColors.bgSurface,
                  border:
                      Border.all(color: AppColors.black, width: 1.5),
                  boxShadow: [
                    BoxShadow(
                      offset: const Offset(2, 2),
                      color: isMe
                          ? AppColors.black
                          : AppColors.borderLight,
                    ),
                  ],
                ),
                child: Text(message.content,
                    style: AppTextStyles.bodySmall
                        .copyWith(color: AppColors.black)),
              ),
              const SizedBox(height: 2),
              Text(
                _timeLabel(message.createdAt),
                style: AppTextStyles.caption
                    .copyWith(fontSize: 9, color: AppColors.textSecondary),
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _timeLabel(DateTime dt) =>
      '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
}
