import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/faculty_badge.dart';
import '../../../../shared/widgets/faculty_card.dart';
import '../../../../shared/widgets/faculty_empty_state.dart';
import '../../../../shared/widgets/faculty_shimmer.dart';
import '../../../../shared/widgets/faculty_top_nav_bar.dart';
import '../../../faculty_dashboard/data/models/course_card_model.dart';
import '../../../faculty_dashboard/presentation/providers/dashboard_provider.dart';

class CoursesScreen extends ConsumerWidget {
  const CoursesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(dashboardProvider);
    final courses = state.courses;

    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: const FacultyTopNavBar(),
      body: state.loading
          ? FacultyShimmer(
              child: ListView(
                padding: const EdgeInsets.all(AppDimensions.md),
                children: List.generate(4, (_) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: ShimmerBox(height: 120),
                )),
              ),
            )
          : courses.isEmpty
              ? const FacultyEmptyState(
                  title: 'No courses assigned',
                  description: 'Your courses will appear here once assigned.',
                  icon: Icons.book_outlined,
                )
              : ListView.separated(
                  padding: const EdgeInsets.all(AppDimensions.md),
                  itemCount: courses.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 12),
                  itemBuilder: (_, i) => _CourseCard(course: courses[i]),
                ),
    );
  }
}

class _CourseCard extends StatelessWidget {
  final CourseCardModel course;
  const _CourseCard({required this.course});

  @override
  Widget build(BuildContext context) {
    return FacultyCard(
      onTap: () => context.go('/course-materials/${course.id}?name=${Uri.encodeComponent(course.name)}'),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              FacultyBadge(label: course.code, variant: BadgeVariant.primary),
              if (course.status != null)
                FacultyBadge(
                  label: course.status!,
                  variant: course.status == 'active' ? BadgeVariant.success : BadgeVariant.secondary,
                ),
            ],
          ),
          const SizedBox(height: AppDimensions.sm),
          Text(course.name, style: AppTextStyles.heading3),
          const SizedBox(height: 4),
          if (course.department != null)
            Text(course.department!, style: AppTextStyles.bodySmall),
          const SizedBox(height: AppDimensions.md),
          Row(
            children: [
              _InfoChip(icon: Icons.people_outline, label: '${course.students} students'),
              const SizedBox(width: 12),
              if (course.semester != null)
                _InfoChip(icon: Icons.calendar_today_outlined, label: 'Sem ${course.semester}'),
              const Spacer(),
              Icon(Icons.chevron_right, size: 18, color: AppColors.textMuted),
            ],
          ),
        ],
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  final IconData icon;
  final String label;
  const _InfoChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: AppColors.textMuted),
        const SizedBox(width: 4),
        Text(label, style: AppTextStyles.caption),
      ],
    );
  }
}
