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

class _CourseListScreenState extends ConsumerState<CourseListScreen>
    {
  String _search = '';
  String? _selectedModule;

  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(
              AppDimensions.md,
              AppDimensions.md,
              AppDimensions.md,
              AppDimensions.sm,
            ),
            child: Text(
              'Explore',
              style: AppTextStyles.heading2.copyWith(
                color: AppColors.white,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(AppDimensions.md),
            child: TextField(
              onChanged: (v) => setState(() => _search = v.toLowerCase()),
              decoration: InputDecoration(
                hintText: 'search modules',
                hintStyle: AppTextStyles.bodySmall.copyWith(
                  color: AppColors.white,
                ),
                prefixIcon: const Icon(Icons.search, size: 20),
                border: const OutlineInputBorder(
                    borderSide: BorderSide(color: AppColors.black, width: 2)),
                enabledBorder: const OutlineInputBorder(
                    borderSide: BorderSide(color: AppColors.black, width: 2)),
                focusedBorder: const OutlineInputBorder(
                    borderSide: BorderSide(color: AppColors.yellow, width: 2)),
                filled: true,
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(
              AppDimensions.md,
              0,
              AppDimensions.md,
              AppDimensions.md,
            ),
            child: _ModuleWidgetsRow(
              selectedModule: _selectedModule,
              onSelect: (module) {
                setState(() {
                  _selectedModule = _selectedModule == module ? null : module;
                });
              },
            ),
          ),
          if (_selectedModule == 'Core')
            Padding(
              padding: EdgeInsets.fromLTRB(
                AppDimensions.md,
                0,
                AppDimensions.md,
                AppDimensions.md,
              ),
              child: _CoreExpandedWidgets(),
            ),
          if (_selectedModule == 'Academics')
            Padding(
              padding: EdgeInsets.fromLTRB(
                AppDimensions.md,
                0,
                AppDimensions.md,
                AppDimensions.md,
              ),
              child: _AcademicsExpandedWidgets(),
            ),
          if (_selectedModule == 'Campus')
            Padding(
              padding: EdgeInsets.fromLTRB(
                AppDimensions.md,
                0,
                AppDimensions.md,
                AppDimensions.md,
              ),
              child: _CampusExpandedWidgets(),
            ),
          Expanded(
            child: _AllCoursesTab(search: _search),
          ),
        ],
      ),
    );
  }
}

// ── Enrolled tab ─────────────────────────────────────────────────────────────
class _EnrolledTab extends ConsumerWidget {
  final String search;
  const _EnrolledTab({required this.search});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final enrolledAsync = ref.watch(enrolledCoursesProvider);
    return enrolledAsync.when(
      loading: () => _shimmer(),
      error: (e, _) => const _ModuleDataUnavailable(),
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
            subtitle: 'Courses you are enrolled in will appear here',
          );
        }
        return ListView.separated(
          padding: const EdgeInsets.fromLTRB(
              AppDimensions.md, 0, AppDimensions.md, AppDimensions.md),
          itemCount: filtered.length,
          separatorBuilder: (_, __) => const SizedBox(height: AppDimensions.sm),
          itemBuilder: (_, i) => _EnrollmentCard(enrollment: filtered[i]),
        );
      },
    );
  }

  Widget _shimmer() => ListView.separated(
        padding: const EdgeInsets.all(AppDimensions.md),
        itemCount: 5,
        separatorBuilder: (_, __) => const SizedBox(height: AppDimensions.sm),
        itemBuilder: (_, __) =>
            const PecShimmerBox(height: 80, width: double.infinity),
      );
}

// ── All courses tab ───────────────────────────────────────────────────────────
class _AllCoursesTab extends ConsumerWidget {
  final String search;
  const _AllCoursesTab({required this.search});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final coursesAsync =
        ref.watch(coursesProvider(const {'status': 'active'}));
    return coursesAsync.when(
      loading: () => ListView.separated(
        padding: const EdgeInsets.all(AppDimensions.md),
        itemCount: 5,
        separatorBuilder: (_, __) => const SizedBox(height: AppDimensions.sm),
        itemBuilder: (_, __) =>
            const PecShimmerBox(height: 80, width: double.infinity),
      ),
        error: (e, _) => const _ModuleDataUnavailable(),
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
              AppDimensions.md, 0, AppDimensions.md, AppDimensions.md),
          itemCount: filtered.length,
          separatorBuilder: (_, __) => const SizedBox(height: AppDimensions.sm),
          itemBuilder: (_, i) => _CourseCard(course: filtered[i]),
        );
      },
    );
  }
}

