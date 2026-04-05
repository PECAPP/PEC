import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/constants/app_colors.dart';
import '../../core/constants/app_dimensions.dart';
import '../../core/constants/app_text_styles.dart';
import '../../features/auth/domain/entities/user_entity.dart';
import '../../features/auth/presentation/providers/auth_provider.dart';

class AppScaffold extends ConsumerWidget {
  final Widget child;
  const AppScaffold({super.key, required this.child});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authNotifierProvider).user;
    final location = GoRouterState.of(context).matchedLocation;

    final navItems = _buildNavItems(user);
    final currentIndex = _currentIndex(location, navItems);

    return Scaffold(
      body: child,
      bottomNavigationBar: _PecBottomNav(
        items: navItems,
        currentIndex: currentIndex,
        onTap: (i) => context.go(navItems[i].route),
      ),
    );
  }

  List<_NavItem> _buildNavItems(UserEntity? user) {
    if (user == null) return _studentNav;
    if (user.isAdmin) return _adminNav;
    if (user.isFaculty) return _facultyNav;
    return _studentNav;
  }

  int _currentIndex(String location, List<_NavItem> items) {
    for (int i = 0; i < items.length; i++) {
      if (location.startsWith(items[i].route)) return i;
    }
    return 0;
  }

  static final _studentNav = [
    _NavItem(label: 'Home', icon: Icons.grid_view_rounded, activeIcon: Icons.grid_view_rounded, route: '/dashboard'),
    _NavItem(label: 'Chat', icon: Icons.chat_bubble_outline, activeIcon: Icons.chat_bubble_outline, route: '/chat'),
    _NavItem(label: 'Finance', icon: Icons.account_balance_wallet_outlined, activeIcon: Icons.account_balance_wallet, route: '/score-sheet'),
    _NavItem(label: 'Profile', icon: Icons.person_outline, activeIcon: Icons.person, route: '/profile'),
  ];

  static final _facultyNav = [
    _NavItem(label: 'Home', icon: Icons.home_outlined, activeIcon: Icons.home, route: '/dashboard'),
    _NavItem(label: 'Courses', icon: Icons.book_outlined, activeIcon: Icons.book, route: '/courses'),
    _NavItem(label: 'Chat', icon: Icons.chat_bubble_outline, activeIcon: Icons.chat_bubble, route: '/chat'),
    _NavItem(label: 'Profile', icon: Icons.person_outline, activeIcon: Icons.person, route: '/profile'),
  ];

  static final _adminNav = [
    _NavItem(label: 'Home', icon: Icons.home_outlined, activeIcon: Icons.home, route: '/dashboard'),
    _NavItem(label: 'Users', icon: Icons.people_outline, activeIcon: Icons.people, route: '/users'),
    _NavItem(label: 'Depts', icon: Icons.account_balance_outlined, activeIcon: Icons.account_balance, route: '/departments'),
    _NavItem(label: 'Chat', icon: Icons.chat_bubble_outline, activeIcon: Icons.chat_bubble, route: '/chat'),
    _NavItem(label: 'Profile', icon: Icons.person_outline, activeIcon: Icons.person, route: '/profile'),
  ];
}

class _NavItem {
  final String label;
  final IconData icon;
  final IconData activeIcon;
  final String route;
  const _NavItem({
    required this.label,
    required this.icon,
    required this.activeIcon,
    required this.route,
  });
}

class _PecBottomNav extends StatelessWidget {
  final List<_NavItem> items;
  final int currentIndex;
  final ValueChanged<int> onTap;

  const _PecBottomNav({
    required this.items,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).padding.bottom;

    return Container(
      margin: EdgeInsets.zero,
      height: AppDimensions.bottomNavHeight + bottomInset + 8,
      decoration: BoxDecoration(
        color: const Color(0xFF131313),
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            AppColors.yellow.withValues(alpha: 0.06),
            const Color(0xFF17150E),
            const Color(0xFF131313),
          ],
        ),
        border: Border(
          top: BorderSide(
            color: AppColors.yellow.withValues(alpha: 0.42),
            width: 1,
          ),
          left: BorderSide(color: Colors.white.withValues(alpha: 0.1), width: 0.7),
          right: BorderSide(color: Colors.white.withValues(alpha: 0.1), width: 0.7),
          bottom: BorderSide(color: Colors.white.withValues(alpha: 0.1), width: 0.7),
        ),
      ),
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
                  Icon(
                    isActive ? item.activeIcon : item.icon,
                    color: isActive
                        ? AppColors.yellow
                        : AppColors.white.withValues(alpha: 0.72),
                    size: isActive ? 25 : 24,
                  ),
                  const SizedBox(height: 3),
                  Text(
                    item.label,
                    style: AppTextStyles.labelSmall.copyWith(
                      color: isActive
                          ? AppColors.yellow
                          : AppColors.white.withValues(alpha: 0.82),
                      fontSize: 11,
                      fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                      letterSpacing: 0,
                    ),
                  ),
                ],
              ),
            ),
          );
        }),
      ),
    );
  }
}
