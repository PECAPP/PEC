import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'dart:math';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/faculty_empty_state.dart';
import '../../../../shared/widgets/faculty_shimmer.dart';
import '../../../../shared/widgets/faculty_top_nav_bar.dart';
import '../../data/models/exam_plan_item.dart';
import '../providers/examinations_provider.dart';

class ExaminationsScreen extends ConsumerWidget {
  const ExaminationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(examinationsProvider);
    final notifier = ref.read(examinationsProvider.notifier);
    final items = state.filtered;

    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: const FacultyTopNavBar(),
      body: LayoutBuilder(
        builder: (context, constraints) {
          final isMobile = constraints.maxWidth < 780;

          if (state.loading) {
            return FacultyShimmer(
              child: ListView(
                padding: const EdgeInsets.all(AppDimensions.md),
                children: List.generate(
                  7,
                  (_) => const Padding(
                    padding: EdgeInsets.only(bottom: 10),
                    child: ShimmerBox(height: 72),
                  ),
                ),
              ),
            );
          }

          return Column(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 14, 16, 10),
                child: _ExamFilters(
                  isMobile: isMobile,
                  selectedClass: state.selectedClass,
                  selectedSubject: state.selectedSubject,
                  selectedType: state.selectedType,
                  upcomingOnly: state.upcomingOnly,
                  classOptions: state.classOptions,
                  subjectOptions: state.subjectOptions,
                  typeOptions: state.typeOptions,
                  onClassChanged: notifier.setClassFilter,
                  onSubjectChanged: notifier.setSubjectFilter,
                  onTypeChanged: notifier.setTypeFilter,
                  onUpcomingChanged: notifier.setUpcomingOnly,
                ),
              ),
              if (state.error != null)
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
                  child: Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      state.error!,
                      style: AppTextStyles.caption.copyWith(color: AppColors.warning),
                    ),
                  ),
                ),
              Expanded(
                child: items.isEmpty
                    ? const FacultyEmptyState(
                        title: 'No examinations found',
                        description: 'Try changing date, subject, class or type filters.',
                        icon: Icons.fact_check_outlined,
                      )
                    : isMobile
                        ? _MobileExamList(items: items)
                        : _DesktopExamTable(items: items),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _ExamFilters extends StatelessWidget {
  const _ExamFilters({
    required this.isMobile,
    required this.selectedClass,
    required this.selectedSubject,
    required this.selectedType,
    required this.upcomingOnly,
    required this.classOptions,
    required this.subjectOptions,
    required this.typeOptions,
    required this.onClassChanged,
    required this.onSubjectChanged,
    required this.onTypeChanged,
    required this.onUpcomingChanged,
  });

  final bool isMobile;
  final String selectedClass;
  final String selectedSubject;
  final String selectedType;
  final bool upcomingOnly;
  final List<String> classOptions;
  final List<String> subjectOptions;
  final List<String> typeOptions;
  final ValueChanged<String> onClassChanged;
  final ValueChanged<String> onSubjectChanged;
  final ValueChanged<String> onTypeChanged;
  final ValueChanged<bool> onUpcomingChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppDimensions.md),
      decoration: BoxDecoration(
        color: AppColors.surfaceDark,
        border: Border.all(color: AppColors.borderDark),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Upcoming Exams', style: AppTextStyles.heading3.copyWith(fontWeight: FontWeight.w800)),
          const SizedBox(height: 2),
          Text(
            'Date-wise plan with subject and class schedule',
            style: AppTextStyles.caption,
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              _SelectField(
                width: isMobile ? double.infinity : 260,
                value: selectedClass,
                items: classOptions,
                onChanged: onClassChanged,
              ),
              _SelectField(
                width: isMobile ? double.infinity : 220,
                value: selectedSubject,
                items: subjectOptions,
                onChanged: onSubjectChanged,
              ),
              _SelectField(
                width: isMobile ? double.infinity : 190,
                value: selectedType,
                items: typeOptions,
                onChanged: onTypeChanged,
              ),
              SizedBox(
                width: isMobile ? double.infinity : 170,
                child: InkWell(
                  onTap: () => onUpcomingChanged(!upcomingOnly),
                  child: Container(
                    height: 48,
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: AppColors.bgDark,
                      border: Border.all(color: AppColors.borderDark),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          upcomingOnly ? 'Upcoming only' : 'All dates',
                          style: AppTextStyles.bodySmall.copyWith(color: AppColors.textPrimary),
                        ),
                        Icon(
                          upcomingOnly ? Icons.toggle_on : Icons.toggle_off,
                          color: upcomingOnly ? AppColors.gold : AppColors.textMuted,
                          size: 24,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _SelectField extends StatelessWidget {
  const _SelectField({
    required this.width,
    required this.value,
    required this.items,
    required this.onChanged,
  });

  final double width;
  final String value;
  final List<String> items;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: width,
      child: DropdownButtonFormField<String>(
        initialValue: items.contains(value) ? value : items.first,
        isExpanded: true,
        dropdownColor: AppColors.surfaceDark,
        iconEnabledColor: AppColors.textMuted,
        style: AppTextStyles.bodySmall.copyWith(color: AppColors.textPrimary),
        decoration: InputDecoration(
          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          filled: true,
          fillColor: AppColors.bgDark,
          enabledBorder: OutlineInputBorder(
            borderSide: BorderSide(color: AppColors.borderDark),
            borderRadius: BorderRadius.zero,
          ),
          focusedBorder: const OutlineInputBorder(
            borderSide: BorderSide(color: AppColors.gold),
            borderRadius: BorderRadius.zero,
          ),
        ),
        items: items
            .map(
              (item) => DropdownMenuItem<String>(
                value: item,
                child: Text(
                  item,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            )
            .toList(),
        onChanged: (value) {
          if (value != null) onChanged(value);
        },
      ),
    );
  }
}

class _DesktopExamTable extends StatelessWidget {
  const _DesktopExamTable({required this.items});

  final List<ExamPlanItem> items;

  @override
  Widget build(BuildContext context) {
    final groupedCount = <String, int>{};
    for (final item in items) {
      final k = DateFormat('yyyy-MM-dd').format(item.date);
      groupedCount[k] = (groupedCount[k] ?? 0) + 1;
    }

    final usedCount = <String, int>{};
    final screenWidth = MediaQuery.of(context).size.width;
    final minTableWidth = screenWidth < 1200 ? screenWidth - 32 : 1100.0;
    final tableWidth = max(minTableWidth, 980.0);

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.surfaceDark,
          border: Border.all(color: AppColors.borderDark),
        ),
        child: SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: ConstrainedBox(
            constraints: BoxConstraints(minWidth: tableWidth),
            child: SizedBox(
              width: tableWidth,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const _DesktopHeaderRow(),
                  ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: items.length,
                    separatorBuilder: (_, index) => Divider(color: AppColors.borderDark, height: 1),
                    itemBuilder: (context, index) {
                      final exam = items[index];
                      final key = DateFormat('yyyy-MM-dd').format(exam.date);
                      final countSeen = usedCount[key] ?? 0;
                      usedCount[key] = countSeen + 1;
                      final isFirstForDate = countSeen == 0;

                      return _DesktopDataRow(
                        exam: exam,
                        showDate: isFirstForDate,
                        dateSpanCount: groupedCount[key] ?? 1,
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _DesktopHeaderRow extends StatelessWidget {
  const _DesktopHeaderRow();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 38,
      color: AppColors.cardDark,
      child: Row(
        children: [
          _cell('STATUS & DATE', 170, true),
          _cell('COURSE DETAILS', 430, true),
          _cell('TIME SLOT', 190, true),
          _cell('VENUE', 190, true),
          _cell('TYPE', 120, true),
        ],
      ),
    );
  }

  Widget _cell(String label, double width, bool heading) {
    return SizedBox(
      width: width,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10),
        child: Text(
          label,
          overflow: TextOverflow.ellipsis,
          style: AppTextStyles.caption.copyWith(
            color: heading ? AppColors.textSecondary : AppColors.textPrimary,
            fontWeight: FontWeight.w700,
            letterSpacing: 0.5,
          ),
        ),
      ),
    );
  }
}

class _DesktopDataRow extends StatelessWidget {
  const _DesktopDataRow({
    required this.exam,
    required this.showDate,
    required this.dateSpanCount,
  });

  final ExamPlanItem exam;
  final bool showDate;
  final int dateSpanCount;

  @override
  Widget build(BuildContext context) {
    final today = DateTime.now();
    final t = DateTime(today.year, today.month, today.day);
    final daysLeft = exam.date.difference(t).inDays;

    return SizedBox(
      height: 66,
      child: Row(
        children: [
          SizedBox(
            width: 170,
            child: showDate
                ? Padding(
                    padding: EdgeInsets.only(top: dateSpanCount > 1 ? 4 : 0, left: 10),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: AppColors.cardDark,
                            border: Border.all(color: AppColors.borderDark),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            daysLeft >= 0 ? '${daysLeft}D LEFT' : '${daysLeft.abs()}D AGO',
                            style: AppTextStyles.caption.copyWith(
                              color: daysLeft >= 0 ? AppColors.textSecondary : AppColors.error,
                              fontSize: 9,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Text(
                          DateFormat('dd\nMMM\nEEE').format(exam.date).toUpperCase(),
                          style: AppTextStyles.bodySmall.copyWith(
                            height: 1.25,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textPrimary,
                          ),
                        ),
                      ],
                    ),
                  )
                : const SizedBox.shrink(),
          ),
          SizedBox(
            width: 430,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    exam.subjectCode,
                    style: AppTextStyles.labelLarge.copyWith(fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 1),
                  Text(
                    exam.subjectName,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AppTextStyles.caption.copyWith(color: AppColors.textSecondary),
                  ),
                  Text(
                    exam.classSection,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AppTextStyles.caption.copyWith(color: AppColors.textMuted, fontSize: 10),
                  ),
                ],
              ),
            ),
          ),
          SizedBox(
            width: 190,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 10),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.bgDark,
                    border: Border.all(color: AppColors.borderDark),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(exam.timeSlot, style: AppTextStyles.caption),
                ),
              ),
            ),
          ),
          SizedBox(
            width: 190,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('VENUE', style: AppTextStyles.caption.copyWith(fontSize: 9)),
                  Text(
                    exam.venue,
                    style: AppTextStyles.labelMedium.copyWith(
                      color: AppColors.textPrimary,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ],
              ),
            ),
          ),
          SizedBox(
            width: 120,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 10),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppColors.cardDark,
                    border: Border.all(color: AppColors.borderDark),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    exam.examType.toUpperCase(),
                    style: AppTextStyles.caption.copyWith(fontSize: 9),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _MobileExamList extends StatelessWidget {
  const _MobileExamList({required this.items});

  final List<ExamPlanItem> items;

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      itemCount: items.length,
      itemBuilder: (_, i) => _MobileExamCard(exam: items[i]),
    );
  }
}

class _MobileExamCard extends StatelessWidget {
  const _MobileExamCard({required this.exam});

  final ExamPlanItem exam;

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final daysLeft = exam.date.difference(today).inDays;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.surfaceDark,
        border: Border.all(color: AppColors.borderDark),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  exam.subjectCode,
                  style: AppTextStyles.labelLarge.copyWith(fontWeight: FontWeight.w800),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.cardDark,
                  border: Border.all(color: AppColors.borderDark),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  exam.examType,
                  style: AppTextStyles.caption.copyWith(fontSize: 10),
                ),
              ),
            ],
          ),
          const SizedBox(height: 3),
          Text(
            exam.subjectName,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 10,
            runSpacing: 6,
            children: [
              _meta(Icons.calendar_today_outlined, DateFormat('EEE, dd MMM').format(exam.date)),
              _meta(Icons.access_time_rounded, exam.timeSlot),
              _meta(Icons.class_outlined, exam.classSection),
              _meta(Icons.location_on_outlined, exam.venue),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            daysLeft >= 0 ? '$daysLeft day(s) left' : '${daysLeft.abs()} day(s) ago',
            style: AppTextStyles.caption.copyWith(
              color: daysLeft >= 0 ? AppColors.gold : AppColors.error,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }

  Widget _meta(IconData icon, String text) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 13, color: AppColors.textMuted),
        const SizedBox(width: 4),
        ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 230),
          child: Text(
            text,
            overflow: TextOverflow.ellipsis,
            style: AppTextStyles.caption.copyWith(color: AppColors.textPrimary),
          ),
        ),
      ],
    );
  }
}