class _ModuleWidgetsRow extends StatelessWidget {
  final String? selectedModule;
  final ValueChanged<String> onSelect;

  const _ModuleWidgetsRow({
    required this.selectedModule,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _ModuleWidget(
            label: 'Core',
            icon: Icons.category_outlined,
            selected: selectedModule == 'Core',
            onTap: () => onSelect('Core'),
          ),
        ),
        const SizedBox(width: AppDimensions.sm),
        Expanded(
          child: _ModuleWidget(
            label: 'Academics',
            icon: Icons.school_outlined,
            selected: selectedModule == 'Academics',
            onTap: () => onSelect('Academics'),
          ),
        ),
        const SizedBox(width: AppDimensions.sm),
        Expanded(
          child: _ModuleWidget(
            label: 'Campus',
            icon: Icons.apartment_outlined,
            selected: selectedModule == 'Campus',
            onTap: () => onSelect('Campus'),
          ),
        ),
      ],
    );
  }
}

class _ModuleWidget extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;

  const _ModuleWidget({
    required this.label,
    required this.icon,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        height: 72,
        decoration: BoxDecoration(
          color: selected ? AppColors.yellow.withValues(alpha: 0.2) : AppColors.bgSurfaceDark,
          border: Border.all(
            color: selected
                ? AppColors.yellow.withValues(alpha: 0.9)
                : AppColors.borderLight.withValues(alpha: 0.2),
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 20, color: AppColors.yellow),
            const SizedBox(height: 6),
            Text(
              label,
              style: AppTextStyles.labelSmall.copyWith(
                color: AppColors.white,
                fontSize: 10,
                letterSpacing: 0.2,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CoreExpandedWidgets extends StatelessWidget {
  const _CoreExpandedWidgets();

  @override
  Widget build(BuildContext context) {
    const items = [
      ('Chat', Icons.chat_bubble_outline, '/chat'),
      ('Clubs', Icons.groups_outlined, '/clubs'),
      ('Announcements', Icons.campaign_outlined, '/noticeboard'),
      ('Finance', Icons.account_balance_wallet_outlined, '/score-sheet'),
    ];

    return Wrap(
      spacing: AppDimensions.sm,
      runSpacing: AppDimensions.sm,
      children: items
          .map(
            (item) => Container(
              width: (MediaQuery.of(context).size.width - (AppDimensions.md * 2) - AppDimensions.sm) / 2,
              height: 56,
              decoration: BoxDecoration(
                color: AppColors.bgSurfaceDark,
                border: Border.all(color: AppColors.borderLight.withValues(alpha: 0.2)),
              ),
              child: InkWell(
                onTap: () => context.push(item.$3),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: AppDimensions.md),
                  child: Row(
                    children: [
                      Icon(item.$2, size: 18, color: AppColors.yellow),
                      const SizedBox(width: AppDimensions.sm),
                      Expanded(
                        child: Text(
                          item.$1,
                          style: AppTextStyles.labelLarge.copyWith(color: AppColors.white),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          )
          .toList(),
    );
  }
}

class _AcademicsExpandedWidgets extends StatelessWidget {
  const _AcademicsExpandedWidgets();

  @override
  Widget build(BuildContext context) {
    const items = [
      ('Courses', Icons.book_outlined, '/courses'),
      ('TimeTable', Icons.schedule_outlined, '/timetable'),
      ('Academic Calendar', Icons.calendar_month_outlined, '/calendar'),
      ('Examinations', Icons.fact_check_outlined, '/examinations'),
      ('Attendance', Icons.how_to_reg_outlined, '/attendance'),
      ('Score Sheet', Icons.bar_chart_outlined, '/score-sheet'),
      ('Course Materials', Icons.menu_book_outlined, '/course-materials'),
      ('Resume Builder', Icons.description_outlined, '/resume'),
    ];

    return Wrap(
      spacing: AppDimensions.sm,
      runSpacing: AppDimensions.sm,
      children: items
          .map(
            (item) => Container(
              width: (MediaQuery.of(context).size.width -
                      (AppDimensions.md * 2) -
                      AppDimensions.sm) /
                  2,
              height: 56,
              decoration: BoxDecoration(
                color: AppColors.bgSurfaceDark,
                border: Border.all(
                    color: AppColors.borderLight.withValues(alpha: 0.2)),
              ),
              child: InkWell(
                onTap: () => context.go(item.$3),
                child: Padding(
                  padding:
                      const EdgeInsets.symmetric(horizontal: AppDimensions.md),
                  child: Row(
                    children: [
                      Icon(item.$2, size: 18, color: AppColors.yellow),
                      const SizedBox(width: AppDimensions.sm),
                      Expanded(
                        child: Text(
                          item.$1,
                          style: AppTextStyles.labelLarge
                              .copyWith(color: AppColors.white),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          )
          .toList(),
    );
  }
}

class _CampusExpandedWidgets extends StatelessWidget {
  const _CampusExpandedWidgets();

  @override
  Widget build(BuildContext context) {
    const items = [
      ('Finance', Icons.account_balance_wallet_outlined, '/score-sheet'),
      ('Buy and Sell', Icons.storefront_outlined, '/buy-sell'),
      ('Hostel Issues', Icons.report_problem_outlined, '/hostel-issues'),
      ('Night Canteen', Icons.nightlife_outlined, '/canteen'),
      ('Campus Map', Icons.map_outlined, '/campus-map'),
    ];

    return Wrap(
      spacing: AppDimensions.sm,
      runSpacing: AppDimensions.sm,
      children: items
          .map(
            (item) => Container(
              width: (MediaQuery.of(context).size.width -
                      (AppDimensions.md * 2) -
                      AppDimensions.sm) /
                  2,
              height: 56,
              decoration: BoxDecoration(
                color: AppColors.bgSurfaceDark,
                border: Border.all(
                    color: AppColors.borderLight.withValues(alpha: 0.2)),
              ),
              child: InkWell(
                onTap: () => context.go(item.$3),
                child: Padding(
                  padding:
                      const EdgeInsets.symmetric(horizontal: AppDimensions.md),
                  child: Row(
                    children: [
                      Icon(item.$2, size: 18, color: AppColors.yellow),
                      const SizedBox(width: AppDimensions.sm),
                      Expanded(
                        child: Text(
                          item.$1,
                          style: AppTextStyles.labelLarge
                              .copyWith(color: AppColors.white),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          )
          .toList(),
    );
  }
}

class _ModuleDataUnavailable extends StatelessWidget {
  const _ModuleDataUnavailable();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Text(
        'Modules are currently unavailable.',
        style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary),
      ),
    );
  }
}

// ── Enrollment card ───────────────────────────────────────────────────────────
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
                Text(enrollment.courseName,
                    style: AppTextStyles.labelLarge,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis),
                Text(
                  '${enrollment.courseCode}${enrollment.semester != null ? ' · Sem ${enrollment.semester}' : ''}',
                  style: AppTextStyles.caption,
                ),
              ],
            ),
          ),
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
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
          const Icon(Icons.chevron_right, size: 20,
              color: AppColors.textSecondary),
        ],
      ),
    );
  }
}

// ── Course card ───────────────────────────────────────────────────────────────
class _CourseCard extends StatelessWidget {
  final CourseModel course;
  const _CourseCard({required this.course});

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
                Text(course.name,
                    style: AppTextStyles.labelLarge,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis),
                Text(
                  '${course.code} · ${course.credits}cr · ${course.department}',
                  style: AppTextStyles.caption,
                ),
                if (course.instructor != null)
                  Text(course.instructor!,
                      style: AppTextStyles.caption
                          .copyWith(color: AppColors.textSecondary),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
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
