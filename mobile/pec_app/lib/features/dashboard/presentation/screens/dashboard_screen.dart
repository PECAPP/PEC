import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../features/auth/domain/entities/user_entity.dart';
import '../../../../features/auth/presentation/providers/auth_provider.dart';
import '../../../../shared/widgets/pec_avatar.dart';
import '../../../../shared/widgets/pec_badge.dart';
import '../../../../shared/widgets/pec_card.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authNotifierProvider).user;
    if (user == null) return const SizedBox.shrink();

    return Scaffold(
      appBar: _buildAppBar(context, user, ref),
      body: RefreshIndicator(
        color: AppColors.yellow,
        onRefresh: () => ref.read(authNotifierProvider.notifier).refreshUser(),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(AppDimensions.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _GreetingCard(user: user),
              const SizedBox(height: AppDimensions.lg),
              _QuickActions(user: user),
              const SizedBox(height: AppDimensions.lg),
              if (user.isStudent) ...[
                _SectionHeader(title: 'TODAY\'S TIMETABLE'),
                const SizedBox(height: AppDimensions.sm),
                const _TimetablePreview(),
                const SizedBox(height: AppDimensions.lg),
                _SectionHeader(title: 'ATTENDANCE OVERVIEW'),
                const SizedBox(height: AppDimensions.sm),
                const _AttendanceSummary(),
              ],
              if (user.isFaculty && !user.isAdmin) ...[
                _SectionHeader(title: 'TODAY\'S CLASSES'),
                const SizedBox(height: AppDimensions.sm),
                const _TimetablePreview(),
                const SizedBox(height: AppDimensions.lg),
                _SectionHeader(title: 'PENDING SESSIONS'),
                const SizedBox(height: AppDimensions.sm),
                const _PendingSessionsCard(),
              ],
              if (user.isAdmin) ...[
                _SectionHeader(title: 'QUICK STATS'),
                const SizedBox(height: AppDimensions.sm),
                const _AdminStatsGrid(),
              ],
              const SizedBox(height: AppDimensions.lg),
              _SectionHeader(title: 'RECENT NOTICES'),
              const SizedBox(height: AppDimensions.sm),
              const _RecentNotices(),
              const SizedBox(height: AppDimensions.xxl),
            ],
          ),
        ),
      ),
    );
  }

  AppBar _buildAppBar(BuildContext context, UserEntity user, WidgetRef ref) {
    return AppBar(
      title: const Text('DASHBOARD'),
      actions: [
        IconButton(
          icon: const Icon(Icons.notifications_outlined),
          onPressed: () => context.push('/notifications'),
        ),
        Padding(
          padding: const EdgeInsets.only(right: AppDimensions.md),
          child: GestureDetector(
            onTap: () => context.push('/profile'),
            child: PecAvatar(
              name: user.name,
              imageUrl: user.avatarUrl,
              size: AppDimensions.avatarSm,
            ),
          ),
        ),
      ],
    );
  }
}

// ── Greeting ──────────────────────────────────────────────────────────────
class _GreetingCard extends StatelessWidget {
  final UserEntity user;
  const _GreetingCard({required this.user});

  String get _greeting {
    final h = DateTime.now().hour;
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  @override
  Widget build(BuildContext context) {
    return PecCard(
      color: AppColors.yellow,
      shadowColor: AppColors.black,
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '$_greeting,',
                  style: AppTextStyles.bodyMedium
                      .copyWith(color: AppColors.black.withValues(alpha: 0.7)),
                ),
                const SizedBox(height: 2),
                Text(
                  user.name.isEmpty ? user.email : user.name,
                  style: AppTextStyles.heading2.copyWith(color: AppColors.black),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: AppDimensions.sm),
                PecBadge(
                  label: user.primaryRole.displayName,
                  color: AppColors.black,
                  textColor: AppColors.yellow,
                ),
              ],
            ),
          ),
          PecAvatar(
            name: user.name,
            imageUrl: user.avatarUrl,
            size: AppDimensions.avatarLg,
          ),
        ],
      ),
    );
  }
}

// ── Quick Actions ─────────────────────────────────────────────────────────
class _QuickActions extends StatelessWidget {
  final UserEntity user;
  const _QuickActions({required this.user});

  @override
  Widget build(BuildContext context) {
    final actions = <_Action>[
      if (user.isStudent)
        _Action('Scan QR', Icons.qr_code_scanner, AppColors.green, '/attendance/scan'),
      if (user.isFaculty && !user.isAdmin)
        _Action('Generate QR', Icons.qr_code, AppColors.green, '/attendance/generate'),
      _Action('Courses', Icons.book_outlined, AppColors.blue, '/courses'),
      _Action('Chat', Icons.chat_bubble_outline, AppColors.yellow, '/chat'),
      _Action('Notices', Icons.campaign_outlined, AppColors.red, '/noticeboard'),
      if (user.isStudent)
        _Action('Timetable', Icons.schedule_outlined, AppColors.blue, '/timetable'),
      if (user.isAdmin)
        _Action('Users', Icons.people_outline, AppColors.red, '/users'),
    ];

    return GridView.count(
      crossAxisCount: 4,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: AppDimensions.sm,
      mainAxisSpacing: AppDimensions.sm,
      childAspectRatio: 0.85,
      children: actions
          .take(4)
          .map((a) => _ActionTile(action: a))
          .toList(),
    );
  }
}

