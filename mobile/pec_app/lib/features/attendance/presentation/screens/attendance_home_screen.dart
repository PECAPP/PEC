import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../providers/attendance_provider.dart';

class AttendanceHomeScreen extends ConsumerWidget {
  const AttendanceHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final overallAsync = ref.watch(overallAttendanceProvider);

    final data = overallAsync.maybeWhen(
      data: (stats) {
        final present = (stats['present'] as int?) ?? 96;
        final absent = (stats['absent'] as int?) ?? 16;
        final pct = ((stats['pct'] as double?) ?? 83.0).clamp(0.0, 100.0);
        return _AttendanceViewData(present: present, absent: absent, pct: pct);
      },
      orElse: () => const _AttendanceViewData(present: 96, absent: 16, pct: 83.0),
    );

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          color: AppColors.yellow,
          onRefresh: () async {
            ref.invalidate(attendanceSummaryProvider);
            ref.invalidate(attendanceHistoryProvider);
          },
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(AppDimensions.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _Header(pct: data.pct),
                const SizedBox(height: AppDimensions.md),
                Divider(
                  color: AppColors.yellow.withValues(alpha: 0.12),
                  height: 1,
                ),
                const SizedBox(height: AppDimensions.lg),
                _AttendanceContent(data: data),
                const SizedBox(height: AppDimensions.xl),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _AttendanceViewData {
  final int present;
  final int absent;
  final double pct;

  const _AttendanceViewData({
    required this.present,
    required this.absent,
    required this.pct,
  });
}

class _Header extends StatelessWidget {
  final double pct;

  const _Header({required this.pct});

  @override
  Widget build(BuildContext context) {
    final eligible = pct >= 75;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(Icons.show_chart_rounded, color: AppColors.yellow.withValues(alpha: 0.9), size: 30),
        const SizedBox(width: AppDimensions.sm),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Attendance',
                style: AppTextStyles.heading1.copyWith(
                  color: AppColors.white,
                  fontSize: 42 / 2,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'View your attendance summary and eligibility status',
                style: AppTextStyles.bodyLarge.copyWith(
                  color: AppColors.white.withValues(alpha: 0.62),
                  fontStyle: FontStyle.italic,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(width: AppDimensions.sm),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
          decoration: BoxDecoration(
            color: const Color(0xFF132E25),
            borderRadius: BorderRadius.circular(6),
            border: Border.all(color: const Color(0xFF116A50)),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                eligible ? Icons.shield_outlined : Icons.shield_moon_outlined,
                color: const Color(0xFF1FD5A8),
                size: 14,
              ),
              const SizedBox(width: 8),
              Text(
                eligible ? 'ELIGIBLE' : 'WATCH',
                style: AppTextStyles.labelSmall.copyWith(
                  color: const Color(0xFF1FD5A8),
                  fontSize: 12,
                  letterSpacing: 0.3,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _AttendanceContent extends StatelessWidget {
  final _AttendanceViewData data;

  const _AttendanceContent({required this.data});

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final isWide = constraints.maxWidth >= 900;

        if (isWide) {
          return Column(
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(flex: 2, child: _OverallPanel(data: data)),
                  const SizedBox(width: AppDimensions.lg),
                  const Expanded(child: _GuidelinesPanel()),
                ],
              ),
              const SizedBox(height: AppDimensions.lg),
              const _CourseAttendanceSection(),
              const SizedBox(height: AppDimensions.lg),
              const _AttendanceHistorySection(),
            ],
          );
        }

        return Column(
          children: const [
            _OverallPanel(),
            SizedBox(height: AppDimensions.lg),
            _GuidelinesPanel(),
            SizedBox(height: AppDimensions.lg),
            _CourseAttendanceSection(),
            SizedBox(height: AppDimensions.lg),
            _AttendanceHistorySection(),
          ],
        );
      },
    );
  }
}

class _OverallPanel extends StatelessWidget {
  final _AttendanceViewData? data;

  const _OverallPanel({this.data});

  @override
  Widget build(BuildContext context) {
    final d = data ?? const _AttendanceViewData(present: 96, absent: 16, pct: 83.0);
    final target = 75;
    final leavesLeft = (d.pct - target).clamp(0, 100).round();

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppDimensions.lg),
      decoration: BoxDecoration(
        border: Border.all(color: AppColors.yellow.withValues(alpha: 0.16)),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFF1E1A12),
            Color(0xFF17140F),
            Color(0xFF13110D),
          ],
        ),
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final compact = constraints.maxWidth < 760;

