import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/pec_shimmer.dart';
import '../../data/models/notification_model.dart';
import '../providers/notifications_provider.dart';

// ---------------------------------------------------------------------------
// Filter enum
// ---------------------------------------------------------------------------
enum _NotifFilter { all, unread, fee, attendance, notice, chat }

extension _NotifFilterX on _NotifFilter {
  String get label {
    switch (this) {
      case _NotifFilter.all: return 'All';
      case _NotifFilter.unread: return 'Unread';
      case _NotifFilter.fee: return 'Fee';
      case _NotifFilter.attendance: return 'Attendance';
      case _NotifFilter.notice: return 'Notice';
      case _NotifFilter.chat: return 'Chat';
    }
  }

  bool matches(AppNotification n) {
    switch (this) {
      case _NotifFilter.all: return true;
      case _NotifFilter.unread: return !n.isRead;
      case _NotifFilter.fee: return n.type == 'fee';
      case _NotifFilter.attendance: return n.type == 'attendance';
      case _NotifFilter.notice: return n.type == 'notice';
      case _NotifFilter.chat: return n.type == 'chat';
    }
  }
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
class NotificationsScreen extends ConsumerStatefulWidget {
  const NotificationsScreen({super.key});

  @override
  ConsumerState<NotificationsScreen> createState() =>
      _NotificationsScreenState();
}

class _NotificationsScreenState extends ConsumerState<NotificationsScreen> {
  _NotifFilter _filter = _NotifFilter.all;

