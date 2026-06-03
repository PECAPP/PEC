import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/pec_card.dart';
import '../../../../shared/widgets/pec_empty_state.dart';
import '../../../../shared/widgets/pec_shimmer.dart';
import '../../data/models/course_model.dart';
import '../providers/courses_provider.dart';

class CourseListScreen extends ConsumerStatefulWidget {
  const CourseListScreen({super.key});

  @override
  ConsumerState<CourseListScreen> createState() => _CourseListScreenState();
}

class _CourseListScreenState extends ConsumerState<CourseListScreen> {
  String _search = '';
  bool _showEnrolledOnly = true;

  @override
  Widget build(BuildContext context) {
    final enrolledAsync = ref.watch(enrolledCoursesProvider);

    final title = _showEnrolledOnly ? 'SIGNED UP COURSES' : 'COURSES';

    return Scaffold(
      appBar: AppBar(
        title: Text(title),
        actions: [
          IconButton(
            onPressed: () {
              ref.invalidate(enrolledCoursesProvider);
              ref.invalidate(coursesProvider(const {'status': 'active'}));
            },
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: SafeArea(
        top: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(
                AppDimensions.md,
                AppDimensions.md,
                AppDimensions.md,
                AppDimensions.sm,
              ),
              child: TextField(
                onChanged: (v) => setState(() => _search = v.toLowerCase()),
                decoration: InputDecoration(
                  hintText: _showEnrolledOnly
                      ? 'search signed up courses'
                      : 'search courses',
                  hintStyle: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.white,
                  ),
                  prefixIcon: const Icon(Icons.search, size: 20),
                  border: const OutlineInputBorder(
                    borderSide: BorderSide(color: AppColors.black, width: 2),
                  ),
                  enabledBorder: const OutlineInputBorder(
                    borderSide: BorderSide(color: AppColors.black, width: 2),
                  ),
                  focusedBorder: const OutlineInputBorder(
                    borderSide: BorderSide(color: AppColors.yellow, width: 2),
                  ),
                  filled: true,
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 10,
                  ),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(
                AppDimensions.md,
                0,
                AppDimensions.md,
                AppDimensions.sm,
              ),
              child: _CoursesModeToggle(
                showEnrolledOnly: _showEnrolledOnly,
                onChanged: (enrolled) =>
                    setState(() => _showEnrolledOnly = enrolled),
              ),
            ),
            Expanded(
              child: _showEnrolledOnly
                  ? _EnrolledTab(search: _search)
                  : _AllCoursesTab(
                      search: _search,
                      enrolledAsync: enrolledAsync,
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CoursesModeToggle extends StatelessWidget {
  final bool showEnrolledOnly;
  final ValueChanged<bool> onChanged;

  const _CoursesModeToggle({
    required this.showEnrolledOnly,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _ToggleButton(
            title: 'SIGNED UP',
            active: showEnrolledOnly,
            onTap: () => onChanged(true),
          ),
        ),
        const SizedBox(width: AppDimensions.xs),
        Expanded(
          child: _ToggleButton(
            title: 'ALL COURSES',
            active: !showEnrolledOnly,
            onTap: () => onChanged(false),
          ),
        ),
      ],
    );
  }
}

class _ToggleButton extends StatelessWidget {
  final String title;
  final bool active;
  final VoidCallback onTap;

  const _ToggleButton({
    required this.title,
    required this.active,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        height: 34,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: active ? AppColors.yellow : AppColors.bgSurfaceDark,
          border: Border.all(
            color: active
                ? AppColors.yellow
                : AppColors.borderLight.withValues(alpha: 0.2),
          ),
        ),
        child: Text(
          title,
          style: AppTextStyles.labelSmall.copyWith(
            color: active ? AppColors.black : AppColors.white,
            letterSpacing: 0.2,
          ),
        ),
      ),
    );
  }
}

class _EnrolledTab extends ConsumerWidget {
  final String search;
  const _EnrolledTab({required this.search});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final enrolledAsync = ref.watch(enrolledCoursesProvider);
    return enrolledAsync.when(
      loading: () => ListView.separated(
        padding: const EdgeInsets.all(AppDimensions.md),
        itemCount: 5,
        separatorBuilder: (_, __) => const SizedBox(height: AppDimensions.sm),
        itemBuilder: (_, __) =>
            const PecShimmerBox(height: 80, width: double.infinity),
      ),
      error: (e, _) => _LoadState(
        message: 'Signed-up courses are currently unavailable.',
        onRetry: () => ref.invalidate(enrolledCoursesProvider),
      ),
      data: (enrollments) {
        final filtered = enrollments.where((e) {
          return search.isEmpty ||
              e.courseName.toLowerCase().contains(search) ||
              e.courseCode.toLowerCase().contains(search);
        }).toList();

        if (filtered.isEmpty) {
          return const PecEmptyState(
            icon: Icons.school_outlined,
            title: 'No enrolled courses',
            subtitle: 'Courses you are signed up for will appear here',
          );
        }

        return ListView.separated(
          padding: const EdgeInsets.fromLTRB(
            AppDimensions.md,
            0,
            AppDimensions.md,
            AppDimensions.md,
          ),
          itemCount: filtered.length,
          separatorBuilder: (_, __) => const SizedBox(height: AppDimensions.sm),
          itemBuilder: (_, i) => _EnrollmentCard(enrollment: filtered[i]),
        );
      },
    );
  }
}

class _AllCoursesTab extends ConsumerWidget {
  final String search;
  final AsyncValue<List<EnrollmentModel>> enrolledAsync;

  const _AllCoursesTab({
    required this.search,
    required this.enrolledAsync,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final coursesAsync = ref.watch(coursesProvider(const {'status': 'active'}));

    final enrolledIds = enrolledAsync.maybeWhen(
      data: (enrollments) => enrollments.map((e) => e.courseId).toSet(),
      orElse: () => <String>{},
    );

    return coursesAsync.when(
      loading: () => ListView.separated(
        padding: const EdgeInsets.all(AppDimensions.md),
        itemCount: 5,
        separatorBuilder: (_, __) => const SizedBox(height: AppDimensions.sm),
        itemBuilder: (_, __) =>
            const PecShimmerBox(height: 80, width: double.infinity),
      ),
      error: (e, _) => _LoadState(
        message: 'Course catalog is currently unavailable.',
        onRetry: () =>
            ref.invalidate(coursesProvider(const {'status': 'active'})),
      ),
      data: (courses) {
        final filtered = courses.where((c) {
          return search.isEmpty ||
              c.name.toLowerCase().contains(search) ||
              c.code.toLowerCase().contains(search) ||
              c.department.toLowerCase().contains(search);
        }).toList();

        if (filtered.isEmpty) {
          return const PecEmptyState(
            icon: Icons.book_outlined,
            title: 'No courses found',
          );
        }

        return ListView.separated(
          padding: const EdgeInsets.fromLTRB(
            AppDimensions.md,
            0,
            AppDimensions.md,
            AppDimensions.md,
          ),
          itemCount: filtered.length,
          separatorBuilder: (_, __) => const SizedBox(height: AppDimensions.sm),
          itemBuilder: (_, i) => _CourseCard(
            course: filtered[i],
            isEnrolled: enrolledIds.contains(filtered[i].id),
          ),
        );
      },
    );
  }
}

class _LoadState extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const _LoadState({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            message,
            style: AppTextStyles.bodySmall
                .copyWith(color: AppColors.textSecondary),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppDimensions.sm),
          SizedBox(
            width: 140,
            child: FilledButton(
              onPressed: onRetry,
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.yellow,
                foregroundColor: AppColors.black,
              ),
              child: const Text('Retry'),
            ),
          ),
        ],
      ),
    );
  }
}

