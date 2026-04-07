import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/pec_card.dart';
import '../../../../shared/widgets/pec_empty_state.dart';
import '../../../../shared/widgets/pec_shimmer.dart';
import '../../data/models/exam_model.dart';
import '../providers/exam_provider.dart';

class ExamListScreen extends ConsumerStatefulWidget {
  const ExamListScreen({super.key});

  static const double _maxContentWidth = 900;

  @override
  ConsumerState<ExamListScreen> createState() => _ExamListScreenState();
}

class _ExamListScreenState extends ConsumerState<ExamListScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tab;

  @override
  void initState() {
    super.initState();
    _tab = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tab.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final examsAsync = ref.watch(examsProvider);
    final width = MediaQuery.of(context).size.width;
    final horizontalPadding = width >= 900
        ? AppDimensions.lg
        : width >= 600
            ? AppDimensions.md
            : AppDimensions.sm;

    return Scaffold(
      appBar: AppBar(
        title: const Text('EXAMINATIONS'),
        bottom: TabBar(
          controller: _tab,
          labelColor: AppColors.yellow,
          indicatorColor: AppColors.yellow,
          tabs: const [Tab(text: 'UPCOMING'), Tab(text: 'PAST')],
        ),
      ),
      body: SafeArea(
        top: false,
        child: Center(
          child: ConstrainedBox(
            constraints:
                const BoxConstraints(maxWidth: ExamListScreen._maxContentWidth),
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
              child: examsAsync.when(
                loading: () => _shimmer(),
                error: (_, __) => _ExamsLoadFallback(
                  onRetry: () => ref.invalidate(examsProvider),
                ),
                data: (exams) {
                  final upcoming = exams
                      .where((e) => e.status != 'completed')
                      .toList()
                    ..sort((a, b) => a.examDate.compareTo(b.examDate));
                  final past = exams
                      .where((e) => e.status == 'completed')
                      .toList()
                    ..sort((a, b) => b.examDate.compareTo(a.examDate));

                  return TabBarView(
                    controller: _tab,
                    children: [
                      _ExamList(
                          exams: upcoming, emptyLabel: 'No upcoming exams'),
                      _ExamList(exams: past, emptyLabel: 'No past exams'),
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

  Widget _shimmer() => ListView.separated(
        padding:
            const EdgeInsets.fromLTRB(0, AppDimensions.md, 0, AppDimensions.md),
        itemCount: 4,
        separatorBuilder: (_, __) => const SizedBox(height: AppDimensions.sm),
        itemBuilder: (_, __) =>
            const PecShimmerBox(height: 100, width: double.infinity),
      );
}

class _ExamsLoadFallback extends StatelessWidget {
  final VoidCallback onRetry;
  const _ExamsLoadFallback({required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(
            Icons.assignment_outlined,
            size: 42,
            color: AppColors.textSecondaryDark,
          ),
          const SizedBox(height: AppDimensions.sm),
          Text(
            'Could not load examinations right now',
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

class _ExamList extends StatelessWidget {
  final List<ExamModel> exams;
  final String emptyLabel;
  const _ExamList({required this.exams, required this.emptyLabel});

  @override
  Widget build(BuildContext context) {
    if (exams.isEmpty) {
      return PecEmptyState(
        icon: Icons.assignment_outlined,
        title: emptyLabel,
        subtitle: 'Check back later',
      );
    }
    return ListView.separated(
      padding:
          const EdgeInsets.fromLTRB(0, AppDimensions.md, 0, AppDimensions.md),
      itemCount: exams.length,
      separatorBuilder: (_, __) => const SizedBox(height: AppDimensions.sm),
      itemBuilder: (_, i) => _ExamCard(exam: exams[i]),
    );
  }
}

class _ExamCard extends StatelessWidget {
  final ExamModel exam;
  const _ExamCard({required this.exam});

  Color get _typeColor {
    switch (exam.examType.toLowerCase()) {
      case 'midterm':
        return AppColors.blue;
      case 'endterm':
        return AppColors.red;
      case 'quiz':
        return AppColors.green;
      default:
        return AppColors.warning;
    }
  }

  Color get _statusColor {
    switch (exam.status) {
      case 'upcoming':
        return AppColors.blue;
      case 'ongoing':
        return AppColors.green;
      default:
        return AppColors.textSecondary;
    }
  }

  String get _countdownLabel {
    if (exam.status == 'completed') return 'COMPLETED';
    if (exam.status == 'ongoing') return 'ONGOING';
    final d = exam.timeUntil;
    if (d.inDays > 0) return 'IN ${d.inDays}d ${d.inHours.remainder(24)}h';
    if (d.inHours > 0) return 'IN ${d.inHours}h ${d.inMinutes.remainder(60)}m';
    return 'IN ${d.inMinutes}m';
  }

  @override
  Widget build(BuildContext context) {
    return PecCard(
      shadowColor: exam.status == 'upcoming' ? _typeColor : AppColors.black,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(exam.courseName,
                        style: AppTextStyles.labelLarge,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis),
                    Text(exam.courseCode, style: AppTextStyles.caption),
                  ],
                ),
              ),
              const SizedBox(width: AppDimensions.sm),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                color: _typeColor,
                child: Text(exam.examType.toUpperCase(),
                    style: AppTextStyles.labelSmall
                        .copyWith(color: AppColors.black, fontSize: 9)),
              ),
            ],
          ),
          const SizedBox(height: AppDimensions.sm),
          Row(
            children: [
              const Icon(Icons.calendar_today_outlined, size: 14),
              const SizedBox(width: 4),
              Text(
                _formatDate(exam.examDate),
                style: AppTextStyles.bodyMedium,
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                color: exam.status == 'completed'
                    ? AppColors.bgSurface
                    : _statusColor,
                child: Text(
                  _countdownLabel,
                  style: AppTextStyles.labelSmall.copyWith(
                    color: exam.status == 'completed'
                        ? AppColors.textSecondary
                        : AppColors.black,
                    fontSize: 9,
                  ),
                ),
              ),
            ],
          ),
          if (exam.venue != null || exam.duration != null) ...[
            const SizedBox(height: AppDimensions.xs),
            Wrap(
              spacing: AppDimensions.md,
              children: [
                if (exam.venue != null)
                  _InfoChip(Icons.location_on_outlined, exam.venue!),
                if (exam.duration != null)
                  _InfoChip(Icons.timer_outlined, exam.duration!),
              ],
            ),
          ],
        ],
      ),
    );
  }

  String _formatDate(DateTime d) {
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
      'Dec'
    ];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    final hour = d.hour > 12 ? d.hour - 12 : d.hour;
    final ampm = d.hour >= 12 ? 'PM' : 'AM';
    final min = d.minute.toString().padLeft(2, '0');
    return '${days[d.weekday - 1]}, ${d.day} ${months[d.month - 1]} · $hour:$min $ampm';
  }
}

class _InfoChip extends StatelessWidget {
  final IconData icon;
  final String label;
  const _InfoChip(this.icon, this.label);

  @override
  Widget build(BuildContext context) => Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: AppColors.textSecondary),
          const SizedBox(width: 2),
          Text(label, style: AppTextStyles.caption),
        ],
      );
}
