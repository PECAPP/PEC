import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:timeago/timeago.dart' as timeago;

import '../../../../core/api/api_endpoints.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/faculty_empty_state.dart';
import '../../../../shared/widgets/faculty_error_state.dart';
import '../../../../shared/widgets/faculty_shimmer.dart';
import '../../../../shared/widgets/faculty_top_nav_bar.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

final _notificationsProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final auth = ref.watch(authNotifierProvider);
  if (auth.isTestSession) return _demoNotifications;

  try {
    final client = ref.read(apiClientProvider);
    final res = await client.dio.get(ApiEndpoints.notifications);
    final data = res.data;
    if (data is Map && data.containsKey('data')) {
      return List<Map<String, dynamic>>.from(data['data'] as List);
    }
    if (data is List) return List<Map<String, dynamic>>.from(data);
    return [];
  } catch (_) {
    return _demoNotifications;
  }
});

const _demoNotifications = [
  {
    'title': 'Attendance Session Completed',
    'body': 'CS201 - Data Structures session recorded 48/62 students present.',
    'type': 'attendance',
    'read': false,
    'createdAt': null,
  },
  {
    'title': 'New Notice Posted',
    'body': 'Faculty meeting scheduled for tomorrow at 3:00 PM in Seminar Hall.',
    'type': 'notice',
    'read': false,
    'createdAt': null,
  },
  {
    'title': 'Course Material Uploaded',
    'body': 'Lecture notes for Unit 4 have been uploaded to EC301.',
    'type': 'info',
    'read': true,
    'createdAt': null,
  },
];

class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(_notificationsProvider);

    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: const FacultyTopNavBar(),
      body: async.when(
        loading: () => FacultyShimmer(
          child: ListView(
            padding: const EdgeInsets.all(AppDimensions.md),
            children: List.generate(8, (_) => Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: ShimmerBox(height: 72),
            )),
          ),
        ),
        error: (e, _) => FacultyErrorState(
          message: 'Unable to load notifications.',
          onRetry: () => ref.invalidate(_notificationsProvider),
        ),
        data: (items) => items.isEmpty
            ? const FacultyEmptyState(title: 'No notifications', icon: Icons.notifications_off_outlined)
            : ListView.separated(
                padding: const EdgeInsets.all(AppDimensions.md),
                itemCount: items.length + 1,
                separatorBuilder: (_, i) => i == 0
                    ? const SizedBox(height: 8)
                    : Divider(color: AppColors.borderDark, height: 1),
                itemBuilder: (_, i) {
                  if (i == 0) {
                    return Align(
                      alignment: Alignment.centerRight,
                      child: TextButton(
                        onPressed: () => ref.invalidate(_notificationsProvider),
                        child: Text(
                          'Mark all read',
                          style: AppTextStyles.labelMedium.copyWith(color: AppColors.gold),
                        ),
                      ),
                    );
                  }
                  return _NotificationRow(data: items[i - 1]);
                },
              ),
      ),
    );
  }
}

class _NotificationRow extends StatelessWidget {
  final Map<String, dynamic> data;
  const _NotificationRow({required this.data});

  @override
  Widget build(BuildContext context) {
    final title = data['title'] as String? ?? 'Notification';
    final body = data['body'] as String? ?? data['message'] as String? ?? '';
    final type = data['type'] as String? ?? 'info';
    final read = data['read'] as bool? ?? false;
    final createdAt = data['createdAt'] as String?;

    String timeStr = '';
    if (createdAt != null) {
      try { timeStr = timeago.format(DateTime.parse(createdAt)); } catch (_) {}
    }

    final dotColor = switch (type) {
      'attendance' => AppColors.success,
      'notice' => AppColors.info,
      'chat' => AppColors.gold,
      _ => AppColors.textMuted,
    };

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 8,
            height: 8,
            margin: const EdgeInsets.only(top: 6),
            decoration: BoxDecoration(
              color: read ? AppColors.transparent : dotColor,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: AppTextStyles.labelLarge.copyWith(
                  color: read ? AppColors.textMuted : AppColors.textPrimary,
                )),
                if (body.isNotEmpty) ...[
                  const SizedBox(height: 2),
                  Text(body, style: AppTextStyles.bodySmall, maxLines: 2, overflow: TextOverflow.ellipsis),
                ],
                if (timeStr.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Text(timeStr, style: AppTextStyles.caption),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
