import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../features/auth/domain/entities/user_entity.dart';
import '../../../../features/auth/presentation/providers/auth_provider.dart';
import '../../../../features/attendance/presentation/providers/attendance_provider.dart';
import '../../../../features/courses/presentation/providers/courses_provider.dart';
import '../../../../features/timetable/presentation/providers/timetable_provider.dart';
import '../../../../features/timetable/data/models/timetable_model.dart';
import '../../../../features/noticeboard/presentation/providers/notice_provider.dart';
import '../../../../features/notifications/presentation/providers/notifications_provider.dart';
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
              if (user.isStudent) ...[
                _StudentFirstLookSection(user: user),
                const SizedBox(height: AppDimensions.lg),
                _SectionHeader(title: 'ENROLLED COURSES'),
                const SizedBox(height: AppDimensions.sm),
                const _EnrolledCoursesPreview(),
              ],
              if (user.isFaculty && !user.isAdmin) ...[
                _GreetingCard(user: user),
                const SizedBox(height: AppDimensions.lg),
                _QuickActions(user: user),
                const SizedBox(height: AppDimensions.lg),
                _SectionHeader(title: 'TODAY\'S CLASSES'),
                const SizedBox(height: AppDimensions.sm),
                const _TimetablePreview(),
                const SizedBox(height: AppDimensions.lg),
                _SectionHeader(title: 'PENDING SESSIONS'),
                const SizedBox(height: AppDimensions.sm),
                const _PendingSessionsCard(),
              ],
              if (user.isAdmin) ...[
                _GreetingCard(user: user),
                const SizedBox(height: AppDimensions.lg),
                _QuickActions(user: user),
                const SizedBox(height: AppDimensions.lg),
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
    final unread = ref.watch(unreadCountProvider);
    return AppBar(
      title: const Text('DASHBOARD'),
      actions: [
        Stack(
          alignment: Alignment.topRight,
          children: [
            IconButton(
              icon: const Icon(Icons.notifications_outlined),
              onPressed: () => context.push('/notifications'),
            ),
            if (unread > 0)
              Positioned(
                top: 8,
                right: 8,
                child: Container(
                  width: 16,
                  height: 16,
                  decoration: const BoxDecoration(
                    color: AppColors.red,
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: Text(
                      unread > 9 ? '9+' : '$unread',
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 8,
                          fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
              ),
          ],
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

class _StudentFirstLookSection extends ConsumerWidget {
  final UserEntity user;
  const _StudentFirstLookSection({required this.user});

  String get _greeting {
    final h = DateTime.now().hour;
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final attendanceAsync = ref.watch(overallAttendanceProvider);
    final enrolledAsync = ref.watch(enrolledCoursesProvider);

    final attendancePct = attendanceAsync.maybeWhen(
      data: (stats) => (stats['pct'] as double?)?.round() ?? 0,
      orElse: () => 0,
    );

    final enrolledCount = enrolledAsync.maybeWhen(
      data: (items) => items.length,
      orElse: () => 0,
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(AppDimensions.lg),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.yellow.withValues(alpha: 0.2)),
            gradient: LinearGradient(
              colors: [
                AppColors.yellow.withValues(alpha: 0.18),
                AppColors.yellow.withValues(alpha: 0.04),
                AppColors.bgSurfaceDark,
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.yellow.withValues(alpha: 0.25),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  'Institutional Dashboard',
                  style: AppTextStyles.labelSmall
                      .copyWith(color: AppColors.yellow, fontSize: 10),
                ),
              ),
              const SizedBox(height: AppDimensions.md),
              Text(
                '$_greeting, ${user.name.trim().isEmpty ? 'Student' : user.name.trim().split(' ').first}!',
                style: AppTextStyles.heading1.copyWith(color: AppColors.white),
              ),
              const SizedBox(height: AppDimensions.sm),
              Wrap(
                spacing: 8,
                crossAxisAlignment: WrapCrossAlignment.center,
                children: [
                  Text(
                    user.id,
                    style: AppTextStyles.labelLarge.copyWith(color: AppColors.yellow),
                  ),
                  Container(width: 4, height: 4, decoration: const BoxDecoration(color: AppColors.borderLight, shape: BoxShape.circle)),
                  Text(
                    user.department ?? 'Department',
                    style: AppTextStyles.bodyLarge.copyWith(color: AppColors.white.withValues(alpha: 0.7)),
                  ),
                ],
              ),
              Text(
                'Semester ${user.semester ?? 1}',
                style: AppTextStyles.bodyLarge.copyWith(color: AppColors.white.withValues(alpha: 0.7)),
              ),
            ],
          ),
        ),
        const SizedBox(height: AppDimensions.lg),
        _StudentPrimaryCard(
          accent: AppColors.green,
          icon: Icons.fact_check_outlined,
          title: 'ATTENDANCE',
          value: '$attendancePct%',
          onTap: () => context.go('/attendance'),
        ),
        const SizedBox(height: AppDimensions.md),
        _StudentPrimaryCard(
          accent: AppColors.yellow,
          icon: Icons.menu_book_outlined,
          title: 'ENROLLED',
          value: '$enrolledCount',
          onTap: () => context.go('/courses'),
        ),
        const SizedBox(height: AppDimensions.md),
        _StudentPrimaryCard(
          accent: AppColors.yellow,
          icon: Icons.school_outlined,
          title: 'SCORE SHEET',
          value: 'VIEW',
          trailingIcon: Icons.work_outline,
          onTap: () => context.go('/score-sheet'),
        ),
      ],
    );
  }
}

class _StudentPrimaryCard extends StatelessWidget {
  final Color accent;
  final IconData icon;
  final String title;
  final String value;
  final bool showBadge;
  final IconData? trailingIcon;
  final VoidCallback onTap;

  const _StudentPrimaryCard({
    required this.accent,
    required this.icon,
    required this.title,
    required this.value,
    required this.onTap,
    this.showBadge = false,
    this.trailingIcon,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(0),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: AppDimensions.md, vertical: AppDimensions.md),
        decoration: BoxDecoration(
          color: AppColors.bgSurfaceDark.withValues(alpha: 0.75),
          border: Border.all(color: AppColors.borderLight.withValues(alpha: 0.15)),
        ),
        child: Row(
          children: [
            Container(width: 4, height: 74, color: accent),
            const SizedBox(width: AppDimensions.md),
            Stack(
              clipBehavior: Clip.none,
              children: [
                Container(
                  width: 54,
                  height: 54,
                  decoration: BoxDecoration(
                    color: accent.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(icon, color: accent, size: 28),
                ),
                if (showBadge)
                  Positioned(
                    right: -8,
                    top: -8,
                    child: Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: AppColors.red,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.black, width: 1),
                      ),
                      child: Center(
                        child: Text('N', style: AppTextStyles.labelLarge.copyWith(color: AppColors.white)),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(width: AppDimensions.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: AppTextStyles.labelSmall.copyWith(
                      color: AppColors.white.withValues(alpha: 0.65),
                      letterSpacing: 2,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    value,
                    style: AppTextStyles.heading2.copyWith(color: AppColors.white),
                  ),
                ],
              ),
            ),
            if (trailingIcon != null)
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: AppColors.yellow,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(trailingIcon, color: AppColors.black, size: 30),
              ),
          ],
        ),
      ),
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

class _EnrolledCoursesPreview extends ConsumerWidget {
  const _EnrolledCoursesPreview();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final enrolledAsync = ref.watch(enrolledCoursesProvider);

    return enrolledAsync.when(
      loading: () => PecCard(
        color: AppColors.bgSurface,
        child: const Center(
          child: CircularProgressIndicator(color: AppColors.yellow),
        ),
      ),
      error: (_, __) => PecCard(
        color: AppColors.bgSurface,
        child: Text(
          'Could not load enrolled courses',
          style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary),
        ),
      ),
      data: (enrollments) {
        if (enrollments.isEmpty) {
          return PecCard(
            color: AppColors.bgSurface,
            child: Text(
              'No enrolled courses yet',
              style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary),
            ),
          );
        }

        final shown = enrollments.take(4).toList();
        return Column(
          children: [
            for (final e in shown)
              Padding(
                padding: const EdgeInsets.only(bottom: AppDimensions.sm),
                child: PecCard(
                  color: AppColors.bgSurface,
                  onTap: () => context.push('/courses/${e.courseId}'),
                  child: Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        color: AppColors.yellow,
                        child: Center(
                          child: Text(
                            e.courseCode.length > 4
                                ? e.courseCode.substring(0, 4)
                                : e.courseCode,
                            style: AppTextStyles.labelSmall.copyWith(
                              color: AppColors.black,
                              fontSize: 9,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: AppDimensions.md),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              e.courseName,
                              style: AppTextStyles.labelLarge,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            Text(
                              '${e.courseCode}${e.semester != null ? ' · Sem ${e.semester}' : ''}',
                              style: AppTextStyles.caption,
                            ),
                          ],
                        ),
                      ),
                      const Icon(Icons.chevron_right, size: 20, color: AppColors.textSecondary),
                    ],
                  ),
                ),
              ),
            if (enrollments.length > shown.length)
              Align(
                alignment: Alignment.centerLeft,
                child: GestureDetector(
                  onTap: () => context.go('/courses'),
                  child: Text(
                    'View all ${enrollments.length} courses →',
                    style: AppTextStyles.labelSmall.copyWith(color: AppColors.blue, fontSize: 11),
                  ),
                ),
              ),
          ],
        );
      },
    );
  }
}

