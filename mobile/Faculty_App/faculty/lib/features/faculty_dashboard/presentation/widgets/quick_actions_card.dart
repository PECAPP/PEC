import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/faculty_card.dart';

class QuickActionsCard extends StatelessWidget {
  final ValueChanged<String> onAction;
  const QuickActionsCard({super.key, required this.onAction});

  @override
  Widget build(BuildContext context) {
    return FacultyCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Quick Actions', style: AppTextStyles.heading3),
          const SizedBox(height: AppDimensions.md),
          _ActionRow(
            icon: Icons.check_circle_outline,
            label: 'Mark Attendance',
            onTap: () => onAction('/attendance'),
          ),
          _ActionRow(
            icon: Icons.upload_file_outlined,
            label: 'Course Materials',
            onTap: () => onAction('/courses'),
          ),
          _ActionRow(
            icon: Icons.campaign_outlined,
            label: 'Post Notice',
            onTap: () => onAction('/noticeboard'),
          ),
          _ActionRow(
            icon: Icons.calendar_today_outlined,
            label: 'View Timetable',
            onTap: () => onAction('/timetable'),
          ),
          _ActionRow(
            icon: Icons.chat_outlined,
            label: 'Messages',
            onTap: () => onAction('/chat'),
          ),
        ],
      ),
    );
  }
}

class _ActionRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _ActionRow({required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Container(
        margin: const EdgeInsets.only(bottom: 6),
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(AppDimensions.borderRadiusMd),
          border: Border.all(color: AppColors.borderDark),
        ),
        child: Row(
          children: [
            Icon(icon, size: 18, color: AppColors.gold),
            const SizedBox(width: 12),
            Expanded(child: Text(label, style: AppTextStyles.labelLarge)),
            const Icon(Icons.chevron_right, size: 18, color: AppColors.textMuted),
          ],
        ),
      ),
    );
  }
}
