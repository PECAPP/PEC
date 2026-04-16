import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/faculty_error_state.dart';
import '../../../../shared/widgets/faculty_shimmer.dart';
import '../../../../shared/widgets/faculty_top_nav_bar.dart';
import '../providers/dashboard_provider.dart';
import '../widgets/courses_grid_card.dart';
import '../widgets/faculty_header.dart';
import '../widgets/faculty_stats_grid.dart';
import '../widgets/low_attendance_alert.dart';
import '../widgets/noticeboard_card.dart';
import '../widgets/quick_actions_card.dart';
import '../widgets/today_schedule_card.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(dashboardProvider);

    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: const FacultyTopNavBar(),
      body: state.loading
          ? _buildShimmer()
          : state.error != null
              ? FacultyErrorState(
                  message: state.error!,
                  onRetry: () => ref.read(dashboardProvider.notifier).load(),
                )
              : RefreshIndicator(
                  color: AppColors.gold,
                  onRefresh: () => ref.read(dashboardProvider.notifier).load(),
                  child: ListView(
                    padding: const EdgeInsets.all(AppDimensions.md),
                    children: [
                      FacultyHeader(
                        courses: state.courses,
                        selectedCourse: state.selectedCourse,
                        onSelectCourse: (c) =>
                            ref.read(dashboardProvider.notifier).selectCourse(c),
                        onGenerateQR: () => context.go('/attendance/generate-qr'),
                      ),
                      const SizedBox(height: AppDimensions.md),

                      FacultyStatsGrid(stats: state.stats),
                      const SizedBox(height: AppDimensions.md),

                      TodayScheduleCard(
                        schedule: state.todaySchedule,
                        onViewFull: () => context.go('/timetable'),
                      ),
                      const SizedBox(height: AppDimensions.md),

                      CoursesGridCard(
                        courses: state.courseCards,
                        onManage: () => context.go('/courses'),
                      ),
                      const SizedBox(height: AppDimensions.md),

                      LowAttendanceAlert(
                        count: state.stats.lowAttendanceCount,
                        onViewStudents: () => context.go('/attendance'),
                      ),
                      if (state.stats.lowAttendanceCount > 0)
                        const SizedBox(height: AppDimensions.md),

                      QuickActionsCard(
                        onAction: (path) => context.go(path),
                      ),
                      const SizedBox(height: AppDimensions.md),

                      NoticeboardDashboardCard(
                        notices: state.notices,
                        onViewAll: () => context.go('/noticeboard'),
                      ),
                      const SizedBox(height: AppDimensions.xxl),
                    ],
                  ),
                ),
    );
  }

  Widget _buildShimmer() {
    return FacultyShimmer(
      child: ListView(
        padding: const EdgeInsets.all(AppDimensions.md),
        children: [
          const ShimmerBox(height: 140),
          const SizedBox(height: 16),
          Row(children: [
            Expanded(child: ShimmerBox(height: 100)),
            const SizedBox(width: 12),
            Expanded(child: ShimmerBox(height: 100)),
          ]),
          const SizedBox(height: 12),
          Row(children: [
            Expanded(child: ShimmerBox(height: 100)),
            const SizedBox(width: 12),
            Expanded(child: ShimmerBox(height: 100)),
          ]),
          const SizedBox(height: 16),
          const ShimmerBox(height: 200),
          const SizedBox(height: 16),
          const ShimmerBox(height: 180),
        ],
      ),
    );
  }
}