// ── Timetable preview (real data) ────────────────────────────────────────
class _TimetablePreview extends ConsumerWidget {
  const _TimetablePreview();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final todayAsync = ref.watch(todayTimetableProvider);
    return todayAsync.when(
      loading: () => PecCard(
        color: AppColors.bgSurface,
        child: const Center(
            child: CircularProgressIndicator(color: AppColors.yellow)),
      ),
      error: (_, __) => PecCard(
        child: Text('Could not load timetable',
            style: AppTextStyles.bodySmall
                .copyWith(color: AppColors.textSecondary)),
      ),
      data: (entries) {
        if (entries.isEmpty) {
          return PecCard(
            color: AppColors.bgSurface,
            child: Row(
              children: [
                Container(width: 4, height: 40, color: AppColors.yellow),
                const SizedBox(width: AppDimensions.sm),
                Text('No classes today',
                    style: AppTextStyles.bodySmall
                        .copyWith(color: AppColors.textSecondary)),
              ],
            ),
          );
        }
        final shown = entries.take(3).toList();
        return PecCard(
          color: AppColors.bgSurface,
          child: Column(
            children: [
              for (final e in shown)
                Padding(
                  padding:
                      const EdgeInsets.only(bottom: AppDimensions.sm),
                  child: Row(
                    children: [
                      Container(
                        width: 52,
                        padding: const EdgeInsets.all(AppDimensions.xs),
                        color: _isLive(e) ? AppColors.yellow : AppColors.black,
                        child: Text(
                          e.startTime,
                          style: AppTextStyles.labelSmall.copyWith(
                              color: _isLive(e)
                                  ? AppColors.black
                                  : AppColors.white,
                              fontSize: 9),
                          textAlign: TextAlign.center,
                        ),
                      ),
                      const SizedBox(width: AppDimensions.sm),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(e.courseName,
                                style: AppTextStyles.labelSmall,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis),
                            if (e.room != null)
                              Text(e.room!,
                                  style: AppTextStyles.caption),
                          ],
                        ),
                      ),
                      if (_isLive(e))
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 4, vertical: 1),
                          color: AppColors.green,
                          child: Text('LIVE',
                              style: AppTextStyles.labelSmall.copyWith(
                                  color: AppColors.black, fontSize: 8)),
                        ),
                    ],
                  ),
                ),
              if (entries.length > 3)
                Text('+${entries.length - 3} more',
                    style: AppTextStyles.caption
                        .copyWith(color: AppColors.textSecondary)),
            ],
          ),
        );
      },
    );
  }

  bool _isLive(TimetableEntry e) {
    final now = DateTime.now();
    final nowMins = now.hour * 60 + now.minute;
    return nowMins >= e.startMinutes &&
        nowMins < e.startMinutes + 60;
  }
}