          final details = Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Overall Attendance',
                style: AppTextStyles.heading1.copyWith(
                  color: AppColors.white,
                  fontSize: 55 / 2,
                ),
              ),
              const SizedBox(height: AppDimensions.sm),
              Text(
                'Your cumulative presence is ${d.pct.round()}%. Maintenance of a 75% threshold is mandatory for examination clearance.',
                style: AppTextStyles.bodyLarge.copyWith(
                  color: AppColors.white.withValues(alpha: 0.68),
                  height: 1.45,
                ),
              ),
              const SizedBox(height: AppDimensions.md),
              Text(
                'Leaves left (considering 75% attendance): $leavesLeft sessions.',
                style: AppTextStyles.labelLarge.copyWith(
                  color: AppColors.yellow,
                  fontSize: 26 / 2,
                ),
              ),
              const SizedBox(height: AppDimensions.md),
              Row(
                children: [
                  Expanded(
                    child: _CountCard(
                      title: 'ATTENDED',
                      value: '${d.present}',
                      suffix: 'Sessions',
                      tone: const Color(0xFF1B3427),
                      accent: const Color(0xFF1FD5A8),
                    ),
                  ),
                  const SizedBox(width: AppDimensions.md),
                  Expanded(
                    child: _CountCard(
                      title: 'MISSED',
                      value: '${d.absent}',
                      suffix: 'Sessions',
                      tone: const Color(0xFF321E19),
                      accent: const Color(0xFFFF5757),
                    ),
                  ),
                ],
              ),
            ],
          );

          if (compact) {
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(child: _Ring(pct: d.pct)),
                const SizedBox(height: AppDimensions.lg),
                details,
              ],
            );
          }

          return Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                width: 300,
                child: Center(child: _Ring(pct: d.pct)),
              ),
              const SizedBox(width: AppDimensions.md),
              Expanded(child: details),
            ],
          );
        },
      ),
    );
  }
}

class _Ring extends StatelessWidget {
  final double pct;

