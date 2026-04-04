import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/pec_card.dart';
import '../../../../shared/widgets/pec_error_state.dart';
import '../../../../shared/widgets/pec_shimmer.dart';
import '../../data/models/attendance_model.dart';
import '../providers/attendance_provider.dart';

class AttendanceHomeScreen extends ConsumerWidget {
  const AttendanceHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final summaryAsync = ref.watch(attendanceSummaryProvider);
    final overallAsync = ref.watch(overallAttendanceProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('ATTENDANCE'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              ref.invalidate(attendanceSummaryProvider);
              ref.invalidate(attendanceHistoryProvider);
            },
          ),
        ],
      ),
      body: RefreshIndicator(
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
              // ── Overall stats ────────────────────────────────────────
              _buildSectionHeader('OVERALL'),
              const SizedBox(height: AppDimensions.sm),
              overallAsync.when(
                loading: () => const PecShimmerBox(height: 90, width: double.infinity),
                error: (e, _) => Text(e.toString(), style: AppTextStyles.bodySmall),
                data: (stats) => _OverallCard(
                  present: stats['present'] as int,
                  absent: stats['absent'] as int,
                  pct: (stats['pct'] as double),
                ),
              ),
              const SizedBox(height: AppDimensions.lg),

              // ── Per-course breakdown ─────────────────────────────────
              _buildSectionHeader('BY COURSE'),
              const SizedBox(height: AppDimensions.sm),
              summaryAsync.when(
                loading: () => _buildShimmerList(),
                error: (e, _) => PecErrorState(
                  message: e.toString(),
                  onRetry: () => ref.invalidate(attendanceSummaryProvider),
                ),
                data: (summaries) {
                  if (summaries.isEmpty) {
                    return const _NoCourses();
                  }
                  return Column(
                    children: summaries
                        .map((s) => Padding(
                              padding: const EdgeInsets.only(
                                  bottom: AppDimensions.sm),
                              child: _CourseAttendanceCard(summary: s),
                            ))
                        .toList(),
                  );
                },
              ),
              const SizedBox(height: AppDimensions.xxl),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) => Row(
        children: [
          Container(width: 4, height: 20, color: AppColors.yellow),
          const SizedBox(width: AppDimensions.sm),
          Text(title, style: AppTextStyles.labelLarge),
        ],
      );

  Widget _buildShimmerList() => Column(
        children: List.generate(
          3,
          (_) => const Padding(
            padding: EdgeInsets.only(bottom: AppDimensions.sm),
            child: PecShimmerBox(height: 80, width: double.infinity),
          ),
        ),
      );
}

// ─── Overall card ─────────────────────────────────────────────────────────────

class _OverallCard extends StatelessWidget {
  final int present;
  final int absent;
  final double pct;
  const _OverallCard(
      {required this.present, required this.absent, required this.pct});

  Color get _statusColor {
    if (pct >= 75) return AppColors.green;
    if (pct >= 60) return AppColors.warning;
    return AppColors.red;
  }

  @override
  Widget build(BuildContext context) {
    final total = present + absent;
    return PecCard(
      color: AppColors.white,
      shadowColor: _statusColor,
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _Stat('PRESENT', '$present', AppColors.green),
              Container(width: 1, height: 40, color: AppColors.borderLight),
              _Stat('ABSENT', '$absent', AppColors.red),
              Container(width: 1, height: 40, color: AppColors.borderLight),
              _Stat('TOTAL', '$total', AppColors.blue),
            ],
          ),
          const SizedBox(height: AppDimensions.md),
          // Progress bar
          Stack(
            children: [
              Container(
                height: 12,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: AppColors.bgSurface,
                  border: Border.all(color: AppColors.black, width: 2),
                ),
              ),
              FractionallySizedBox(
                widthFactor: (pct / 100).clamp(0.0, 1.0),
                child: Container(height: 12, color: _statusColor),
              ),
            ],
          ),
          const SizedBox(height: AppDimensions.xs),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('${pct.toStringAsFixed(1)}% ATTENDANCE',
                  style: AppTextStyles.labelSmall.copyWith(color: _statusColor)),
              Text(pct >= 75 ? '✓ ELIGIBLE' : '⚠ BELOW 75%',
                  style: AppTextStyles.labelSmall.copyWith(
                      color: pct >= 75 ? AppColors.green : AppColors.red)),
            ],
          ),
        ],
      ),
    );
  }
}

class _Stat extends StatelessWidget {
  final String label;
  final String value;
  final Color color;
  const _Stat(this.label, this.value, this.color);

  @override
  Widget build(BuildContext context) => Column(
        children: [
          Text(value,
              style: AppTextStyles.heading2.copyWith(color: color, fontSize: 24)),
          Text(label, style: AppTextStyles.labelSmall),
        ],
      );
}

// ─── Per-course card ──────────────────────────────────────────────────────────

class _CourseAttendanceCard extends StatelessWidget {
  final AttendanceSummary summary;
  const _CourseAttendanceCard({required this.summary});

  Color get _barColor {
    if (summary.percentage >= 75) return AppColors.green;
    if (summary.percentage >= 60) return AppColors.warning;
    return AppColors.red;
  }

  @override
  Widget build(BuildContext context) {
    return PecCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(summary.courseName,
                        style: AppTextStyles.labelLarge,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis),
                    Text(summary.courseCode, style: AppTextStyles.caption),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                color: _barColor,
                child: Text(
                  '${summary.percentage.toStringAsFixed(0)}%',
                  style: AppTextStyles.labelLarge
                      .copyWith(color: AppColors.black, fontSize: 13),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppDimensions.sm),
          // Thin bar
          Stack(
            children: [
              Container(
                height: 6,
                width: double.infinity,
                color: AppColors.bgSurface,
              ),
              FractionallySizedBox(
                widthFactor: (summary.percentage / 100).clamp(0.0, 1.0),
                child: Container(height: 6, color: _barColor),
              ),
            ],
          ),
          const SizedBox(height: AppDimensions.xs),
          Text(
            '${summary.present} present · ${summary.absent} absent',
            style: AppTextStyles.caption,
          ),
        ],
      ),
    );
  }
}

class _NoCourses extends StatelessWidget {
  const _NoCourses();

  @override
  Widget build(BuildContext context) => PecCard(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(AppDimensions.lg),
            child: Column(
              children: [
                const Icon(Icons.school_outlined, size: 40, color: AppColors.yellow),
                const SizedBox(height: AppDimensions.sm),
                Text('No attendance data yet',
                    style: AppTextStyles.bodyMedium
                        .copyWith(color: AppColors.textSecondary)),
              ],
            ),
          ),
        ),
      );
}
