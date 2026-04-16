import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/faculty_card.dart';
import '../../../../shared/widgets/faculty_empty_state.dart';
import '../../../../shared/widgets/faculty_error_state.dart';
import '../../../../shared/widgets/faculty_shimmer.dart';
import '../../../../shared/widgets/faculty_top_nav_bar.dart';
import '../providers/timetable_provider.dart';

class TimetableScreen extends ConsumerStatefulWidget {
  const TimetableScreen({super.key});

  @override
  ConsumerState<TimetableScreen> createState() => _TimetableScreenState();
}

class _TimetableScreenState extends ConsumerState<TimetableScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabCtrl;
  static const _dayKeys = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  static const _dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  @override
  void initState() {
    super.initState();
    final today = DateTime.now().weekday; // 1=Mon .. 7=Sun
    final idx = (today >= 1 && today <= 6) ? today - 1 : 0;
    _tabCtrl = TabController(length: 6, vsync: this, initialIndex: idx);
  }

  @override
  void dispose() {
    _tabCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(timetableProvider);

    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: const FacultyTopNavBar(),
      body: Column(
        children: [
          Container(
            color: AppColors.bgDark,
            child: TabBar(
              controller: _tabCtrl,
              labelColor: AppColors.gold,
              unselectedLabelColor: AppColors.textMuted,
              indicatorColor: AppColors.gold,
              indicatorSize: TabBarIndicatorSize.label,
              tabs: _dayLabels.map((d) => Tab(text: d)).toList(),
            ),
          ),
          Expanded(
            child: state.loading
                ? FacultyShimmer(
                    child: ListView(
                      padding: const EdgeInsets.all(AppDimensions.md),
                      children: List.generate(5, (_) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: ShimmerBox(height: 72),
                      )),
                    ),
                  )
                : state.error != null
                    ? FacultyErrorState(
                        message: state.error!,
                        onRetry: () => ref.read(timetableProvider.notifier).load(),
                      )
                    : TabBarView(
                        controller: _tabCtrl,
                        children: _dayKeys.map((day) {
                          final items = state.byDay[day] ?? [];

                          if (items.isEmpty) {
                            return FacultyEmptyState(
                              title: 'No classes on ${day.substring(0, 3)}',
                              icon: Icons.event_available_outlined,
                            );
                          }

                          return RefreshIndicator(
                            color: AppColors.gold,
                            onRefresh: () => ref.read(timetableProvider.notifier).load(),
                            child: ListView.separated(
                              padding: const EdgeInsets.all(AppDimensions.md),
                              itemCount: items.length,
                              separatorBuilder: (_, _) => const SizedBox(height: 10),
                              itemBuilder: (_, i) {
                                final s = items[i];
                                return FacultyCard(
                                  child: Row(
                                    children: [
                                      Container(
                                        width: 4,
                                        height: 50,
                                        decoration: BoxDecoration(
                                          color: AppColors.gold,
                                          borderRadius: BorderRadius.circular(2),
                                        ),
                                      ),
                                      const SizedBox(width: 14),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(s.course, style: AppTextStyles.labelLarge),
                                            const SizedBox(height: 2),
                                            Text(
                                              '${s.time}  ·  ${s.room}  ·  ${s.section}',
                                              style: AppTextStyles.caption,
                                            ),
                                          ],
                                        ),
                                      ),
                                      Text('${s.students}', style: AppTextStyles.labelMedium),
                                      const SizedBox(width: 4),
                                      Icon(Icons.people_alt_outlined, color: AppColors.textMuted, size: 14),
                                    ],
                                  ),
                                );
                              },
                            ),
                          );
                        }).toList(),
                      ),
          ),
        ],
      ),
    );
  }
}