  @override
  Widget build(BuildContext context) {
    final notifAsync = ref.watch(notificationsProvider);
    final notifier = ref.read(notificationsProvider.notifier);

    return Scaffold(
      backgroundColor: AppColors.bgSurface,
      appBar: AppBar(
        title: const Text('NOTIFICATIONS'),
        actions: [
          notifAsync.whenOrNull(
                data: (list) {
                  if (!list.any((n) => !n.isRead)) return null;
                  return TextButton(
                    onPressed: notifier.markAllRead,
                    child: Text(
                      'Mark all',
                      style: AppTextStyles.labelSmall.copyWith(
                        color: AppColors.yellow,
                        letterSpacing: 0.5,
                      ),
                    ),
                  );
                },
              ) ??
              const SizedBox.shrink(),
          IconButton(
            icon: const Icon(Icons.refresh_outlined),
            tooltip: 'Refresh',
            onPressed: notifier.refresh,
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: notifAsync.when(
        loading: () => const _LoadingList(),
        error: (_, __) => _ErrorView(onRetry: notifier.refresh),
        data: (all) {
          final unreadCount = all.where((n) => !n.isRead).length;
          final filtered = all.where(_filter.matches).toList();

          return Column(
            children: [
              // Unread banner
              if (unreadCount > 0)
                _UnreadBanner(
                  count: unreadCount,
                  onMarkAll: notifier.markAllRead,
                ),

              // Filter bar
              _FilterBar(
                selected: _filter,
                allNotifications: all,
                onSelect: (f) => setState(() => _filter = f),
              ),

              // List
              Expanded(
                child: filtered.isEmpty
                    ? _EmptyState(filter: _filter)
                    : _NotifList(
                        notifications: filtered,
                        notifier: notifier,
                      ),
              ),
            ],
          );
        },
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Unread banner
// ---------------------------------------------------------------------------
class _UnreadBanner extends StatelessWidget {
  final int count;
  final VoidCallback onMarkAll;
  const _UnreadBanner({required this.count, required this.onMarkAll});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(
          AppDimensions.md, AppDimensions.sm, AppDimensions.md, 0),
      padding: const EdgeInsets.symmetric(
          horizontal: AppDimensions.md, vertical: AppDimensions.xs + 2),
      decoration: const BoxDecoration(
        color: AppColors.yellow,
        border: Border.fromBorderSide(
            BorderSide(color: AppColors.black, width: 2)),
        boxShadow: [BoxShadow(offset: Offset(3, 3), color: AppColors.black)],
      ),
      child: Row(
        children: [
          const Icon(Icons.circle_notifications_outlined,
              size: 16, color: AppColors.black),
          const SizedBox(width: AppDimensions.xs),
          Expanded(
            child: Text(
              '$count unread notification${count == 1 ? '' : 's'}',
              style: AppTextStyles.labelSmall
                  .copyWith(color: AppColors.black, letterSpacing: 0.3),
            ),
          ),
          GestureDetector(
            onTap: onMarkAll,
            child: Text(
              'Mark all read',
              style: AppTextStyles.labelSmall.copyWith(
                color: AppColors.black,
                decoration: TextDecoration.underline,
                decorationColor: AppColors.black,
                letterSpacing: 0.3,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Filter bar
// ---------------------------------------------------------------------------
class _FilterBar extends StatelessWidget {
  final _NotifFilter selected;
  final List<AppNotification> allNotifications;
  final ValueChanged<_NotifFilter> onSelect;

  const _FilterBar({
    required this.selected,
    required this.allNotifications,
    required this.onSelect,
  });

  int _count(_NotifFilter f) => allNotifications.where(f.matches).length;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 48,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(
            horizontal: AppDimensions.md, vertical: AppDimensions.xs),
        children: _NotifFilter.values.map((f) {
          final isSelected = f == selected;
          final count = _count(f);
          return Padding(
            padding: const EdgeInsets.only(right: AppDimensions.xs),
            child: GestureDetector(
              onTap: () => onSelect(f),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 150),
                padding: const EdgeInsets.symmetric(
                    horizontal: AppDimensions.sm, vertical: 4),
                decoration: BoxDecoration(
                  color: isSelected ? AppColors.black : AppColors.white,
                  border: Border.all(color: AppColors.black, width: 2),
                  boxShadow: isSelected
                      ? const [
                          BoxShadow(
                              offset: Offset(2, 2), color: AppColors.black)
                        ]
                      : null,
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      f.label,
                      style: AppTextStyles.labelSmall.copyWith(
                        color:
                            isSelected ? AppColors.white : AppColors.black,
                        letterSpacing: 0.5,
                      ),
                    ),
                    if (count > 0 && f != _NotifFilter.all) ...[
                      const SizedBox(width: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 4, vertical: 1),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? AppColors.yellow
                              : AppColors.bgSurface,
                          border: Border.all(
                            color: isSelected
                                ? AppColors.yellow
                                : AppColors.black,
                            width: 1,
                          ),
                        ),
                        child: Text(
                          '$count',
                          style: AppTextStyles.caption.copyWith(
                            color: AppColors.black,
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Notification list with date groups
// ---------------------------------------------------------------------------
class _NotifList extends StatelessWidget {
  final List<AppNotification> notifications;
  final NotificationsNotifier notifier;

  const _NotifList({
    required this.notifications,
    required this.notifier,
  });

  bool _isToday(DateTime dt) {
    final now = DateTime.now();
    return dt.year == now.year && dt.month == now.month && dt.day == now.day;
  }

  bool _isYesterday(DateTime dt) {
    final y = DateTime.now().subtract(const Duration(days: 1));
    return dt.year == y.year && dt.month == y.month && dt.day == y.day;
  }

  void _handleTap(BuildContext context, AppNotification n) {
    if (!n.isRead) notifier.markRead(n.id);
    final route = n.actionRoute;
    if (route != null && route.isNotEmpty) context.push(route);
  }

  @override
  Widget build(BuildContext context) {
    final today = notifications.where((n) => _isToday(n.createdAt)).toList();
    final yesterday =
        notifications.where((n) => _isYesterday(n.createdAt)).toList();
    final earlier = notifications
        .where((n) => !_isToday(n.createdAt) && !_isYesterday(n.createdAt))
        .toList();

    return RefreshIndicator(
      color: AppColors.yellow,
      backgroundColor: AppColors.black,
      onRefresh: notifier.refresh,
      child: ListView(
        padding: const EdgeInsets.symmetric(
            horizontal: AppDimensions.md, vertical: AppDimensions.sm),
        children: [
          if (today.isNotEmpty) ...[
            const _DateHeader('TODAY'),
            ...today.map(
              (n) => _NotifCard(
                key: ValueKey(n.id),
                notification: n,
                onRead: () => notifier.markRead(n.id),
                onDelete: () => notifier.delete(n.id),
                onTap: () => _handleTap(context, n),
              ),
            ),
          ],
          if (yesterday.isNotEmpty) ...[
            const _DateHeader('YESTERDAY'),
            ...yesterday.map(
              (n) => _NotifCard(
                key: ValueKey(n.id),
                notification: n,
                onRead: () => notifier.markRead(n.id),
                onDelete: () => notifier.delete(n.id),
                onTap: () => _handleTap(context, n),
              ),
            ),
          ],
          if (earlier.isNotEmpty) ...[
            const _DateHeader('EARLIER'),
            ...earlier.map(
              (n) => _NotifCard(
                key: ValueKey(n.id),
                notification: n,
                onRead: () => notifier.markRead(n.id),
                onDelete: () => notifier.delete(n.id),
                onTap: () => _handleTap(context, n),
              ),
            ),
          ],
          const SizedBox(height: AppDimensions.xl),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Date section header
// ---------------------------------------------------------------------------
class _DateHeader extends StatelessWidget {
  final String label;
  const _DateHeader(this.label);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(
          top: AppDimensions.md, bottom: AppDimensions.xs),
      child: Row(
        children: [
          Text(
            label,
            style: AppTextStyles.labelSmall
                .copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(width: AppDimensions.sm),
          const Expanded(
            child: Divider(color: AppColors.borderLight, thickness: 1),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Individual notification card
// ---------------------------------------------------------------------------
class _NotifCard extends StatelessWidget {
  final AppNotification notification;
  final VoidCallback onRead;
  final VoidCallback onDelete;
  final VoidCallback onTap;

  const _NotifCard({
    super.key,
    required this.notification,
    required this.onRead,
    required this.onDelete,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isRead = notification.isRead;
    final accentColor = notification.dotColor;

    return Padding(
      padding: const EdgeInsets.only(bottom: AppDimensions.xs + 2),
      child: Dismissible(
        key: ValueKey(notification.id),
        direction: DismissDirection.endToStart,
        background: Container(
          alignment: Alignment.centerRight,
          padding: const EdgeInsets.only(right: AppDimensions.lg),
          color: AppColors.red,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.delete_outline,
                  color: AppColors.white, size: 22),
              const SizedBox(height: 2),
              Text(
                'DELETE',
                style: AppTextStyles.caption.copyWith(
                    color: AppColors.white,
                    fontSize: 9,
                    letterSpacing: 0.8),
              ),
            ],
          ),
        ),
        onDismissed: (_) => onDelete(),
        child: GestureDetector(
          onTap: onTap,
          child: Container(
            decoration: BoxDecoration(
              color: AppColors.white,
              border: Border.all(
                color: isRead ? AppColors.borderLight : AppColors.black,
                width: isRead ? 1.5 : 2,
              ),
              boxShadow: [
                BoxShadow(
                  offset: const Offset(3, 3),
                  color:
                      isRead ? AppColors.borderLight : AppColors.black,
                ),
              ],
            ),
            child: IntrinsicHeight(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Left accent bar
                  Container(
                    width: 4,
                    color: isRead ? AppColors.borderLight : accentColor,
                  ),

                  // Card body
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.all(AppDimensions.sm + 2),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Type icon
                          Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(
                              color: isRead
                                  ? AppColors.bgSurface
                                  : accentColor
                                      .withValues(alpha: 0.12),
                              border: Border.all(
                                color: isRead
                                    ? AppColors.borderLight
                                    : accentColor,
                                width: 1.5,
                              ),
                            ),
                            child: Icon(
                              notification.icon,
                              color: isRead
                                  ? AppColors.textSecondary
                                  : accentColor,
                              size: 18,
                            ),
                          ),
                          const SizedBox(width: AppDimensions.sm),

                          // Text content
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Title row
                                Row(
                                  crossAxisAlignment:
                                      CrossAxisAlignment.start,
                                  children: [
                                    Expanded(
                                      child: Text(
                                        notification.title,
                                        style: isRead
                                            ? AppTextStyles.bodyMedium
                                                .copyWith(
                                                    color: AppColors
                                                        .textSecondary)
                                            : AppTextStyles.labelLarge
                                                .copyWith(fontSize: 13),
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                    if (!isRead) ...[
                                      const SizedBox(width: 6),
                                      Container(
                                        width: 8,
                                        height: 8,
                                        margin: const EdgeInsets.only(
                                            top: 4),
                                        decoration: const BoxDecoration(
                                          color: AppColors.yellow,
                                          shape: BoxShape.circle,
                                        ),
                                      ),
                                    ],
                                  ],
                                ),

                                // Body text
                                if (notification.body != null &&
                                    notification.body!.isNotEmpty) ...[
                                  const SizedBox(height: 3),
                                  Text(
                                    notification.body!,
                                    style: AppTextStyles.bodySmall
                                        .copyWith(
                                            color: AppColors.textSecondary),
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],

                                const SizedBox(height: 6),

                                // Footer row
                                Row(
                                  children: [
                                    _TypeBadge(type: notification.type),
                                    const SizedBox(
                                        width: AppDimensions.xs),
                                    Text(
                                      _timeAgo(notification.createdAt),
                                      style: AppTextStyles.caption.copyWith(
                                        color: AppColors.textSecondary,
                                        fontSize: 10,
                                      ),
                                    ),
                                    const Spacer(),
                                    if (!isRead)
                                      GestureDetector(
                                        onTap: onRead,
                                        behavior:
                                            HitTestBehavior.opaque,
                                        child: Row(
                                          children: [
                                            const Icon(Icons.done_all,
                                                size: 13,
                                                color: AppColors.green),
                                            const SizedBox(width: 2),
                                            Text(
                                              'Mark read',
                                              style: AppTextStyles.caption
                                                  .copyWith(
                                                color: AppColors.green,
                                                fontSize: 10,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
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

// ---------------------------------------------------------------------------
// Type badge chip
// ---------------------------------------------------------------------------
class _TypeBadge extends StatelessWidget {
  final String type;
  const _TypeBadge({required this.type});

  String get _label {
    switch (type) {
      case 'fee': return 'FEE';
      case 'attendance': return 'ATTEND';
      case 'notice': return 'NOTICE';
      case 'chat': return 'CHAT';
      default: return 'INFO';
    }
  }

  Color get _color {
    switch (type) {
      case 'fee': return AppColors.warning;
      case 'attendance': return AppColors.green;
      case 'notice': return AppColors.blue;
      case 'chat': return AppColors.yellow;
      default: return AppColors.textSecondary;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
      decoration: BoxDecoration(
        color: _color.withValues(alpha: 0.12),
        border: Border.all(color: _color, width: 1),
      ),
      child: Text(
        _label,
        style: AppTextStyles.caption.copyWith(
          color: _color,
          fontSize: 9,
          fontWeight: FontWeight.w800,
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------
class _EmptyState extends StatelessWidget {
  final _NotifFilter filter;
  const _EmptyState({required this.filter});

  @override
  Widget build(BuildContext context) {
    final isUnread = filter == _NotifFilter.unread;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppDimensions.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: const BoxDecoration(
                color: AppColors.bgSurface,
                border: Border.fromBorderSide(
                    BorderSide(color: AppColors.black, width: 3)),
                boxShadow: [
                  BoxShadow(offset: Offset(4, 4), color: AppColors.black)
                ],
              ),
              child: const Icon(
                Icons.notifications_none_outlined,
                size: 36,
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: AppDimensions.lg),
            Text(
              isUnread ? 'ALL CAUGHT UP!' : 'NOTHING HERE',
              style: AppTextStyles.heading3,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppDimensions.xs),
            Text(
              isUnread
                  ? 'You have no unread notifications'
                  : 'No ${filter.label.toLowerCase()} notifications yet',
              style: AppTextStyles.bodySmall,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Loading shimmer
// ---------------------------------------------------------------------------
class _LoadingList extends StatelessWidget {
  const _LoadingList();

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.all(AppDimensions.md),
      itemCount: 6,
      separatorBuilder: (_, __) =>
          const SizedBox(height: AppDimensions.xs + 2),
      itemBuilder: (_, __) =>
          const PecShimmerBox(height: 84, width: double.infinity),
    );
  }
}

// ---------------------------------------------------------------------------
// Error view
// ---------------------------------------------------------------------------
class _ErrorView extends StatelessWidget {
  final VoidCallback onRetry;
  const _ErrorView({required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppDimensions.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: AppColors.red.withValues(alpha: 0.08),
                border: Border.all(color: AppColors.red, width: 3),
                boxShadow: const [
                  BoxShadow(offset: Offset(4, 4), color: AppColors.red)
                ],
              ),
              child: const Icon(Icons.wifi_off_outlined,
                  size: 36, color: AppColors.red),
            ),
            const SizedBox(height: AppDimensions.lg),
            Text('FAILED TO LOAD', style: AppTextStyles.heading3),
            const SizedBox(height: AppDimensions.xs),
            Text(
              'Check your connection and try again',
              style: AppTextStyles.bodySmall,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppDimensions.lg),
            GestureDetector(
              onTap: onRetry,
              child: Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: AppDimensions.lg, vertical: AppDimensions.sm),
                decoration: const BoxDecoration(
                  color: AppColors.yellow,
                  border: Border.fromBorderSide(
                      BorderSide(color: AppColors.black, width: 2)),
                  boxShadow: [
                    BoxShadow(offset: Offset(3, 3), color: AppColors.black)
                  ],
                ),
                child: Text(
                  'TRY AGAIN',
                  style:
                      AppTextStyles.button.copyWith(color: AppColors.black),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