class _Action {
  final String label;
  final IconData icon;
  final Color color;
  final String route;
  const _Action(this.label, this.icon, this.color, this.route);
}

class _ActionTile extends StatelessWidget {
  final _Action action;
  const _ActionTile({required this.action});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.go(action.route),
      child: Container(
        decoration: BoxDecoration(
          color: action.color,
          border: Border.all(color: AppColors.black, width: AppDimensions.borderWidth),
          boxShadow: const [
            BoxShadow(
              offset: Offset(4, 4),
              color: AppColors.black,
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(action.icon, color: AppColors.black, size: AppDimensions.iconLg),
            const SizedBox(height: AppDimensions.xs),
            Text(
              action.label,
              style: AppTextStyles.labelSmall
                  .copyWith(color: AppColors.black, fontSize: 10),
              textAlign: TextAlign.center,
              maxLines: 2,
            ),
          ],
        ),
      ),
    );
  }
}

// ── Section header ────────────────────────────────────────────────────────
class _SectionHeader extends StatelessWidget {
  final String title;
  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(width: 4, height: 20, color: AppColors.yellow),
        const SizedBox(width: AppDimensions.sm),
        Text(title, style: AppTextStyles.labelLarge),
      ],
    );
  }
}

// ── Timetable preview (placeholder — real data in Phase 2) ───────────────
class _TimetablePreview extends StatelessWidget {
  const _TimetablePreview();

  @override
  Widget build(BuildContext context) {
    return PecCard(
      color: AppColors.bgSurface,
      child: Column(
        children: List.generate(
          3,
          (i) => Padding(
            padding: const EdgeInsets.only(bottom: AppDimensions.sm),
            child: Row(
              children: [
                Container(
                  width: 48,
                  padding: const EdgeInsets.all(AppDimensions.xs),
                  color: AppColors.yellow,
                  child: Text(
                    '${8 + i * 2}:00',
                    style: AppTextStyles.labelSmall
                        .copyWith(color: AppColors.black, fontSize: 10),
                    textAlign: TextAlign.center,
                  ),
                ),
                const SizedBox(width: AppDimensions.sm),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(AppDimensions.sm),
                    color: AppColors.bgSurface,
                    child: Text(
                      '— Connect backend to load timetable —',
                      style: AppTextStyles.bodySmall,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ── Attendance summary (placeholder) ─────────────────────────────────────
class _AttendanceSummary extends StatelessWidget {
  const _AttendanceSummary();

  @override
  Widget build(BuildContext context) {
    return PecCard(
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _StatPill(label: 'PRESENT', value: '--', color: AppColors.green),
          _StatPill(label: 'ABSENT', value: '--', color: AppColors.red),
          _StatPill(label: 'PERCENTAGE', value: '--%', color: AppColors.blue),
        ],
      ),
    );
  }
}

class _StatPill extends StatelessWidget {
  final String label;
  final String value;
  final Color color;
  const _StatPill({required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value,
            style: AppTextStyles.heading2.copyWith(color: color)),
        const SizedBox(height: AppDimensions.xs),
        Text(label, style: AppTextStyles.labelSmall),
      ],
    );
  }
}

// ── Pending attendance sessions (faculty) ────────────────────────────────
class _PendingSessionsCard extends StatelessWidget {
  const _PendingSessionsCard();

  @override
  Widget build(BuildContext context) {
    return PecCard(
      child: Text(
        '— Connect backend to load pending sessions —',
        style: AppTextStyles.bodySmall,
      ),
    );
  }
}

// ── Admin stats grid ─────────────────────────────────────────────────────
class _AdminStatsGrid extends StatelessWidget {
  const _AdminStatsGrid();

  @override
  Widget build(BuildContext context) {
    final stats = [
      _Stat('TOTAL USERS', '--', AppColors.yellow),
      _Stat('ACTIVE TODAY', '--', AppColors.green),
      _Stat('COURSES', '--', AppColors.blue),
      _Stat('DEPARTMENTS', '--', AppColors.red),
    ];
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: AppDimensions.sm,
      mainAxisSpacing: AppDimensions.sm,
      childAspectRatio: 2,
      children: stats.map((s) => _AdminStatTile(stat: s)).toList(),
    );
  }
}

class _Stat {
  final String label;
  final String value;
  final Color color;
  const _Stat(this.label, this.value, this.color);
}

class _AdminStatTile extends StatelessWidget {
  final _Stat stat;
  const _AdminStatTile({required this.stat});

  @override
  Widget build(BuildContext context) {
    return PecCard(
      color: stat.color,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(stat.value,
              style: AppTextStyles.heading2.copyWith(color: AppColors.black)),
          Text(stat.label,
              style: AppTextStyles.labelSmall
                  .copyWith(color: AppColors.black, fontSize: 9)),
        ],
      ),
    );
  }
}

// ── Recent notices (placeholder) ─────────────────────────────────────────
class _RecentNotices extends StatelessWidget {
  const _RecentNotices();

  @override
  Widget build(BuildContext context) {
    return PecCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: List.generate(
          3,
          (i) => Padding(
            padding: const EdgeInsets.only(bottom: AppDimensions.sm),
            child: Row(
              children: [
                Container(
                    width: 8,
                    height: 8,
                    color: i == 0 ? AppColors.red : AppColors.blue),
                const SizedBox(width: AppDimensions.sm),
                Text(
                  '— Connect backend to load notices —',
                  style: AppTextStyles.bodySmall,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
