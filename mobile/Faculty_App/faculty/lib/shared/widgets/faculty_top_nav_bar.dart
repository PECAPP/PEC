import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';

class FacultyTopNavBar extends StatelessWidget implements PreferredSizeWidget {
  const FacultyTopNavBar({super.key});

  @override
  Size get preferredSize => const Size.fromHeight(72);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      automaticallyImplyLeading: false,
      toolbarHeight: 72,
      backgroundColor: AppColors.bgDark,
      surfaceTintColor: AppColors.bgDark,
      elevation: 0,
      shape: Border(
        bottom: BorderSide(color: AppColors.borderDark),
      ),
      titleSpacing: 8,
      title: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: AppColors.cardDark,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.borderDark),
            ),
            child: IconButton(
              onPressed: () => context.findRootAncestorStateOfType<ScaffoldState>()?.openDrawer(),
              icon: const Icon(Icons.menu_rounded, size: 20, color: AppColors.textPrimary),
            ),
          ),
          const SizedBox(width: 10),
          Container(
            width: 86,
            height: 42,
            decoration: BoxDecoration(
              color: AppColors.cardDark,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.borderDark),
            ),
            alignment: Alignment.center,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.school_rounded, color: AppColors.gold, size: 16),
                const SizedBox(width: 6),
                Text(
                  'FAC',
                  style: AppTextStyles.labelMedium.copyWith(
                    color: AppColors.gold,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.8,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Container(
              height: 42,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                color: AppColors.cardDark,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.borderDark),
              ),
              child: Row(
                children: [
                  const Icon(Icons.search_rounded, color: AppColors.textMuted, size: 20),
                  const SizedBox(width: 8),
                  Text(
                    'Search...',
                    style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textMuted),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
      actions: [
        Container(
          width: 42,
          height: 42,
          margin: const EdgeInsets.only(right: 8),
          decoration: BoxDecoration(
            color: AppColors.cardDark,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: AppColors.borderDark),
          ),
          child: Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.notifications_none_rounded, color: AppColors.textPrimary),
                onPressed: () => context.go('/notifications'),
              ),
              Positioned(
                top: 10,
                right: 10,
                child: Container(
                  width: 7,
                  height: 7,
                  decoration: const BoxDecoration(
                    color: AppColors.error,
                    shape: BoxShape.circle,
                  ),
                ),
              ),
            ],
          ),
        ),
        Container(
          width: 42,
          height: 42,
          margin: const EdgeInsets.only(right: 12),
          decoration: BoxDecoration(
            color: AppColors.gold,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: AppColors.goldDark.withValues(alpha: 0.6)),
          ),
          child: IconButton(
            icon: const Icon(Icons.person_outline_rounded, color: AppColors.bgDark),
            onPressed: () => context.go('/profile'),
          ),
        ),
      ],
    );
  }
}
