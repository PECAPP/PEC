import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';

class LowAttendanceAlert extends StatelessWidget {
  final int count;
  final VoidCallback onViewStudents;

  const LowAttendanceAlert({
    super.key,
    required this.count,
    required this.onViewStudents,
  });

  @override
  Widget build(BuildContext context) {
    if (count <= 0) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.all(AppDimensions.md),
      decoration: BoxDecoration(
        color: AppColors.warningBg,
        borderRadius: BorderRadius.circular(AppDimensions.borderRadiusLg),
        border: Border.all(color: AppColors.warning.withValues(alpha: 0.2)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.warning_amber_rounded, color: AppColors.warning, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Low Attendance Alert', style: AppTextStyles.labelLarge),
                const SizedBox(height: 4),
                Text(
                  '$count students are below 75% attendance threshold',
                  style: AppTextStyles.bodySmall,
                ),
                const SizedBox(height: 8),
                GestureDetector(
                  onTap: onViewStudents,
                  child: Text(
                    'View Students',
                    style: AppTextStyles.labelMedium.copyWith(color: AppColors.gold),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
