import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/api/api_endpoints.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../core/errors/failures.dart';
import '../../../../shared/widgets/faculty_empty_state.dart';
import '../../../../shared/widgets/faculty_shimmer.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

final _chatRoomsProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final auth = ref.watch(authNotifierProvider);
  if (auth.isTestSession) {
    return _demoChatRooms;
  }

  final client = ref.read(apiClientProvider);
  try {
    final res = await client.dio.get(ApiEndpoints.chatRooms);
    final data = res.data;
    if (data is Map && data.containsKey('data')) {
      return List<Map<String, dynamic>>.from(data['data'] as List);
    }
    if (data is List) return List<Map<String, dynamic>>.from(data);
    return [];
  } on DioException catch (error) {
    if (error.error is UnauthorisedFailure) {
      await ref.read(authNotifierProvider.notifier).signOut();
      return [];
    }
    rethrow;
  }
});

const _demoChatRooms = [
  {
    'id': 'demo-room-announcements',
    'name': 'Department Announcements',
    'lastMessage': 'Faculty meeting is scheduled for 3:00 PM today.',
    'unreadCount': 2,
    'isGroup': true,
  },
  {
    'id': 'demo-room-coordination',
    'name': 'Course Coordination',
    'lastMessage': 'Please upload the course material before noon.',
    'unreadCount': 1,
    'isGroup': true,
  },
  {
    'id': 'demo-room-support',
    'name': 'IT Support',
    'lastMessage': 'Your request has been received and is being reviewed.',
    'unreadCount': 0,
    'isGroup': false,
  },
];

class ChatListScreen extends ConsumerWidget {
  const ChatListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(_chatRoomsProvider);

    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: AppBar(
        backgroundColor: AppColors.bgDark,
        title: Text('Chat', style: AppTextStyles.heading3),
      ),
      body: async.when(
        loading: () => FacultyShimmer(
          child: ListView(
            padding: const EdgeInsets.all(AppDimensions.md),
            children: List.generate(8, (_) => Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: ShimmerBox(height: 64),
            )),
          ),
        ),
        error: (e, _) {
          if (e is DioException && e.error is UnauthorisedFailure) {
            return const SizedBox.shrink();
          }

          return Center(
            child: Padding(
              padding: const EdgeInsets.all(AppDimensions.lg),
              child: Text(
                'Unable to load chats. Pull to retry after reconnecting.',
                style: AppTextStyles.bodySmall,
                textAlign: TextAlign.center,
              ),
            ),
          );
        },
        data: (rooms) => rooms.isEmpty
            ? const FacultyEmptyState(title: 'No conversations', icon: Icons.chat_bubble_outline)
            : ListView.separated(
                padding: const EdgeInsets.all(AppDimensions.md),
                itemCount: rooms.length,
                separatorBuilder: (_, _) => Divider(color: AppColors.borderDark, height: 1),
                itemBuilder: (_, i) {
                  final room = rooms[i];
                  final name = room['name'] as String? ?? 'Chat';
                  final lastMessage = room['lastMessage'] as String? ?? '';
                  final unread = room['unreadCount'] as int? ?? 0;
                  final isGroup = room['isGroup'] as bool? ?? false;
                  final id = (room['id'] ?? '').toString();

                  return ListTile(
                    contentPadding: const EdgeInsets.symmetric(vertical: 6),
                    leading: CircleAvatar(
                      backgroundColor: AppColors.gold.withValues(alpha: 0.15),
                      child: Icon(
                        isGroup ? Icons.group : Icons.person,
                        color: AppColors.gold,
                        size: 20,
                      ),
                    ),
                    title: Text(name, style: AppTextStyles.labelLarge),
                    subtitle: Text(lastMessage, style: AppTextStyles.caption,
                        maxLines: 1, overflow: TextOverflow.ellipsis),
                    trailing: unread > 0
                        ? Container(
                            width: 20,
                            height: 20,
                            decoration: const BoxDecoration(
                              color: AppColors.gold,
                              shape: BoxShape.circle,
                            ),
                            child: Center(
                              child: Text('$unread',
                                  style: AppTextStyles.caption.copyWith(
                                    color: AppColors.bgDark,
                                    fontSize: 10,
                                    fontWeight: FontWeight.w700,
                                  )),
                            ),
                          )
                        : null,
                    onTap: () => context.go('/chat/$id'),
                  );
                },
              ),
      ),
    );
  }
}
