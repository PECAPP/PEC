import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_dimensions.dart';
import '../../core/constants/app_text_styles.dart';

enum BadgeVariant { primary, secondary, success, warning, error, outline }

class FacultyBadge extends StatelessWidget {
  final String label;
  final BadgeVariant variant;
  final IconData? icon;

  const FacultyBadge({
    super.key,
    required this.label,
    this.variant = BadgeVariant.primary,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    final (bg, fg) = switch (variant) {
      BadgeVariant.primary => (AppColors.goldSubtle, AppColors.gold),
      BadgeVariant.secondary => (AppColors.surfaceDark, AppColors.textSecondary),
      BadgeVariant.success => (AppColors.successBg, AppColors.success),
      BadgeVariant.warning => (AppColors.warningBg, AppColors.warning),
      BadgeVariant.error => (AppColors.errorBg, AppColors.error),
      BadgeVariant.outline => (AppColors.transparent, AppColors.textSecondary),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(AppDimensions.borderRadiusFull),
        border: variant == BadgeVariant.outline
            ? Border.all(color: AppColors.borderDark)
            : null,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 10, color: fg),
            const SizedBox(width: 4),
          ],
          Text(
            label.toUpperCase(),
            style: AppTextStyles.labelSmall.copyWith(color: fg, fontSize: 10),
          ),
        ],
      ),
    );
  }
}
