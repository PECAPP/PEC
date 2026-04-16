import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/constants/app_colors.dart';
import '../../core/constants/app_dimensions.dart';
import '../../core/constants/app_text_styles.dart';

class AppScaffold extends ConsumerStatefulWidget {
  final Widget child;

  const AppScaffold({super.key, required this.child});

  @override
  ConsumerState<AppScaffold> createState() => _AppScaffoldState();
}

class _AppScaffoldState extends ConsumerState<AppScaffold> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  static const _bottomNavItems = [
    _NavItem(label: 'Home', icon: Icons.grid_view_rounded, route: '/dashboard'),
    _NavItem(label: 'Courses', icon: Icons.book_outlined, route: '/courses'),
    _NavItem(label: 'Chat', icon: Icons.chat_bubble_outline, route: '/chat'),
    _NavItem(label: 'Profile', icon: Icons.person_outline, route: '/profile'),
  ];

  static const _drawerSections = [
    _DrawerSection(
      title: 'Core',
      items: [
        _DrawerNavItem(label: 'Dashboard', icon: Icons.dashboard_outlined, route: '/dashboard'),
        _DrawerNavItem(label: 'Users', icon: Icons.group_outlined, route: '/users'),
        _DrawerNavItem(label: 'Chat', icon: Icons.chat_bubble_outline, route: '/chat'),
      ],
    ),
    _DrawerSection(
      title: 'Academics',
      items: [
        _DrawerNavItem(label: 'Courses', icon: Icons.menu_book_outlined, route: '/courses'),
        _DrawerNavItem(label: 'Timetable', icon: Icons.calendar_view_week_outlined, route: '/timetable'),
        _DrawerNavItem(label: 'Academic Calendar', icon: Icons.event_note_outlined),
        _DrawerNavItem(label: 'Examinations', icon: Icons.fact_check_outlined),
        _DrawerNavItem(label: 'Attendance', icon: Icons.how_to_reg_outlined, route: '/attendance'),
        _DrawerNavItem(label: 'Course Materials', icon: Icons.folder_open_outlined),
      ],
    ),
    _DrawerSection(
      title: 'Campus',
      items: [
        _DrawerNavItem(label: 'Finance', icon: Icons.account_balance_wallet_outlined),
        _DrawerNavItem(label: 'Buy & Sell', icon: Icons.storefront_outlined),
        _DrawerNavItem(label: 'Campus Map', icon: Icons.map_outlined),
      ],
    ),
    _DrawerSection(
      title: 'System',
      items: [
        _DrawerNavItem(label: 'Settings', icon: Icons.settings_outlined, route: '/settings'),
        _DrawerNavItem(label: 'Help & Support', icon: Icons.help_outline, route: '/help-support'),
      ],
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    final currentIndex = _currentIndex(location);

    return Scaffold(
      key: _scaffoldKey,
      drawer: _FacultyDrawer(
        sections: _drawerSections,
        location: location,
        onSelect: (item) {
          Navigator.of(context).pop();
          if (item.route != null) {
            context.go(item.route!);
            return;
          }
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('${item.label} is coming soon'),
              behavior: SnackBarBehavior.floating,
            ),
          );
        },
      ),
      body: widget.child,
      bottomNavigationBar: _FacultyBottomNav(
        items: _bottomNavItems,
        currentIndex: currentIndex,
        onTap: (i) => context.go(_bottomNavItems[i].route),
      ),
    );
  }

  int _currentIndex(String location) {
    for (int i = 0; i < _bottomNavItems.length; i++) {
      if (location.startsWith(_bottomNavItems[i].route)) return i;
    }
    return 0;
  }
}

class _NavItem {
  final String label;
  final IconData icon;
  final String route;

  const _NavItem({required this.label, required this.icon, required this.route});
}

class _DrawerSection {
  final String title;
  final List<_DrawerNavItem> items;

  const _DrawerSection({required this.title, required this.items});
}

class _DrawerNavItem {
  final String label;
  final IconData icon;
  final String? route;

