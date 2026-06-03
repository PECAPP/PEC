import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/faculty_badge.dart';
import '../../../../shared/widgets/faculty_card.dart';

class NoticeboardDashboardCard extends StatelessWidget {
  final List<Map<String, dynamic>> notices;
  final VoidCallback onViewAll;

  const NoticeboardDashboardCard({
    super.key,
    required this.notices,
    required this.onViewAll,
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
              Row(
                children: [
                  const Icon(Icons.notifications_outlined, size: 20, color: AppColors.gold),
                  const SizedBox(width: 8),
                  Text('Noticeboard', style: AppTextStyles.heading3),
                ],
              ),
              GestureDetector(
                onTap: onViewAll,
                child: Row(
                  children: [
                    Text('View All',
                        style: AppTextStyles.labelMedium.copyWith(color: AppColors.textMuted)),
                    const SizedBox(width: 4),
                    const Icon(Icons.arrow_outward, size: 14, color: AppColors.textMuted),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: AppDimensions.md),
          if (notices.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: AppDimensions.lg),
              child: Text('No notices yet', style: AppTextStyles.bodySmall),
            )
          else
            ...notices.take(4).map((n) => _NoticeRow(notice: n)),
        ],
      ),
    );
  }
}

class _NoticeRow extends StatelessWidget {
  final Map<String, dynamic> notice;
  const _NoticeRow({required this.notice});

  @override
  Widget build(BuildContext context) {
    final title = notice['title'] as String? ?? 'Notice';
    final content = notice['content'] as String? ?? '';
    final category = notice['category'] as String? ?? 'update';
    final pinned = notice['pinned'] as bool? ?? false;
    final important = notice['important'] as bool? ?? false;
    final publishedAt = notice['publishedAt'] as String?;

    String? dateStr;
    if (publishedAt != null) {
      try {
        dateStr = DateFormat('MMM d').format(DateTime.parse(publishedAt));
      } catch (_) {}
    }

    return Container(
      margin: const EdgeInsets.only(bottom: AppDimensions.sm),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.surfaceDark.withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(AppDimensions.borderRadiusMd),
        border: Border.all(color: AppColors.borderDark),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(title,
                    style: AppTextStyles.labelLarge,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis),
              ),
              if (dateStr != null)
                Text(dateStr,
                    style: AppTextStyles.caption.copyWith(fontSize: 10)),
            ],
          ),
          const SizedBox(height: 4),
          Wrap(
            spacing: 4,
            runSpacing: 4,
            children: [
              if (pinned) const FacultyBadge(label: 'Pinned', variant: BadgeVariant.secondary, icon: Icons.push_pin),
              if (important) const FacultyBadge(label: 'Important', variant: BadgeVariant.error),
              FacultyBadge(label: category, variant: BadgeVariant.outline),
            ],
          ),
          if (content.isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(content,
                style: AppTextStyles.caption,
                maxLines: 2,
                overflow: TextOverflow.ellipsis),
          ],
        ],
      ),
    );
  }
}
