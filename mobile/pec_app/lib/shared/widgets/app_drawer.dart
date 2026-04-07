import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../features/auth/domain/entities/user_entity.dart';
import '../../features/auth/presentation/providers/auth_provider.dart';
import '../widgets/pec_avatar.dart';

class AppDrawer extends ConsumerWidget {
  const AppDrawer({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authNotifierProvider).user;
    if (user == null) return const SizedBox.shrink();

    return Drawer(
      width: MediaQuery.of(context).size.width * 0.82,
      backgroundColor: Colors.transparent,
      child: _DrawerContent(user: user),
    );
  }
}

class _DrawerContent extends StatelessWidget {
  final UserEntity user;
  const _DrawerContent({required this.user});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Color(0xFF0E0E0E),
        border: Border(
          right: BorderSide(color: Color(0xFF2A2A2A), width: 1),
        ),
      ),
      child: Column(
        children: [
          _DrawerHeader(user: user),
          Expanded(
            child: ListView(
              padding: EdgeInsets.zero,
              children: [
                const SizedBox(height: 8),
                ..._buildSections(context, user),
                const SizedBox(height: 24),
              ],
            ),
          ),
          _DrawerFooter(user: user),
        ],
      ),
    );
  }

  List<Widget> _buildSections(BuildContext context, UserEntity user) {
    final sections = _getSections(user);
    final result = <Widget>[];
    for (int i = 0; i < sections.length; i++) {
      final section = sections[i];
      if (section.label != null) {
        if (i > 0) result.add(const _SectionDivider());
        result.add(_SectionLabel(label: section.label!));
      }
      for (final item in section.items) {
        result.add(_DrawerItem(item: item));
      }
    }
    return result;
  }

  List<_Section> _getSections(UserEntity user) {
    if (user.isStudent) {
      return [
        _Section(items: [
          _Item('My Profile', Icons.person_outline_rounded, '/profile'),
          _Item('Clubs', Icons.groups_outlined, '/clubs'),
        ]),
        _Section(label: 'ACADEMICS', items: [
          _Item('Courses', Icons.book_outlined, '/courses'),
          _Item('Timetable', Icons.schedule_outlined, '/timetable'),
          _Item('Academic Calendar', Icons.calendar_month_outlined, '/academic-calendar'),
          _Item('Examinations', Icons.assignment_outlined, '/examinations'),
          _Item('Attendance', Icons.fact_check_outlined, '/attendance'),
          _Item('Score Sheet', Icons.bar_chart_rounded, '/score-sheet'),
          _Item('Course Materials', Icons.folder_open_outlined, '/course-materials'),
        ]),
        _Section(label: 'CAREER', items: [
          _Item('Resume Builder', Icons.description_outlined, '/resume-builder'),
        ]),
        _Section(label: 'CAMPUS', items: [
          _Item('Finance', Icons.account_balance_wallet_outlined, '/finance'),
          _Item('Buy & Sell', Icons.storefront_outlined, '/buy-sell'),
          _Item('Hostel Issues', Icons.apartment_outlined, '/hostel-issues'),
          _Item('Night Canteen', Icons.restaurant_menu_outlined, '/canteen'),
          _Item('Campus Map', Icons.map_outlined, '/campus-map'),
        ]),
        _Section(label: 'SUPPORT', items: [
          _Item('Help & Support', Icons.help_outline_rounded, '/help-support'),
          _Item('Settings', Icons.settings_outlined, '/settings'),
        ]),
      ];
    }
    if (user.isFaculty && !user.isAdmin) {
      return [
        _Section(items: [
          _Item('My Profile', Icons.person_outline_rounded, '/profile'),
        ]),
        _Section(label: 'ACADEMICS', items: [
          _Item('Courses', Icons.book_outlined, '/courses'),
          _Item('Timetable', Icons.schedule_outlined, '/timetable'),
          _Item('Attendance', Icons.fact_check_outlined, '/attendance'),
          _Item('Score Sheet', Icons.bar_chart_rounded, '/score-sheet'),
          _Item('Course Materials', Icons.folder_open_outlined, '/course-materials'),
        ]),
        _Section(label: 'CAMPUS', items: [
          _Item('Buy & Sell', Icons.storefront_outlined, '/buy-sell'),
          _Item('Campus Map', Icons.map_outlined, '/campus-map'),
        ]),
        _Section(label: 'SUPPORT', items: [
          _Item('Help & Support', Icons.help_outline_rounded, '/help-support'),
          _Item('Settings', Icons.settings_outlined, '/settings'),
        ]),
      ];
    }
    // Admin
    return [
      _Section(items: [
        _Item('My Profile', Icons.person_outline_rounded, '/profile'),
      ]),
      _Section(label: 'MANAGEMENT', items: [
        _Item('Courses', Icons.book_outlined, '/courses'),
        _Item('Academic Calendar', Icons.calendar_month_outlined, '/academic-calendar'),
        _Item('Examinations', Icons.assignment_outlined, '/examinations'),
        _Item('Hostel Issues', Icons.apartment_outlined, '/hostel-issues'),
      ]),
      _Section(label: 'CAMPUS', items: [
        _Item('Buy & Sell', Icons.storefront_outlined, '/buy-sell'),
        _Item('Campus Map', Icons.map_outlined, '/campus-map'),
      ]),
      _Section(label: 'SUPPORT', items: [
        _Item('Help & Support', Icons.help_outline_rounded, '/help-support'),
        _Item('Settings', Icons.settings_outlined, '/settings'),
      ]),
    ];
  }
}

