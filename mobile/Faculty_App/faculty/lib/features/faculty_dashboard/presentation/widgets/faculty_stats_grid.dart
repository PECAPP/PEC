import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/faculty_card.dart';
import '../../data/models/faculty_stats_model.dart';

class FacultyStatsGrid extends StatelessWidget {
  final FacultyStats stats;
  const FacultyStatsGrid({super.key, required this.stats});

  @override
  Widget build(BuildContext context) {
    const gap = AppDimensions.sm + 4.0;
    return LayoutBuilder(
      builder: (context, constraints) {
        final cardWidth = (constraints.maxWidth - gap) / 2;
        final tiles = [
          _StatTile(
            icon: Icons.book_outlined,
            iconColor: AppColors.gold,
            label: 'Active Courses',
            value: '${stats.activeCount}',
            sub: 'This semester',
          ),
          _StatTile(
            icon: Icons.people_outline,
            iconColor: AppColors.info,
            label: 'Total Students',
            value: '${stats.studentCount}',
            sub: 'Across all courses',
          ),
          _StatTile(
            icon: Icons.check_circle_outline,
            iconColor: AppColors.success,
            label: 'Avg Attendance',
            value: '${stats.avgAttendance}%',
            sub: 'This month',
          ),
          _StatTile(
            icon: Icons.description_outlined,
            iconColor: AppColors.warning,
            label: 'Pending Reviews',
            value: '${stats.pendingReviews}',
            sub: 'Assignments to grade',
          ),
        ];
        return Column(
          children: [
            Row(
              children: [
                SizedBox(width: cardWidth, child: tiles[0]),
                const SizedBox(width: gap),
                SizedBox(width: cardWidth, child: tiles[1]),
              ],
            ),
            const SizedBox(height: gap),
            Row(
              children: [
                SizedBox(width: cardWidth, child: tiles[2]),
                const SizedBox(width: gap),
                SizedBox(width: cardWidth, child: tiles[3]),
              ],
            ),
          ],
        );
      },
    );
  }
}

class _StatTile extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String label;
  final String value;
  final String sub;

  const _StatTile({
    required this.icon,
    required this.iconColor,
    required this.label,
    required this.value,
    required this.sub,
  });

  @override
  Widget build(BuildContext context) {
    return FacultyCard(
      padding: const EdgeInsets.all(AppDimensions.md - 2),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: iconColor.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(AppDimensions.borderRadiusMd),
            ),
            child: Icon(icon, color: iconColor, size: 18),
          ),
          const SizedBox(height: 8),
          Text(value, style: AppTextStyles.heading2),
          const SizedBox(height: 2),
          Text(label, style: AppTextStyles.bodySmall),
          Text(sub, style: AppTextStyles.caption),
        ],
      ),
    );
  }
}
