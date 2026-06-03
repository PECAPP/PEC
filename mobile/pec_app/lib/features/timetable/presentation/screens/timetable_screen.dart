import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/pec_card.dart';
import '../../../../shared/widgets/pec_error_state.dart';
import '../../../../shared/widgets/pec_shimmer.dart';
import '../../data/models/timetable_model.dart';
import '../providers/timetable_provider.dart';

class TimetableScreen extends ConsumerStatefulWidget {
  const TimetableScreen({super.key});

  @override
  ConsumerState<TimetableScreen> createState() => _TimetableScreenState();
}

class _TimetableScreenState extends ConsumerState<TimetableScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  static const _days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  static const _fullDays = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  int get _todayIndex {
    final w = DateTime.now().weekday;
    return (w <= 6) ? w - 1 : 0;
  }

  @override
  void initState() {
    super.initState();
    _tabController = TabController(
      length: _days.length,
      vsync: this,
      initialIndex: _todayIndex.clamp(0, _days.length - 1),
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final timetableAsync = ref.watch(timetableProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('TIMETABLE'),
        bottom: TabBar(
          controller: _tabController,
          tabs: List.generate(_days.length, (i) {
            final isToday = i == _todayIndex;
            return Tab(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                decoration: isToday
                    ? BoxDecoration(
                        color: AppColors.yellow,
                        border: Border.all(color: AppColors.black, width: 2),
                      )
                    : null,
                child: Text(
                  _days[i],
                  style: AppTextStyles.labelSmall.copyWith(
                    color: isToday ? AppColors.black : (isDark ? AppColors.white : null),
                    fontWeight: isToday ? FontWeight.w900 : null,
                  ),
                ),
              ),
            );
          }),
          labelColor: AppColors.yellow,
          unselectedLabelColor:
              isDark ? AppColors.textSecondaryDark : AppColors.textSecondary,
          indicatorColor: AppColors.yellow,
        ),
      ),
      body: timetableAsync.when(
        loading: () => _buildShimmer(),
        error: (e, _) => PecErrorState(
          message: e.toString(),
          onRetry: () => ref.invalidate(timetableProvider),
        ),
        data: (entries) => TabBarView(
          controller: _tabController,
          children: List.generate(_days.length, (i) {
            final day = _fullDays[i];
            final dayEntries = entries
                .where((e) =>
                    e.dayOfWeek.toLowerCase() == day.toLowerCase())
                .toList()
              ..sort((a, b) => a.startMinutes.compareTo(b.startMinutes));
            return RefreshIndicator(
              color: AppColors.yellow,
              onRefresh: () async => ref.invalidate(timetableProvider),
              child: dayEntries.isEmpty
                  ? _EmptyDay(day: _days[i])
                  : _DaySchedule(
                      entries: dayEntries,
                      isToday: i == _todayIndex,
                    ),
            );
          }),
        ),
      ),
    );
  }

  Widget _buildShimmer() => ListView.separated(
        padding: const EdgeInsets.all(AppDimensions.md),
        itemCount: 5,
        separatorBuilder: (_, __) => const SizedBox(height: AppDimensions.sm),
        itemBuilder: (_, __) =>
            const PecShimmerBox(height: 88, width: double.infinity),
      );
}

// ─── Day schedule ─────────────────────────────────────────────────────────────

class _DaySchedule extends StatelessWidget {
  final List<TimetableEntry> entries;
  final bool isToday;
  const _DaySchedule({required this.entries, required this.isToday});

  bool _isOngoing(TimetableEntry e, TimeOfDay now) {
    final s = _tod(e.startTime);
    final en = _tod(e.endTime);
    final n = now.hour * 60 + now.minute;
    return n >= s.hour * 60 + s.minute && n < en.hour * 60 + en.minute;
  }

  bool _isPast(TimetableEntry e, TimeOfDay now) {
    final en = _tod(e.endTime);
    return now.hour * 60 + now.minute >= en.hour * 60 + en.minute;
  }

  TimeOfDay _tod(String t) {
    final p = t.split(':');
    return TimeOfDay(hour: int.parse(p[0]), minute: int.parse(p[1]));
  }