  const _Ring({required this.pct});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 220,
      height: 220,
      child: Stack(
        alignment: Alignment.center,
        children: [
          SizedBox(
            width: 170,
            height: 170,
            child: CircularProgressIndicator(
              value: pct / 100,
              strokeWidth: 14,
              backgroundColor: const Color(0xFFE6E6E6),
              valueColor: const AlwaysStoppedAnimation<Color>(AppColors.yellow),
            ),
          ),
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                '${pct.round()}%',
                style: AppTextStyles.heading1.copyWith(
                  color: AppColors.yellow,
                  fontSize: 66 / 2,
                ),
              ),
              Text(
                'CUMULATIVE',
                style: AppTextStyles.labelSmall.copyWith(
                  color: AppColors.white.withValues(alpha: 0.42),
                  fontSize: 11,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _CountCard extends StatelessWidget {
  final String title;
  final String value;
  final String suffix;
  final Color tone;
  final Color accent;

  const _CountCard({
    required this.title,
    required this.value,
    required this.suffix,
    required this.tone,
    required this.accent,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 94,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: tone,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: accent.withValues(alpha: 0.22)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: AppTextStyles.labelSmall.copyWith(
              color: accent,
              fontSize: 11,
              letterSpacing: 1.1,
            ),
          ),
          const SizedBox(height: 6),
          RichText(
            text: TextSpan(
              text: value,
              style: AppTextStyles.heading1.copyWith(
                color: AppColors.white,
                fontSize: 54 / 2,
              ),
              children: [
                TextSpan(
                  text: ' $suffix',
                  style: AppTextStyles.labelLarge.copyWith(
                    color: AppColors.white.withValues(alpha: 0.72),
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _GuidelinesPanel extends StatelessWidget {
  const _GuidelinesPanel();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppDimensions.lg),
      decoration: BoxDecoration(
        border: Border.all(color: AppColors.yellow.withValues(alpha: 0.16)),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFF1E1A12),
            Color(0xFF17140F),
            Color(0xFF13110D),
          ],
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 54,
            height: 54,
            decoration: BoxDecoration(
              color: const Color(0xFF2A2418),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.yellow.withValues(alpha: 0.30)),
            ),
            child: Icon(
              Icons.verified_user_outlined,
              color: AppColors.yellow.withValues(alpha: 0.9),
              size: 27,
            ),
          ),
          const SizedBox(height: AppDimensions.lg),
          Text(
            'Eligibility Guidelines',
            style: AppTextStyles.heading1.copyWith(
              color: AppColors.white,
              fontSize: 50 / 2,
            ),
          ),
          const SizedBox(height: AppDimensions.md),
          Text(
            'Maintain academic compliance by tracking your course-wise attendance. Medical leave and waivers require official documentation.',
            style: AppTextStyles.bodyLarge.copyWith(
              color: AppColors.white.withValues(alpha: 0.68),
              height: 1.55,
            ),
          ),
          const SizedBox(height: AppDimensions.xl),
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.yellow,
                foregroundColor: AppColors.black,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
              ),
              onPressed: () {},
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'REQUEST WAIVER',
                    style: AppTextStyles.labelLarge.copyWith(
                      color: AppColors.black,
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 1,
                    ),
                  ),
                  const SizedBox(width: 10),
                  const Icon(Icons.arrow_forward, size: 18),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _CourseAttendanceSection extends ConsumerWidget {
  const _CourseAttendanceSection();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final summaryAsync = ref.watch(attendanceSummaryProvider);

    final items = summaryAsync.maybeWhen(
      data: (rows) {
        if (rows.isEmpty) return _demoCourseAttendance;
        return rows
            .map(
              (r) => _CourseAttendanceItem(
                code: r.courseCode,
                name: r.courseName,
                attended: r.present,
                absent: r.absent,
                percentage: r.percentage,
                leavesLeft: _leavesLeft(r.present, r.absent),
              ),
            )
            .toList();
      },
      orElse: () => _demoCourseAttendance,
    );

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppDimensions.md),
      decoration: BoxDecoration(
        border: Border.all(color: AppColors.yellow.withValues(alpha: 0.16)),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFF1E1A12),
            Color(0xFF17140F),
            Color(0xFF13110D),
          ],
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: const Color(0xFF2A2418),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: AppColors.yellow.withValues(alpha: 0.30)),
                ),
                child: Icon(
                  Icons.menu_book_outlined,
                  size: 18,
                  color: AppColors.yellow.withValues(alpha: 0.9),
                ),
              ),
              const SizedBox(width: 12),
              Text(
                'Course Attendance',
                style: AppTextStyles.heading1.copyWith(
                  color: AppColors.white,
                  fontSize: 48 / 2,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppDimensions.md),
          Container(
            decoration: BoxDecoration(
              color: const Color(0xFF2A2418).withValues(alpha: 0.45),
              border: Border.all(color: AppColors.yellow.withValues(alpha: 0.08)),
            ),
            child: Column(
              children: [
                const _CourseAttendanceHeaderRow(),
                for (final item in items)
                  _CourseAttendanceRow(item: item),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _CourseAttendanceHeaderRow extends StatelessWidget {
  const _CourseAttendanceHeaderRow();

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final compact = constraints.maxWidth < 520;
        final labelStyle = AppTextStyles.labelSmall.copyWith(
          color: AppColors.white.withValues(alpha: 0.55),
          fontSize: compact ? 9.5 : 11,
          letterSpacing: 0.7,
        );

        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          child: Row(
            children: [
              Expanded(flex: 2, child: Text('CODE', style: labelStyle)),
              Expanded(flex: 4, child: Text('COURSE NAME', style: labelStyle)),
              Expanded(
                flex: 3,
                child: Text(
                  'ATTENDED / ABSENT',
                  textAlign: TextAlign.center,
                  style: labelStyle,
                ),
              ),
              Expanded(
                flex: 3,
                child: Text(
                  'PERCENTAGE',
                  textAlign: TextAlign.right,
                  style: labelStyle,
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _CourseAttendanceRow extends StatelessWidget {
  final _CourseAttendanceItem item;

  const _CourseAttendanceRow({required this.item});

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final compact = constraints.maxWidth < 520;

        return Container(
          padding: EdgeInsets.symmetric(
            horizontal: compact ? 10 : 12,
            vertical: compact ? 14 : 16,
          ),
          decoration: BoxDecoration(
            border: Border(
              top: BorderSide(color: AppColors.yellow.withValues(alpha: 0.08)),
            ),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Expanded(
                flex: 2,
                child: Text(
                  item.code,
                  style: AppTextStyles.labelLarge.copyWith(
                    color: AppColors.yellow,
                    fontSize: compact ? 10.5 : 12,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Expanded(
                flex: 4,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.name,
                      style: AppTextStyles.heading3.copyWith(
                        color: AppColors.white,
                        fontSize: compact ? 14 : 18,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Leaves left: ${item.leavesLeft}',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.white.withValues(alpha: 0.62),
                        fontSize: compact ? 10 : 11,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              Expanded(
                flex: 3,
                child: Center(
                  child: Container(
                    padding: EdgeInsets.symmetric(
                      horizontal: compact ? 8 : 12,
                      vertical: compact ? 6 : 8,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFF231D15),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(
                        color: AppColors.yellow.withValues(alpha: 0.10),
                      ),
                    ),
                    child: RichText(
                      text: TextSpan(
                        style: AppTextStyles.heading3.copyWith(
                          fontSize: compact ? 14 : 16,
                        ),
                        children: [
                          TextSpan(
                            text: '${item.attended}',
                            style: const TextStyle(color: Color(0xFF1FD5A8)),
                          ),
                          TextSpan(
                            text: ' / ',
                            style: TextStyle(
                              color: AppColors.white.withValues(alpha: 0.55),
                            ),
                          ),
                          const TextSpan(
                            text: '',
                          ),
                          TextSpan(
                            text: '${item.absent}',
                            style: const TextStyle(color: Color(0xFFFF5757)),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
              Expanded(
                flex: 3,
                child: Row(
                  children: [
                    Expanded(
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: SizedBox(
                          height: compact ? 6 : 8,
                          child: Stack(
                            children: [
                              Container(color: const Color(0xFF312B20)),
                              FractionallySizedBox(
                                widthFactor: (item.percentage / 100).clamp(0.0, 1.0),
                                child: Container(color: const Color(0xFF1FD5A8)),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    SizedBox(width: compact ? 6 : 10),
                    Text(
                      '${item.percentage.round()}%',
                      style: AppTextStyles.heading3.copyWith(
                        color: const Color(0xFF1FD5A8),
                        fontSize: compact ? 15 : 18,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _CourseAttendanceItem {
  final String code;
  final String name;
  final int attended;
  final int absent;
  final double percentage;
  final int leavesLeft;

  const _CourseAttendanceItem({
    required this.code,
    required this.name,
    required this.attended,
    required this.absent,
    required this.percentage,
    required this.leavesLeft,
  });
}

int _leavesLeft(int attended, int absent) {
  final remaining = (attended / 3.0) - absent;
  if (remaining.isNaN || remaining.isInfinite) return 0;
  return remaining.floor().clamp(0, 999);
}

const List<_CourseAttendanceItem> _demoCourseAttendance = [
  _CourseAttendanceItem(
    code: 'DS101',
    name: 'Engineering Mathematics I',
    attended: 12,
    absent: 2,
    percentage: 83,
    leavesLeft: 2,
  ),
  _CourseAttendanceItem(
    code: 'DS102',
    name: 'Applied Physics',
    attended: 12,
    absent: 2,
    percentage: 83,
    leavesLeft: 2,
  ),
  _CourseAttendanceItem(
    code: 'DS103',
    name: 'Programming for Problem Solving',
    attended: 12,
    absent: 2,
    percentage: 83,
    leavesLeft: 2,
  ),
  _CourseAttendanceItem(
    code: 'DS104',
    name: 'Basic Electrical & Electronics',
    attended: 12,
    absent: 2,
    percentage: 83,
    leavesLeft: 2,
  ),
  _CourseAttendanceItem(
    code: 'DS105',
    name: 'Workshop Practice',
    attended: 12,
    absent: 2,
    percentage: 83,
    leavesLeft: 2,
  ),
  _CourseAttendanceItem(
    code: 'DS101-1',
    name: 'Engineering Mathematics I (Section 1)',
    attended: 12,
    absent: 2,
    percentage: 83,
    leavesLeft: 2,
  ),
  _CourseAttendanceItem(
    code: 'DS102-2',
    name: 'Applied Physics (Section 2)',
    attended: 12,
    absent: 2,
    percentage: 83,
    leavesLeft: 2,
  ),
  _CourseAttendanceItem(
    code: 'DS103-3',
    name: 'Programming for Problem Solving (Section 3)',
    attended: 12,
    absent: 2,
    percentage: 83,
    leavesLeft: 2,
  ),
];

class _AttendanceHistorySection extends ConsumerWidget {
  const _AttendanceHistorySection();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final historyAsync = ref.watch(attendanceHistoryProvider);

    final rows = historyAsync.maybeWhen(
      data: (items) {
        if (items.isEmpty) return _demoAttendanceHistory;
        return items
            .map(
              (r) => _AttendanceHistoryItem(
                date: r.date,
                courseCode: r.courseCode,
                courseName: r.courseName,
                status: r.status,
              ),
            )
            .toList();
      },
      orElse: () => _demoAttendanceHistory,
    );

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppDimensions.md),
      decoration: BoxDecoration(
        border: Border.all(color: AppColors.yellow.withValues(alpha: 0.16)),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFF1E1A12),
            Color(0xFF17140F),
            Color(0xFF13110D),
          ],
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: const Color(0xFF2A2418),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(
                    color: AppColors.yellow.withValues(alpha: 0.30),
                  ),
                ),
                child: Icon(
                  Icons.event_note_outlined,
                  size: 18,
                  color: AppColors.yellow.withValues(alpha: 0.9),
                ),
              ),
              const SizedBox(width: 12),
              Text(
                'Attendance History',
                style: AppTextStyles.heading1.copyWith(
                  color: AppColors.white,
                  fontSize: 48 / 2,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppDimensions.md),
          Container(
            decoration: BoxDecoration(
              color: const Color(0xFF2A2418).withValues(alpha: 0.45),
              border: Border.all(color: AppColors.yellow.withValues(alpha: 0.08)),
            ),
            child: Column(
              children: [
                const _AttendanceHistoryHeaderRow(),
                for (final row in rows.take(12))
                  _AttendanceHistoryRow(item: row),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _AttendanceHistoryHeaderRow extends StatelessWidget {
  const _AttendanceHistoryHeaderRow();

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final compact = constraints.maxWidth < 520;
        final labelStyle = AppTextStyles.labelSmall.copyWith(
          color: AppColors.white.withValues(alpha: 0.55),
          fontSize: compact ? 9.5 : 11,
          letterSpacing: 0.7,
        );

        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          child: Row(
            children: [
              Expanded(flex: 3, child: Text('DATE', style: labelStyle)),
              Expanded(flex: 7, child: Text('COURSE', style: labelStyle)),
              Expanded(
                flex: 3,
                child: Text(
                  'STATUS',
                  textAlign: TextAlign.right,
                  style: labelStyle,
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _AttendanceHistoryRow extends StatelessWidget {
  final _AttendanceHistoryItem item;

  const _AttendanceHistoryRow({required this.item});

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final compact = constraints.maxWidth < 520;
        final isPresent = item.status.toLowerCase() == 'present';

        return Container(
          padding: EdgeInsets.symmetric(
            horizontal: compact ? 10 : 12,
            vertical: compact ? 14 : 16,
          ),
          decoration: BoxDecoration(
            border: Border(
              top: BorderSide(color: AppColors.yellow.withValues(alpha: 0.08)),
            ),
          ),
          child: Row(
            children: [
              Expanded(
                flex: 3,
                child: Text(
                  _formatDate(item.date),
                  style: AppTextStyles.labelLarge.copyWith(
                    color: AppColors.white.withValues(alpha: 0.84),
                    fontSize: compact ? 13 : 15,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Expanded(
                flex: 7,
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 3,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xFF2A2418),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        item.courseCode,
                        style: AppTextStyles.labelSmall.copyWith(
                          color: AppColors.yellow,
                          fontSize: compact ? 9 : 10,
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        item.courseName,
                        style: AppTextStyles.heading3.copyWith(
                          color: AppColors.white,
                          fontSize: compact ? 15 : 18,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                flex: 3,
                child: Align(
                  alignment: Alignment.centerRight,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: isPresent
                          ? const Color(0xFF17362A)
                          : const Color(0xFF3A1E1A),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(
                        color: isPresent
                            ? const Color(0xFF1FD5A8).withValues(alpha: 0.4)
                            : const Color(0xFFFF5757).withValues(alpha: 0.5),
                      ),
                    ),
                    child: Text(
                      isPresent ? 'PRESENT' : 'ABSENT',
                      style: AppTextStyles.labelSmall.copyWith(
                        color: isPresent
                            ? const Color(0xFF1FD5A8)
                            : const Color(0xFFFF5757),
                        fontSize: compact ? 10 : 11,
                        letterSpacing: 0.7,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _AttendanceHistoryItem {
  final DateTime date;
  final String courseCode;
  final String courseName;
  final String status;

  const _AttendanceHistoryItem({
    required this.date,
    required this.courseCode,
    required this.courseName,
    required this.status,
  });
}

String _formatDate(DateTime date) {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return '${months[date.month - 1]} ${date.day}, ${date.year}';
}

final List<_AttendanceHistoryItem> _demoAttendanceHistory = [
  _AttendanceHistoryItem(
    date: DateTime(2026, 4, 4),
    courseCode: 'DS103-3',
    courseName: 'Programming for Problem Solving (Section 3)',
    status: 'absent',
  ),
  _AttendanceHistoryItem(
    date: DateTime(2026, 4, 4),
    courseCode: 'DS102-2',
    courseName: 'Applied Physics (Section 2)',
    status: 'absent',
  ),
  _AttendanceHistoryItem(
    date: DateTime(2026, 4, 4),
    courseCode: 'DS101-1',
    courseName: 'Engineering Mathematics I (Section 1)',
    status: 'absent',
  ),
  _AttendanceHistoryItem(
    date: DateTime(2026, 4, 4),
    courseCode: 'DS105',
    courseName: 'Workshop Practice',
    status: 'absent',
  ),
  _AttendanceHistoryItem(
    date: DateTime(2026, 4, 4),
    courseCode: 'DS104',
    courseName: 'Basic Electrical & Electronics',
    status: 'absent',
  ),
  _AttendanceHistoryItem(
    date: DateTime(2026, 4, 4),
    courseCode: 'DS103',
    courseName: 'Programming for Problem Solving',
    status: 'absent',
  ),
  _AttendanceHistoryItem(
    date: DateTime(2026, 4, 4),
    courseCode: 'DS102',
    courseName: 'Applied Physics',
    status: 'absent',
  ),
  _AttendanceHistoryItem(
    date: DateTime(2026, 4, 4),
    courseCode: 'DS101',
    courseName: 'Engineering Mathematics I',
    status: 'absent',
  ),
  _AttendanceHistoryItem(
    date: DateTime(2026, 4, 2),
    courseCode: 'DS103-3',
    courseName: 'Programming for Problem Solving (Section 3)',
    status: 'present',
  ),
];
