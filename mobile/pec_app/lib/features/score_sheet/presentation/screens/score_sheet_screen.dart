import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../data/models/score_model.dart';
import '../../../../shared/widgets/pec_card.dart';
import '../../../../shared/widgets/pec_empty_state.dart';
import '../providers/score_provider.dart';

class ScoreSheetScreen extends ConsumerStatefulWidget {
  const ScoreSheetScreen({super.key});

  static const double _maxContentWidth = 900;

  @override
  ConsumerState<ScoreSheetScreen> createState() => _ScoreSheetScreenState();
}

class _ScoreSheetScreenState extends ConsumerState<ScoreSheetScreen> {
  int _selectedSemester = 0;

  @override
  Widget build(BuildContext context) {
    final cgpaAsync = ref.watch(cgpaProvider);
    final width = MediaQuery.of(context).size.width;
    final horizontalPadding = width >= 900
        ? AppDimensions.lg
        : width >= 600
            ? AppDimensions.md
            : AppDimensions.sm;

    return Scaffold(
      appBar: AppBar(
        title: const Text('SCORE SHEET'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.invalidate(cgpaProvider),
          ),
        ],
      ),
      body: SafeArea(
        top: false,
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(
                maxWidth: ScoreSheetScreen._maxContentWidth),
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
              child: cgpaAsync.when(
                loading: () => const Center(
                  child: CircularProgressIndicator(color: AppColors.yellow),
                ),
                error: (_, __) => _ScoreLoadFallback(
                  onRetry: () => ref.invalidate(cgpaProvider),
                ),
                data: (cgpaData) {
                  if (cgpaData.semesters.isEmpty) {
                    return const PecEmptyState(
                      icon: Icons.bar_chart_outlined,
                      title: 'No score data yet',
                      subtitle: 'Scores will appear here once published',
                    );
                  }

                  final semesterIndex =
                      _selectedSemester >= cgpaData.semesters.length
                          ? 0
                          : _selectedSemester;
                  final selected = cgpaData.semesters[semesterIndex];

                  return ListView(
                    padding:
                        const EdgeInsets.symmetric(vertical: AppDimensions.md),
                    children: [
                      _ScoreSummaryCard(cgpaData: cgpaData),
                      const SizedBox(height: AppDimensions.md),
                      _SemesterSelector(
                        semesters: cgpaData.semesters,
                        selectedIndex: semesterIndex,
                        onSelect: (index) =>
                            setState(() => _selectedSemester = index),
                      ),
                      const SizedBox(height: AppDimensions.sm),
                      ...selected.subjects.map((s) => Padding(
                            padding:
                                const EdgeInsets.only(bottom: AppDimensions.sm),
                            child: _SubjectScoreCard(score: s),
                          )),
                    ],
                  );
                },
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _ScoreLoadFallback extends StatelessWidget {
  final VoidCallback onRetry;
  const _ScoreLoadFallback({required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(
            Icons.school_outlined,
            size: 42,
            color: AppColors.textSecondaryDark,
          ),
          const SizedBox(height: AppDimensions.sm),
          Text(
            'Could not load score sheet right now',
            style: AppTextStyles.bodyMedium.copyWith(
              color: AppColors.textSecondaryDark,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppDimensions.md),
          SizedBox(
            width: 180,
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

class _ScoreSummaryCard extends StatelessWidget {
  final CgpaData cgpaData;
  const _ScoreSummaryCard({required this.cgpaData});

  @override
  Widget build(BuildContext context) {
    return PecCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Overall Performance', style: AppTextStyles.labelLarge),
          const SizedBox(height: AppDimensions.sm),
          Row(
            children: [
              Expanded(
                child: _MetricChip(
                  title: 'CGPA',
                  value: cgpaData.cgpaLabel,
                  color: AppColors.yellow,
                ),
              ),
              const SizedBox(width: AppDimensions.sm),
              Expanded(
                child: _MetricChip(
                  title: 'Credits',
                  value: '${cgpaData.totalCredits}',
                  color: AppColors.blue,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppDimensions.sm),
          Text(
            cgpaData.classification,
            style: AppTextStyles.bodyMedium
                .copyWith(color: AppColors.textSecondary),
          ),
        ],
      ),
    );
  }
}

class _MetricChip extends StatelessWidget {
  final String title;
  final String value;
  final Color color;
  const _MetricChip(
      {required this.title, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppDimensions.sm),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        border: Border.all(color: color.withValues(alpha: 0.5)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: AppTextStyles.caption),
          const SizedBox(height: 2),
          Text(value, style: AppTextStyles.labelLarge.copyWith(color: color)),
        ],
      ),
    );
  }
}

class _SemesterSelector extends StatelessWidget {
  final List<SemesterResult> semesters;
  final int selectedIndex;
  final ValueChanged<int> onSelect;

  const _SemesterSelector({
    required this.semesters,
    required this.selectedIndex,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 36,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: semesters.length,
        separatorBuilder: (_, __) => const SizedBox(width: AppDimensions.xs),
        itemBuilder: (_, i) {
          final active = i == selectedIndex;
          final s = semesters[i];
          return GestureDetector(
            onTap: () => onSelect(i),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: active ? AppColors.yellow : Colors.transparent,
                border: Border.all(color: AppColors.black, width: 2),
              ),
              child: Text(
                'SEM ${s.semester} · SGPA ${s.sgpa.toStringAsFixed(2)}',
                style: AppTextStyles.labelSmall.copyWith(
                  color: AppColors.black,
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

class _SubjectScoreCard extends StatelessWidget {
  final SubjectScore score;
  const _SubjectScoreCard({required this.score});

  Color get gradeColor {
    switch (score.gradeColor) {
      case 'green':
        return AppColors.green;
      case 'blue':
        return AppColors.blue;
      case 'yellow':
        return AppColors.yellow;
      case 'warning':
        return AppColors.warning;
      case 'red':
        return AppColors.red;
      default:
        return AppColors.textSecondary;
    }
  }

  @override
  Widget build(BuildContext context) {
    return PecCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(score.courseName,
                        style: AppTextStyles.labelLarge,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis),
                    Text(score.courseCode, style: AppTextStyles.caption),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                color: gradeColor.withValues(alpha: 0.2),
                child: Text(
                  score.grade ?? '--',
                  style: AppTextStyles.labelSmall.copyWith(color: gradeColor),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppDimensions.sm),
          Wrap(
            spacing: AppDimensions.md,
            runSpacing: 4,
            children: [
              Text('Credits: ${score.credits}', style: AppTextStyles.caption),
              Text(
                  'Internal: ${score.internalMarks?.toStringAsFixed(1) ?? '--'}',
                  style: AppTextStyles.caption),
              Text(
                  'External: ${score.externalMarks?.toStringAsFixed(1) ?? '--'}',
                  style: AppTextStyles.caption),
              Text('Total: ${score.totalMarks?.toStringAsFixed(1) ?? '--'}',
                  style: AppTextStyles.caption),
            ],
          ),
        ],
      ),
    );
  }
}