  const _DrawerNavItem({required this.label, required this.icon, this.route});
}

class _FacultyDrawer extends StatelessWidget {
  final List<_DrawerSection> sections;
  final String location;
  final ValueChanged<_DrawerNavItem> onSelect;

  const _FacultyDrawer({
    required this.sections,
    required this.location,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    return Drawer(
      width: MediaQuery.of(context).size.width * 0.82,
      backgroundColor: AppColors.bgDark,
      shape: const RoundedRectangleBorder(),
      child: SafeArea(
        child: Column(
          children: [
            Container(
              height: 72,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                border: Border(bottom: BorderSide(color: AppColors.borderDark)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      color: AppColors.gold.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.school_rounded, color: AppColors.gold, size: 22),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    'PEC Faculty',
                    style: AppTextStyles.bodyLarge.copyWith(
                      color: AppColors.textPrimary,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.fromLTRB(12, 14, 12, 12),
                itemCount: sections.length,
                itemBuilder: (_, sectionIndex) {
                  final section = sections[sectionIndex];
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Padding(
                          padding: const EdgeInsets.fromLTRB(2, 0, 2, 8),
                          child: Text(
                            section.title,
                            style: AppTextStyles.caption.copyWith(
                              color: AppColors.textMuted,
                              fontWeight: FontWeight.w700,
                              fontSize: 12,
                            ),
                          ),
                        ),
                        ...section.items.map((item) {
                          final isActive = item.route != null && location.startsWith(item.route!);
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 4),
                            child: Material(
                              color: isActive
                                  ? AppColors.gold.withValues(alpha: 0.16)
                                  : AppColors.transparent,
                              borderRadius: BorderRadius.circular(10),
                              child: InkWell(
                                borderRadius: BorderRadius.circular(10),
                                onTap: () => onSelect(item),
                                child: Padding(
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                                  child: Row(
                                    children: [
                                      Icon(
                                        item.icon,
                                        size: 20,
                                        color: isActive ? AppColors.gold : AppColors.textMuted,
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Text(
                                          item.label,
                                          style: AppTextStyles.bodyMedium.copyWith(
                                            color: isActive ? AppColors.gold : AppColors.textPrimary,
                                            fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                                          ),
                                        ),
                                      ),
                                      if (item.route == null)
                                        Text(
                                          'Soon',
                                          style: AppTextStyles.caption.copyWith(
                                            color: AppColors.textMuted,
                                            fontSize: 10,
                                          ),
                                        ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          );
                        }),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FacultyBottomNav extends StatelessWidget {
  final List<_NavItem> items;
  final int currentIndex;
  final ValueChanged<int> onTap;

  const _FacultyBottomNav({
    required this.items,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).padding.bottom;

    return Container(
      height: AppDimensions.bottomNavHeight + bottomInset + 4,
      decoration: BoxDecoration(
        color: AppColors.bgDark,
        border: Border(
          top: BorderSide(color: AppColors.borderDark, width: 1),
        ),
      ),
      child: Padding(
        padding: EdgeInsets.only(bottom: bottomInset),
        child: Row(
          children: List.generate(items.length, (i) {
            final item = items[i];
            final isActive = i == currentIndex;
            return Expanded(
              child: GestureDetector(
                onTap: () => onTap(i),
                behavior: HitTestBehavior.opaque,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      width: isActive ? 24 : 0,
                      height: 2,
                      margin: const EdgeInsets.only(bottom: 6),
                      decoration: BoxDecoration(
                        color: AppColors.gold,
                        borderRadius: BorderRadius.circular(1),
                      ),
                    ),
                    Icon(
                      item.icon,
                      color: isActive ? AppColors.gold : AppColors.textMuted,
                      size: isActive ? 24 : 22,
                    ),
                    const SizedBox(height: 3),
                    Text(
                      item.label,
                      style: AppTextStyles.caption.copyWith(
                        color: isActive ? AppColors.gold : AppColors.textMuted,
                        fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ),
            );
          }),
        ),
      ),
    );
  }
}
