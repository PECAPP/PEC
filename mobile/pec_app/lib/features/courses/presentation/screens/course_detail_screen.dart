import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/pec_card.dart';
import '../../../../shared/widgets/pec_error_state.dart';
import '../../../../shared/widgets/pec_shimmer.dart';
import '../providers/courses_provider.dart';

class CourseDetailScreen extends ConsumerWidget {
  final String courseId;
  const CourseDetailScreen({super.key, required this.courseId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final courseAsync = ref.watch(courseDetailProvider(courseId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('COURSE DETAIL'),
        actions: [
          IconButton(
            icon: const Icon(Icons.folder_open_outlined),
            onPressed: () => context.push('/materials?courseId=$courseId'),
            tooltip: 'Materials',
          ),
        ],
      ),
      body: courseAsync.when(
        loading: () => _Shimmer(),
        error: (e, _) => PecErrorState(
          message: e.toString(),
          onRetry: () => ref.invalidate(courseDetailProvider(courseId)),
        ),
        data: (course) => SingleChildScrollView(
          padding: const EdgeInsets.all(AppDimensions.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Hero
              PecCard(
                color: AppColors.yellow,
                child: Row(
                  children: [
                    Container(
                      width: 64,
                      height: 64,
                      color: AppColors.black,
                      child: Center(
                        child: Text(
                          course.code.length > 5
                              ? course.code.substring(0, 5)
                              : course.code,
                          style: AppTextStyles.labelLarge
                              .copyWith(color: AppColors.yellow, fontSize: 11),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                    const SizedBox(width: AppDimensions.md),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(course.name,
                              style: AppTextStyles.heading2
                                  .copyWith(color: AppColors.black),
                              maxLines: 2),
                          const SizedBox(height: 4),
                          Text(course.code,
                              style: AppTextStyles.labelSmall
                                  .copyWith(color: AppColors.black)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppDimensions.md),

              // Info grid
              Row(
                children: [
                  Expanded(
                      child: _InfoTile(label: 'CREDITS',
                          value: '${course.credits}')),
                  const SizedBox(width: AppDimensions.sm),
                  Expanded(
                      child: _InfoTile(
                          label: 'SEMESTER',
                          value: course.semester != null
                              ? 'Sem ${course.semester}'
                              : 'N/A')),
                ],
              ),
              const SizedBox(height: AppDimensions.sm),
              Row(
                children: [
                  Expanded(
                      child: _InfoTile(
                          label: 'DEPARTMENT', value: course.department)),
                  const SizedBox(width: AppDimensions.sm),
                  Expanded(
                      child: _InfoTile(
                          label: 'ENROLLED',
                          value:
                              '${course.enrollmentCount}/${course.capacity}')),
                ],
              ),
              if (course.instructor != null) ...[
                const SizedBox(height: AppDimensions.sm),
                _InfoTile(
                    label: 'INSTRUCTOR', value: course.instructor!),
              ],
              const SizedBox(height: AppDimensions.md),

              // Status badge
              Row(
                children: [
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    color: course.status == 'active'
                        ? AppColors.green
                        : AppColors.textSecondary,
                    child: Text(
                      course.status.toUpperCase(),
                      style: AppTextStyles.labelSmall
                          .copyWith(color: AppColors.black),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppDimensions.lg),

              // Quick links
              _SectionHeader(title: 'QUICK LINKS'),
              const SizedBox(height: AppDimensions.sm),
              _QuickLink(
                icon: Icons.folder_open_outlined,
                label: 'Course Materials',
                color: AppColors.blue,
                onTap: () => context.push('/materials?courseId=$courseId'),
              ),
              const SizedBox(height: AppDimensions.sm),
              _QuickLink(
                icon: Icons.checklist_outlined,
                label: 'Attendance',
                color: AppColors.green,
                onTap: () => context.push('/attendance'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _InfoTile extends StatelessWidget {
  final String label, value;
  const _InfoTile({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return PecCard(
      color: AppColors.bgSurface,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label,
              style:
                  AppTextStyles.caption.copyWith(color: AppColors.textSecondary)),
          const SizedBox(height: 2),
          Text(value, style: AppTextStyles.labelLarge),
        ],
      ),
    );
  }
}

class _QuickLink extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;
  const _QuickLink(
      {required this.icon,
      required this.label,
      required this.color,
      required this.onTap});

  @override
  Widget build(BuildContext context) {
    return PecCard(
      onTap: onTap,
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            color: color,
            child: Icon(icon, color: AppColors.black, size: 20),
          ),
          const SizedBox(width: AppDimensions.md),
          Expanded(child: Text(label, style: AppTextStyles.labelLarge)),
          const Icon(Icons.chevron_right,
              size: 20, color: AppColors.textSecondary),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(width: 4, height: 20, color: AppColors.yellow),
        const SizedBox(width: AppDimensions.sm),
        Text(title, style: AppTextStyles.labelLarge),
      ],
    );
  }
}

class _Shimmer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppDimensions.md),
      child: Column(
        children: [
          const PecShimmerBox(height: 100, width: double.infinity),
          const SizedBox(height: AppDimensions.md),
          Row(children: const [
            Expanded(child: PecShimmerBox(height: 60, width: double.infinity)),
            SizedBox(width: AppDimensions.sm),
            Expanded(child: PecShimmerBox(height: 60, width: double.infinity)),
          ]),
        ],
      ),
    );
  }
}