  @override
  Widget build(BuildContext context) {
    final now = TimeOfDay.now();
    return ListView.separated(
      padding: const EdgeInsets.all(AppDimensions.md),
      itemCount: entries.length,
      separatorBuilder: (_, __) => const SizedBox(height: AppDimensions.sm),
      itemBuilder: (_, i) {
        final e = entries[i];
        return _SlotCard(
          entry: e,
          isOngoing: isToday && _isOngoing(e, now),
          isPast: isToday && _isPast(e, now),
        );
      },
    );
  }
}

// ─── Slot card ────────────────────────────────────────────────────────────────

class _SlotCard extends StatelessWidget {
  final TimetableEntry entry;
  final bool isOngoing;
  final bool isPast;
  const _SlotCard(
      {required this.entry, required this.isOngoing, required this.isPast});

  @override
  Widget build(BuildContext context) {
    final cardColor =
        isOngoing ? AppColors.yellow : AppColors.white;
    final shadow = isOngoing ? AppColors.black : AppColors.shadowBlue;

    return PecCard(
      color: cardColor,
      shadowColor: shadow,
      shadowOffset: isOngoing ? AppDimensions.shadowOffset : 4,
      child: IntrinsicHeight(
        child: Row(
          children: [
            // Time column
            SizedBox(
              width: 58,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(entry.startTime,
                      style: AppTextStyles.labelLarge.copyWith(
                          color: AppColors.black, fontSize: 12)),
                  Container(
                      width: 1,
                      height: 12,
                      color: AppColors.black.withValues(alpha: 0.25)),
                  Text(entry.endTime,
                      style: AppTextStyles.caption
                          .copyWith(color: AppColors.black.withValues(alpha: 0.6))),
                ],
              ),
            ),
            // Accent bar
            Container(
              width: 3,
              color: isOngoing ? AppColors.black : AppColors.blue,
            ),
            const SizedBox(width: AppDimensions.sm),
            // Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      if (isOngoing) ...[
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 5, vertical: 1),
                          color: AppColors.black,
                          child: Text('LIVE',
                              style: AppTextStyles.labelSmall.copyWith(
                                  color: AppColors.yellow, fontSize: 9)),
                        ),
                        const SizedBox(width: AppDimensions.xs),
                      ],
                      Expanded(
                        child: Text(
                          entry.courseName,
                          style: AppTextStyles.labelLarge.copyWith(
                            color: AppColors.black,
                            fontSize: 14,
                            decoration: isPast
                                ? TextDecoration.lineThrough
                                : null,
                            decorationColor: AppColors.black,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(entry.courseCode,
                      style: AppTextStyles.caption.copyWith(
                          color: AppColors.black.withValues(alpha: 0.55))),
                  if (entry.facultyName != null || entry.room != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 3),
                      child: Wrap(
                        spacing: AppDimensions.sm,
                        children: [
                          if (entry.facultyName != null)
                            _iconText(Icons.person_outline, entry.facultyName!),
                          if (entry.room != null)
                            _iconText(Icons.location_on_outlined, entry.room!),
                        ],
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _iconText(IconData icon, String label) => Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 11, color: AppColors.black.withValues(alpha: 0.55)),
          const SizedBox(width: 2),
          Text(label,
              style: AppTextStyles.caption.copyWith(
                  color: AppColors.black.withValues(alpha: 0.55),
                  fontSize: 11)),
        ],
      );
}

// ─── Empty day ────────────────────────────────────────────────────────────────

class _EmptyDay extends StatelessWidget {
  final String day;
  const _EmptyDay({required this.day});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppDimensions.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(AppDimensions.lg),
              decoration: BoxDecoration(
                color: AppColors.yellow,
                border:
                    Border.all(color: AppColors.black, width: AppDimensions.borderWidth),
                boxShadow: const [
                  BoxShadow(offset: Offset(6, 6), color: AppColors.black)
                ],
              ),
              child: const Icon(Icons.free_breakfast_outlined,
                  size: 48, color: AppColors.black),
            ),
            const SizedBox(height: AppDimensions.lg),
            Text(
              'NO CLASSES ON ${day.toUpperCase()}',
              style: AppTextStyles.heading3
                  .copyWith(color: AppColors.textSecondary),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
