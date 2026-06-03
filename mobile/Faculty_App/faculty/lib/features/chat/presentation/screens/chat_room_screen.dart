import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/api/api_endpoints.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/errors/failures.dart';
import '../../../../shared/widgets/faculty_shimmer.dart';
import '../../../../shared/widgets/faculty_top_nav_bar.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

class ChatRoomScreen extends ConsumerStatefulWidget {
  final String roomId;
  const ChatRoomScreen({super.key, required this.roomId});

  @override
  ConsumerState<ChatRoomScreen> createState() => _ChatRoomScreenState();
}

class _ChatRoomScreenState extends ConsumerState<ChatRoomScreen> {
  final _msgCtrl = TextEditingController();
  final _scrollCtrl = ScrollController();
  List<Map<String, dynamic>> _messages = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadMessages();
  }

  @override
  void dispose() {
    _msgCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadMessages() async {
    try {
      final auth = ref.read(authNotifierProvider);
      if (auth.isTestSession) {
        setState(() {
          _messages = _demoMessagesForRoom(widget.roomId);
          _loading = false;
        });
        return;
      }

      final client = ref.read(apiClientProvider);
      final res = await client.dio.get(ApiEndpoints.chatMessages(widget.roomId));
      final data = res.data;
      final list = data is Map && data.containsKey('data')
          ? List<Map<String, dynamic>>.from(data['data'] as List)
          : data is List ? List<Map<String, dynamic>>.from(data) : <Map<String, dynamic>>[];
      setState(() { _messages = list; _loading = false; });
    } on DioException catch (error) {
      if (error.error is UnauthorisedFailure) {
        await ref.read(authNotifierProvider.notifier).signOut();
      }
      setState(() => _loading = false);
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final userId = ref.watch(authNotifierProvider).user?.uid ?? '';

    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: const FacultyTopNavBar(),
      body: Column(
        children: [
          Expanded(
            child: _loading
                ? FacultyShimmer(child: ListView(
                    children: List.generate(10, (_) => Padding(
                      padding: const EdgeInsets.all(8), child: ShimmerBox(height: 40))),
                  ))
                : ListView.builder(
                    controller: _scrollCtrl,
                    padding: const EdgeInsets.all(AppDimensions.md),
                    itemCount: _messages.length,
                    itemBuilder: (_, i) {
                      final msg = _messages[i];
                      final isMe = msg['senderId']?.toString() == userId;
                      final content = msg['content'] as String? ?? '';
                      final sender = msg['senderName'] as String? ?? '';

                      return Align(
                        alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
                          decoration: BoxDecoration(
                            color: isMe ? AppColors.gold : AppColors.cardDark,
                            borderRadius: BorderRadius.only(
                              topLeft: const Radius.circular(14),
                              topRight: const Radius.circular(14),
                              bottomLeft: Radius.circular(isMe ? 14 : 4),
                              bottomRight: Radius.circular(isMe ? 4 : 14),
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              if (!isMe)
                                Text(sender, style: AppTextStyles.labelSmall.copyWith(
                                  color: AppColors.gold, fontSize: 10)),
                              Text(content, style: AppTextStyles.bodyMedium.copyWith(
                                color: isMe ? AppColors.bgDark : AppColors.textPrimary)),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),
          // Send bar
          Container(
            padding: EdgeInsets.fromLTRB(12, 8, 8, MediaQuery.of(context).padding.bottom + 8),
            decoration: BoxDecoration(
              color: AppColors.surfaceDark,
              border: Border(top: BorderSide(color: AppColors.borderDark)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _msgCtrl,
                    style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textPrimary),
                    decoration: const InputDecoration(
                      hintText: 'Type a message...',
                      border: InputBorder.none,
                      contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    ),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.send_rounded, color: AppColors.gold),
                  onPressed: () {
                    if (_msgCtrl.text.trim().isEmpty) return;
                    // Would send via API / WebSocket
                    _msgCtrl.clear();
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

List<Map<String, dynamic>> _demoMessagesForRoom(String roomId) {
  switch (roomId) {
    case 'demo-room-announcements':
      return [
        {
          'senderId': 'hod-1',
          'senderName': 'HOD Office',
          'content': 'Faculty meeting is scheduled for 3:00 PM in Seminar Hall.',
        },
        {
          'senderId': 'faculty-demo',
          'senderName': 'You',
          'content': 'Noted. I will attend.',
        },
      ];
    case 'demo-room-coordination':
      return [
        {
          'senderId': 'course-coordinator',
          'senderName': 'Course Coordinator',
          'content': 'Please upload the latest course material before noon.',
        },
        {
          'senderId': 'faculty-demo',
          'senderName': 'You',
          'content': 'I will upload it shortly.',
        },
      ];
    case 'demo-room-support':
      return [
        {
          'senderId': 'it-support',
          'senderName': 'IT Support',
          'content': 'Your request has been received and is being reviewed.',
        },
      ];
    default:
      return [
        {
          'senderId': 'system',
          'senderName': 'System',
          'content': 'Demo chat is available in test mode.',
        },
      ];
  }
}
