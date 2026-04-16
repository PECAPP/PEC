import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/faculty_card.dart';
import '../../../../shared/widgets/faculty_top_nav_bar.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authNotifierProvider).user;

    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: const FacultyTopNavBar(),
      body: CustomScrollView(
        slivers: [
          // ── Profile Header ──
          SliverToBoxAdapter(
            child: Container(
              padding: EdgeInsets.fromLTRB(
                AppDimensions.lg,
                24,
                AppDimensions.lg,
                AppDimensions.xl,
              ),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    AppColors.gold.withValues(alpha: 0.12),
                    AppColors.bgDark,
                  ],
                ),
              ),
              child: Column(
                children: [
                  // Avatar
                  CircleAvatar(
                    radius: 44,
                    backgroundColor: AppColors.gold,
                    child: CircleAvatar(
                      radius: 42,
                      backgroundColor: AppColors.cardDark,
                      backgroundImage: user?.avatar != null
                          ? NetworkImage(user!.avatar!) as ImageProvider
                          : null,
                      child: user?.avatar == null
                          ? Text(
                              user?.firstName.substring(0, 1).toUpperCase() ?? 'F',
                              style: AppTextStyles.display.copyWith(color: AppColors.gold),
                            )
                          : null,
                    ),
                  ),
                  const SizedBox(height: AppDimensions.md),
                  Text(user?.fullName ?? 'Faculty', style: AppTextStyles.heading2),
                  const SizedBox(height: 4),
                  Text(user?.email ?? '', style: AppTextStyles.bodySmall),
                  if (user?.designation != null) ...[
                    const SizedBox(height: 4),
                    Text(user!.designation!, style: AppTextStyles.labelMedium.copyWith(color: AppColors.gold)),
                  ],
                  if (user?.department != null) ...[
                    const SizedBox(height: 2),
                    Text(user!.department!, style: AppTextStyles.bodySmall),
                  ],
                ],
              ),
            ),
          ),

          // ── Menu Items ──
          SliverPadding(
            padding: const EdgeInsets.all(AppDimensions.md),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                _MenuItem(
                  icon: Icons.science_outlined,
                  label: 'Faculty Bio System',
                  subtitle: 'Publications, awards, conferences',
                  onTap: () => context.go('/faculty-bio'),
                ),
                _MenuItem(
                  icon: Icons.book_outlined,
                  label: 'My Courses',
                  subtitle: 'View assigned courses',
                  onTap: () => context.go('/courses'),
                ),
                _MenuItem(
                  icon: Icons.calendar_today_outlined,
                  label: 'Timetable',
                  subtitle: 'Weekly schedule',
                  onTap: () => context.go('/timetable'),
                ),
                _MenuItem(
                  icon: Icons.settings_outlined,
                  label: 'Settings',
                  subtitle: 'Theme, notifications',
                  onTap: () => context.go('/settings'),
                ),
                _MenuItem(
                  icon: Icons.help_outline,
                  label: 'Help & Support',
                  subtitle: 'FAQs, contact, report bugs',
                  onTap: () => context.go('/help-support'),
                ),
                const SizedBox(height: AppDimensions.lg),
                // Sign out
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: () async {
                      await ref.read(authNotifierProvider.notifier).signOut();
                      if (context.mounted) context.go('/login');
                    },
                    icon: const Icon(Icons.logout, color: AppColors.error, size: 18),
                    label: Text('Sign Out',
                        style: AppTextStyles.labelLarge.copyWith(color: AppColors.error)),
                    style: OutlinedButton.styleFrom(
                      side: BorderSide(color: AppColors.error.withValues(alpha: 0.3)),
                      minimumSize: const Size(0, 52),
                    ),
                  ),
                ),
                const SizedBox(height: AppDimensions.xxl),
              ]),
            ),
          ),
        ],
      ),
    );
  }
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String subtitle;
  final VoidCallback onTap;

  const _MenuItem({
    required this.icon,
    required this.label,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: FacultyCard(
        onTap: onTap,
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: AppColors.goldSubtle,
                borderRadius: BorderRadius.circular(AppDimensions.borderRadiusMd),
              ),
              child: Icon(icon, color: AppColors.gold, size: 20),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: AppTextStyles.labelLarge),
                  Text(subtitle, style: AppTextStyles.caption),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, size: 20, color: AppColors.textMuted),
          ],
        ),
      ),
    );
  }
}
