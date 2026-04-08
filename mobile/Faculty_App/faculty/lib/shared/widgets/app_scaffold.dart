import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/constants/app_colors.dart';
import '../../core/constants/app_dimensions.dart';
import '../../core/constants/app_text_styles.dart';

class AppScaffold extends ConsumerWidget {
  final Widget child;
  const AppScaffold({super.key, required this.child});

  static const _navItems = [
    _NavItem(label: 'Home', icon: Icons.grid_view_rounded, route: '/dashboard'),
    _NavItem(label: 'Courses', icon: Icons.book_outlined, route: '/courses'),
    _NavItem(label: 'Chat', icon: Icons.chat_bubble_outline, route: '/chat'),
    _NavItem(label: 'Profile', icon: Icons.person_outline, route: '/profile'),
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final location = GoRouterState.of(context).matchedLocation;
    final currentIndex = _currentIndex(location);

    return Scaffold(
      body: child,
      bottomNavigationBar: _FacultyBottomNav(
        items: _navItems,
        currentIndex: currentIndex,
        onTap: (i) => context.go(_navItems[i].route),
      ),
    );
  }

  int _currentIndex(String location) {
    for (int i = 0; i < _navItems.length; i++) {
      if (location.startsWith(_navItems[i].route)) return i;
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
                    // Active indicator bar
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
