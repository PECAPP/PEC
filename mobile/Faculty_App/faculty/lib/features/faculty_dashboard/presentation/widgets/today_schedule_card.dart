import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/faculty_card.dart';
import '../../data/models/schedule_entry_model.dart';

class TodayScheduleCard extends StatelessWidget {
  final List<ScheduleEntry> schedule;
  final VoidCallback onViewFull;

  const TodayScheduleCard({
    super.key,
    required this.schedule,
    required this.onViewFull,
  });

  @override
  Widget build(BuildContext context) {
    return FacultyCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text("Today's Schedule", style: AppTextStyles.heading3),
              GestureDetector(
                onTap: onViewFull,
                child: Row(
                  children: [
                    Text('Full Timetable',
                        style: AppTextStyles.labelMedium.copyWith(color: AppColors.textMuted)),
                    const SizedBox(width: 4),
                    const Icon(Icons.arrow_outward, size: 14, color: AppColors.textMuted),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: AppDimensions.md),
          if (schedule.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: AppDimensions.lg),
              child: Text('No classes scheduled for today.',
                  style: AppTextStyles.bodySmall),
            )
          else
            ...schedule.map((s) => _ScheduleRow(entry: s)),
        ],
      ),
    );
  }
}

class _ScheduleRow extends StatelessWidget {
  final ScheduleEntry entry;
  const _ScheduleRow({required this.entry});

  @override
  Widget build(BuildContext context) {
    final (bg, borderColor) = switch (entry.status) {
      ScheduleStatus.completed => (AppColors.surfaceDark, AppColors.borderDark),
      ScheduleStatus.ongoing => (AppColors.goldSubtle, AppColors.gold.withValues(alpha: 0.3)),
      ScheduleStatus.upcoming => (AppColors.surfaceDark, AppColors.borderDark),
    };

    return Container(
      margin: const EdgeInsets.only(bottom: AppDimensions.sm),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(AppDimensions.borderRadiusMd),
        border: Border.all(color: borderColor),
      ),
      child: Row(
        children: [
          // Time
          SizedBox(
            width: 100,
            child: Row(
              children: [
                const Icon(Icons.access_time, size: 14, color: AppColors.textMuted),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(entry.time,
                      style: AppTextStyles.labelMedium, overflow: TextOverflow.ellipsis),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          // Details
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(entry.course,
                    style: AppTextStyles.labelLarge, overflow: TextOverflow.ellipsis),
                Text(
                  '${entry.section} · ${entry.room} · ${entry.students} students',
                  style: AppTextStyles.caption,
                ),
              ],
            ),
          ),
          // Status
          if (entry.status == ScheduleStatus.completed)
            const Icon(Icons.check_circle, size: 16, color: AppColors.success),
          if (entry.status == ScheduleStatus.ongoing)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: AppColors.gold,
                borderRadius: BorderRadius.circular(AppDimensions.borderRadiusFull),
              ),
              child: Text('Live',
                  style: AppTextStyles.labelSmall.copyWith(color: AppColors.bgDark, fontSize: 10)),
            ),
        ],
      ),
    );
  }
}
