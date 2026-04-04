import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/pec_card.dart';
import '../../../../shared/widgets/pec_empty_state.dart';
import '../../../../shared/widgets/pec_error_state.dart';
import '../../../../shared/widgets/pec_shimmer.dart';
import '../../data/models/notification_model.dart';
import '../providers/notifications_provider.dart';

class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notifAsync = ref.watch(notificationsProvider);
    final actions = ref.read(notificationActionsProvider.notifier);

    return Scaffold(
      appBar: AppBar(
        title: const Text('NOTIFICATIONS'),
        actions: [
          notifAsync.whenOrNull(
                data: (list) {
                  final hasUnread = list.any((n) => !n.isRead);
                  if (!hasUnread) return null;
                  return TextButton(
                    onPressed: () async {
                      for (final n in list.where((n) => !n.isRead)) {
                        await actions.markRead(n.id);
                      }
                    },
                    child: Text('Mark all read',
                        style: AppTextStyles.labelSmall
                            .copyWith(color: AppColors.yellow)),
                  );
                },
              ) ??
              const SizedBox.shrink(),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.invalidate(notificationsProvider),
          ),
        ],
      ),
      body: notifAsync.when(
        loading: () => ListView.separated(
          padding: const EdgeInsets.all(AppDimensions.md),
          itemCount: 6,
          separatorBuilder: (_, __) =>
              const SizedBox(height: AppDimensions.sm),
          itemBuilder: (_, __) =>
              const PecShimmerBox(height: 72, width: double.infinity),
        ),
        error: (e, _) => PecErrorState(
          message: e.toString(),
          onRetry: () => ref.invalidate(notificationsProvider),
        ),
        data: (notifications) {
          if (notifications.isEmpty) {
            return const PecEmptyState(
              icon: Icons.notifications_none_outlined,
              title: 'All caught up!',
              subtitle: 'New notifications will appear here',
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.all(AppDimensions.md),
            itemCount: notifications.length,
            separatorBuilder: (_, __) =>
                const SizedBox(height: AppDimensions.xs),
            itemBuilder: (_, i) => _NotifCard(
              notification: notifications[i],
              onRead: () => actions.markRead(notifications[i].id),
              onDelete: () => actions.delete(notifications[i].id),
              onTap: () {
                final route = notifications[i].actionRoute;
                if (route != null && route.isNotEmpty) {
                  actions.markRead(notifications[i].id);
                  context.push(route);
                }
              },
            ),
          );
        },
      ),
    );
  }
}

class _NotifCard extends StatelessWidget {
  final AppNotification notification;
  final VoidCallback onRead;
  final VoidCallback onDelete;
  final VoidCallback onTap;
  const _NotifCard({
    required this.notification,
    required this.onRead,
    required this.onDelete,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Dismissible(
      key: ValueKey(notification.id),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: AppDimensions.md),
        color: AppColors.red,
        child: const Icon(Icons.delete_outline,
            color: AppColors.white, size: 24),
      ),
      onDismissed: (_) => onDelete(),
      child: PecCard(
        color: notification.isRead
            ? AppColors.bgSurface
            : AppColors.white,
        onTap: onTap,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Unread dot
            if (!notification.isRead)
              Container(
                width: 8,
                height: 8,
                margin: const EdgeInsets.only(top: 5, right: AppDimensions.xs),
                decoration: const BoxDecoration(
                  color: AppColors.yellow,
                  shape: BoxShape.circle,
                ),
              )
            else
              const SizedBox(width: 8 + AppDimensions.xs),

            // Icon
            Container(
              width: 40,
              height: 40,
              color: notification.dotColor.withValues(alpha: 0.15),
              child: Icon(notification.icon,
                  color: notification.dotColor, size: 20),
            ),
            const SizedBox(width: AppDimensions.sm),

            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    notification.title,
                    style: notification.isRead
                        ? AppTextStyles.bodySmall
                        : AppTextStyles.labelLarge
                            .copyWith(fontSize: 13),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (notification.body != null &&
                      notification.body!.isNotEmpty) ...[
                    const SizedBox(height: 2),
                    Text(
                      notification.body!,
                      style: AppTextStyles.bodySmall.copyWith(
                          color: AppColors.textSecondary),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                  const SizedBox(height: 4),
                  Text(
                    _timeAgo(notification.createdAt),
                    style: AppTextStyles.caption
                        .copyWith(color: AppColors.textSecondary),
                  ),
                ],
              ),
            ),

            // Mark read button
            if (!notification.isRead)
              IconButton(
                icon: const Icon(Icons.check_circle_outline,
                    size: 18, color: AppColors.green),
                onPressed: onRead,
                padding: EdgeInsets.zero,
                constraints:
                    const BoxConstraints(minWidth: 28, minHeight: 28),
              ),
          ],
        ),
      ),
    );
  }

  String _timeAgo(DateTime dt) {
    final diff = DateTime.now().difference(dt);
    if (diff.inDays > 30) return '${dt.day}/${dt.month}/${dt.year}';
    if (diff.inDays > 0) return '${diff.inDays}d ago';
    if (diff.inHours > 0) return '${diff.inHours}h ago';
    if (diff.inMinutes > 0) return '${diff.inMinutes}m ago';
    return 'Just now';
  }
}