// ── Attendance summary (real data) ────────────────────────────────────────
class _AttendanceSummary extends ConsumerWidget {
  const _AttendanceSummary();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statsAsync = ref.watch(overallAttendanceProvider);
    return statsAsync.when(
      loading: () => PecCard(
        child: const Center(
            child: CircularProgressIndicator(color: AppColors.yellow)),
      ),
      error: (_, __) => PecCard(
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _StatPill(label: 'PRESENT', value: '--', color: AppColors.green),
            _StatPill(label: 'ABSENT', value: '--', color: AppColors.red),
            _StatPill(label: 'OVERALL', value: '--%', color: AppColors.blue),
          ],
        ),
      ),
      data: (stats) {
        final pct = (stats['pct'] as double).toStringAsFixed(1);
        return PecCard(
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _StatPill(
                  label: 'PRESENT',
                  value: '${stats['present']}',
                  color: AppColors.green),
              _StatPill(
                  label: 'ABSENT',
                  value: '${stats['absent']}',
                  color: AppColors.red),
              _StatPill(
                  label: 'OVERALL',
                  value: '$pct%',
                  color: (stats['pct'] as double) >= 75
                      ? AppColors.green
                      : AppColors.red),
            ],
          ),
        );
      },
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

// ── Recent notices (real data) ────────────────────────────────────────────
class _RecentNotices extends ConsumerWidget {
  const _RecentNotices();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final noticesAsync = ref.watch(noticesProvider);
    return noticesAsync.when(
      loading: () => PecCard(
        child: const Center(
            child: CircularProgressIndicator(color: AppColors.yellow)),
      ),
      error: (_, __) => PecCard(
        child: Text('Could not load notices',
            style:
                AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary)),
      ),
      data: (notices) {
        if (notices.isEmpty) {
          return PecCard(
            child: Text('No recent notices',
                style: AppTextStyles.bodySmall
                    .copyWith(color: AppColors.textSecondary)),
          );
        }
        final shown = notices.take(3).toList();
        return PecCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              for (final n in shown)
                Padding(
                  padding: const EdgeInsets.only(bottom: AppDimensions.sm),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                          width: 8,
                          height: 8,
                          margin: const EdgeInsets.only(top: 4),
                          color: n.dotColor),
                      const SizedBox(width: AppDimensions.sm),
                      Expanded(
                        child: Text(
                          n.title,
                          style: AppTextStyles.bodySmall,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
              if (notices.length > 3)
                GestureDetector(
                  onTap: () => context.push('/noticeboard'),
                  child: Text(
                    'View all ${notices.length} notices →',
                    style: AppTextStyles.labelSmall.copyWith(
                        color: AppColors.blue, fontSize: 11),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }
}