// ── Data classes ──────────────────────────────────────────────────────────────

class _Item {
  final String label;
  final IconData icon;
  final String route;
  const _Item(this.label, this.icon, this.route);
}

class _Section {
  final String? label;
  final List<_Item> items;
  const _Section({this.label, required this.items});
}

// ── Sub-widgets ───────────────────────────────────────────────────────────────

class _DrawerHeader extends StatelessWidget {
  final UserEntity user;
  const _DrawerHeader({required this.user});

  @override
  Widget build(BuildContext context) {
    final topPad = MediaQuery.of(context).padding.top;
    return Container(
      width: double.infinity,
      padding: EdgeInsets.fromLTRB(20, topPad + 20, 20, 20),
      decoration: BoxDecoration(
        color: const Color(0xFF121212),
        border: Border(
          bottom: BorderSide(
            color: AppColors.yellow.withValues(alpha: 0.25),
            width: 1,
          ),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              // Avatar
              Container(
                width: 54,
                height: 54,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(
                    color: AppColors.yellow.withValues(alpha: 0.6),
                    width: 1.5,
                  ),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(3),
                  child: PecAvatar(
                    name: user.name,
                    imageUrl: user.avatarUrl,
                    size: 54,
                  ),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      user.name,
                      style: AppTextStyles.bodyLarge.copyWith(
                        color: AppColors.white,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.1,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 3),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppColors.yellow.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(3),
                        border: Border.all(
                          color: AppColors.yellow.withValues(alpha: 0.35),
                          width: 0.8,
                        ),
                      ),
                      child: Text(
                        user.primaryRole.displayName.toUpperCase(),
                        style: AppTextStyles.labelSmall.copyWith(
                          color: AppColors.yellow,
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 1.2,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          if (user.department != null) ...[
            const SizedBox(height: 12),
            Row(
              children: [
                Icon(Icons.domain_outlined,
                    size: 13, color: AppColors.white.withValues(alpha: 0.45)),
                const SizedBox(width: 5),
                Expanded(
                  child: Text(
                    user.department!,
                    style: AppTextStyles.bodySmall.copyWith(
                      color: AppColors.white.withValues(alpha: 0.5),
                      fontSize: 12,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  final String label;
  const _SectionLabel({required this.label});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 18, 20, 6),
      child: Text(
        label,
        style: AppTextStyles.labelSmall.copyWith(
          color: AppColors.white.withValues(alpha: 0.32),
          fontSize: 10,
          fontWeight: FontWeight.w700,
          letterSpacing: 1.5,
        ),
      ),
    );
  }
}

class _SectionDivider extends StatelessWidget {
  const _SectionDivider();

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
      height: 1,
      color: const Color(0xFF1E1E1E),
    );
  }
}

class _DrawerItem extends StatelessWidget {
  final _Item item;
  const _DrawerItem({required this.item});

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    final isActive = location.startsWith(item.route);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 1),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(4),
        child: InkWell(
          borderRadius: BorderRadius.circular(4),
          splashColor: AppColors.yellow.withValues(alpha: 0.08),
          highlightColor: AppColors.yellow.withValues(alpha: 0.04),
          onTap: () {
            Navigator.of(context).pop();
            context.go(item.route);
          },
          child: Container(
            height: 44,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(4),
              color: isActive
                  ? AppColors.yellow.withValues(alpha: 0.10)
                  : Colors.transparent,
              border: isActive
                  ? Border.all(
                      color: AppColors.yellow.withValues(alpha: 0.22),
                      width: 0.8,
                    )
                  : null,
            ),
            child: Row(
              children: [
                Icon(
                  item.icon,
                  size: 18,
                  color: isActive
                      ? AppColors.yellow
                      : AppColors.white.withValues(alpha: 0.6),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    item.label,
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: isActive
                          ? AppColors.yellow
                          : AppColors.white.withValues(alpha: 0.85),
                      fontWeight:
                          isActive ? FontWeight.w600 : FontWeight.w400,
                      fontSize: 14,
                    ),
                  ),
                ),
                if (isActive)
                  Container(
                    width: 4,
                    height: 4,
                    decoration: const BoxDecoration(
                      color: AppColors.yellow,
                      shape: BoxShape.circle,
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

class _DrawerFooter extends ConsumerWidget {
  final UserEntity user;
  const _DrawerFooter({required this.user});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bottomPad = MediaQuery.of(context).padding.bottom;
    return Container(
      padding: EdgeInsets.fromLTRB(10, 8, 10, bottomPad + 8),
      decoration: const BoxDecoration(
        border: Border(
          top: BorderSide(color: Color(0xFF1E1E1E), width: 1),
        ),
      ),
      child: Column(
        children: [
          _FooterItem(
            icon: Icons.settings_outlined,
            label: 'Settings',
            onTap: () {
              Navigator.of(context).pop();
              context.go('/settings');
            },
          ),
          _FooterItem(
            icon: Icons.help_outline_rounded,
            label: 'Help & Support',
            onTap: () {
              Navigator.of(context).pop();
              context.go('/help-support');
            },
          ),
          const SizedBox(height: 4),
          _FooterItem(
            icon: Icons.logout_rounded,
            label: 'Sign Out',
            color: AppColors.red.withValues(alpha: 0.85),
            onTap: () {
              Navigator.of(context).pop();
              ref.read(authNotifierProvider.notifier).signOut();
            },
          ),
        ],
      ),
    );
  }
}

class _FooterItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final Color? color;

  const _FooterItem({
    required this.icon,
    required this.label,
    required this.onTap,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    final c = color ?? AppColors.white.withValues(alpha: 0.6);
    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(4),
      child: InkWell(
        borderRadius: BorderRadius.circular(4),
        splashColor: (color ?? AppColors.white).withValues(alpha: 0.06),
        onTap: onTap,
        child: Container(
          height: 42,
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: Row(
            children: [
              Icon(icon, size: 18, color: c),
              const SizedBox(width: 12),
              Text(
                label,
                style: AppTextStyles.bodyMedium.copyWith(
                  color: c,
                  fontSize: 14,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