class _EnrollmentCard extends StatelessWidget {
  final EnrollmentModel enrollment;

  const _EnrollmentCard({required this.enrollment});

  @override
  Widget build(BuildContext context) {
    return PecCard(
      onTap: () => context.push('/courses/${enrollment.courseId}'),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            color: AppColors.blue,
            child: Center(
              child: Text(
                enrollment.courseCode.length > 4
                    ? enrollment.courseCode.substring(0, 4)
                    : enrollment.courseCode,
                style: AppTextStyles.labelSmall
                    .copyWith(color: AppColors.white, fontSize: 9),
                textAlign: TextAlign.center,
              ),
            ),
          ),
          const SizedBox(width: AppDimensions.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  enrollment.courseName,
                  style: AppTextStyles.labelLarge,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  '${enrollment.courseCode}${enrollment.semester != null ? ' · Sem ${enrollment.semester}' : ''}',
                  style: AppTextStyles.caption,
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            color: enrollment.status == 'active'
                ? AppColors.green
                : AppColors.textSecondary,
            child: Text(
              enrollment.status.toUpperCase(),
              style: AppTextStyles.labelSmall
                  .copyWith(color: AppColors.black, fontSize: 8),
            ),
          ),
          const SizedBox(width: AppDimensions.xs),
          const Icon(Icons.chevron_right,
              size: 20, color: AppColors.textSecondary),
        ],
      ),
    );
  }
}

class _CourseCard extends StatelessWidget {
  final CourseModel course;
  final bool isEnrolled;

  const _CourseCard({required this.course, required this.isEnrolled});

  @override
  Widget build(BuildContext context) {
    return PecCard(
      onTap: () => context.push('/courses/${course.id}'),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            color: AppColors.yellow,
            child: Center(
              child: Text(
                course.code.length > 4
                    ? course.code.substring(0, 4)
                    : course.code,
                style: AppTextStyles.labelSmall
                    .copyWith(color: AppColors.black, fontSize: 9),
                textAlign: TextAlign.center,
              ),
            ),
          ),
          const SizedBox(width: AppDimensions.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  course.name,
                  style: AppTextStyles.labelLarge,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  '${course.code} · ${course.credits}cr · ${course.department}',
                  style: AppTextStyles.caption,
                ),
                if (course.instructor != null)
                  Text(
                    course.instructor!,
                    style: AppTextStyles.caption
                        .copyWith(color: AppColors.textSecondary),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              if (isEnrolled)
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  color: AppColors.green,
                  child: Text(
                    'ENROLLED',
                    style: AppTextStyles.labelSmall
                        .copyWith(color: AppColors.black, fontSize: 8),
                  ),
                ),
              if (isEnrolled) const SizedBox(height: 2),
              Text(
                '${course.enrollmentCount}/${course.capacity}',
                style: AppTextStyles.labelSmall.copyWith(fontSize: 10),
              ),
              const SizedBox(height: 2),
              const Icon(Icons.chevron_right,
                  size: 20, color: AppColors.textSecondary),
            ],
          ),
        ],
      ),
    );
  }
}
