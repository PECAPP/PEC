import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/faculty_top_nav_bar.dart';

class AcademicCalendarScreen extends StatefulWidget {
  const AcademicCalendarScreen({super.key});

  @override
  State<AcademicCalendarScreen> createState() => _AcademicCalendarScreenState();
}

class _AcademicCalendarScreenState extends State<AcademicCalendarScreen> {
  late DateTime _displayedMonth;
  late DateTime _selectedDay;

  final List<_CalendarEvent> _events = [
    _CalendarEvent(
      date: DateTime(2026, 4, 16),
      title: 'Mid Sem Exam Starts',
      category: 'EXAM',
      color: AppColors.error,
    ),
    _CalendarEvent(
      date: DateTime(2026, 4, 18),
      title: 'Workshop: Outcome Based Education',
      category: 'WORKSHOP',
      color: AppColors.info,
    ),
    _CalendarEvent(
      date: DateTime(2026, 4, 22),
      title: 'Faculty Orientation Session',
      category: 'ORIENTATION',
      color: AppColors.warning,
    ),
    _CalendarEvent(
      date: DateTime(2026, 4, 25),
      title: 'Departmental Briefing',
      category: 'BRIEFING',
      color: AppColors.success,
    ),
    _CalendarEvent(
      date: DateTime(2026, 4, 29),
      title: 'Holiday: Campus Foundation Day',
      category: 'HOLIDAY',
      color: AppColors.gold,
    ),
  ];

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _displayedMonth = DateTime(now.year, now.month);
    _selectedDay = DateTime(now.year, now.month, now.day);
  }

  @override
  Widget build(BuildContext context) {
    final isWide = MediaQuery.of(context).size.width >= 960;
    final isCompact = MediaQuery.of(context).size.width < 420;

    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: const FacultyTopNavBar(),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              const Color(0xFF17140F),
              const Color(0xFF0F0D0A),
              AppColors.bgDark,
            ],
          ),
        ),
        child: SingleChildScrollView(
          padding: EdgeInsets.all(isCompact ? 12 : AppDimensions.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _SectionHeader(
                isCompact: isCompact,
                onJumpToToday: _jumpToToday,
              ),
              const SizedBox(height: AppDimensions.md),
              if (isWide)
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      flex: 7,
                      child: _CalendarPanel(
                        displayedMonth: _displayedMonth,
                        selectedDay: _selectedDay,
                        events: _events,
                        isCompact: isCompact,
                        onSelectDay: _selectDay,
                        onPreviousMonth: _showPreviousMonth,
                        onNextMonth: _showNextMonth,
                      ),
                    ),
                    const SizedBox(width: AppDimensions.md),
                    SizedBox(
                      width: 310,
                      child: _DailyBriefCard(
                        selectedDay: _selectedDay,
                        events: _eventsFor(_selectedDay),
                      ),
                    ),
                  ],
                )
              else
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _CalendarPanel(
                      displayedMonth: _displayedMonth,
                      selectedDay: _selectedDay,
                      events: _events,
                      isCompact: isCompact,
                      onSelectDay: _selectDay,
                      onPreviousMonth: _showPreviousMonth,
                      onNextMonth: _showNextMonth,
                    ),
                    const SizedBox(height: AppDimensions.md),
                    _DailyBriefCard(
                      selectedDay: _selectedDay,
                      events: _eventsFor(_selectedDay),
                    ),
                  ],
                ),
              const SizedBox(height: AppDimensions.md),
              _RefineScopeBar(isCompact: isCompact),
              const SizedBox(height: AppDimensions.lg),
            ],
          ),
        ),
      ),
    );
  }

  void _selectDay(DateTime day) {
    setState(() => _selectedDay = day);
  }

  void _showPreviousMonth() {
    setState(() {
      _displayedMonth = DateTime(_displayedMonth.year, _displayedMonth.month - 1);
    });
  }

  void _showNextMonth() {
    setState(() {
      _displayedMonth = DateTime(_displayedMonth.year, _displayedMonth.month + 1);
    });
  }

  void _jumpToToday() {
    final now = DateTime.now();
    setState(() {
      _displayedMonth = DateTime(now.year, now.month);
      _selectedDay = DateTime(now.year, now.month, now.day);
    });
  }

  List<_CalendarEvent> _eventsFor(DateTime day) {
    return _events.where((event) => _sameDay(event.date, day)).toList()
      ..sort((a, b) => a.category.compareTo(b.category));
  }

  bool _sameDay(DateTime a, DateTime b) {
    return a.year == b.year && a.month == b.month && a.day == b.day;
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({
    required this.isCompact,
    required this.onJumpToToday,
  });

  final bool isCompact;
  final VoidCallback onJumpToToday;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppDimensions.md),
      decoration: BoxDecoration(
        color: AppColors.surfaceDark.withValues(alpha: 0.85),
        border: Border.all(color: AppColors.borderDark),
      ),
      child: Wrap(
        spacing: AppDimensions.md,
        runSpacing: AppDimensions.md,
        alignment: WrapAlignment.spaceBetween,
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 430),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                RichText(
                  text: TextSpan(
                    children: [
                      TextSpan(
                        text: 'ACADEMIC ',
                        style: AppTextStyles.heading3.copyWith(
                          letterSpacing: 0.6,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      TextSpan(
                        text: 'CALENDAR',
                        style: AppTextStyles.heading3.copyWith(
                          letterSpacing: 0.6,
                          fontWeight: FontWeight.w800,
                          color: AppColors.gold,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Institutional milestones • PEC campus events • Examination schedules',
                  style: AppTextStyles.caption.copyWith(
                    color: AppColors.textSecondary,
                    letterSpacing: 0.4,
                    fontSize: 10,
                  ),
                ),
              ],
            ),
          ),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _HeaderActionButton(
                label: 'JUMP TO TODAY',
                filled: true,
                onTap: onJumpToToday,
              ),
              _HeaderActionButton(
                label: isCompact ? 'PROBE' : 'PROBE EVENTS...',
                filled: false,
                onTap: () {},
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _HeaderActionButton extends StatelessWidget {
  const _HeaderActionButton({
    required this.label,
    required this.filled,
    required this.onTap,
  });

  final String label;
  final bool filled;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: filled ? AppColors.gold : AppColors.transparent,
      shape: RoundedRectangleBorder(
        side: BorderSide(color: filled ? AppColors.goldDark : AppColors.borderDark),
      ),
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (!filled) ...[
                const Icon(Icons.search_rounded, size: 14, color: AppColors.textMuted),
                const SizedBox(width: 6),
              ],
              Text(
                label,
                style: AppTextStyles.labelSmall.copyWith(
                  color: filled ? AppColors.bgDark : AppColors.textPrimary,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.8,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _CalendarPanel extends StatelessWidget {
  const _CalendarPanel({
    required this.displayedMonth,
    required this.selectedDay,
    required this.events,
    required this.isCompact,
    required this.onSelectDay,
    required this.onPreviousMonth,
    required this.onNextMonth,
  });

  final DateTime displayedMonth;
  final DateTime selectedDay;
  final List<_CalendarEvent> events;
  final bool isCompact;
  final ValueChanged<DateTime> onSelectDay;
  final VoidCallback onPreviousMonth;
  final VoidCallback onNextMonth;

  static const _weekLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  @override
  Widget build(BuildContext context) {
    final firstDay = DateTime(displayedMonth.year, displayedMonth.month, 1);
    final startOffset = firstDay.weekday % 7;
    final daysInMonth = DateUtils.getDaysInMonth(displayedMonth.year, displayedMonth.month);
    final totalCells = ((startOffset + daysInMonth + 6) ~/ 7) * 7;

    return Container(
      decoration: BoxDecoration(
        color: AppColors.surfaceDark.withValues(alpha: 0.84),
        border: Border.all(color: AppColors.borderDark),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppDimensions.md),
        child: Column(
          children: [
            Row(
              children: [
                Expanded(
                  child: RichText(
                    text: TextSpan(
                      children: [
                        TextSpan(
                          text: DateFormat('MMMM').format(displayedMonth).toUpperCase(),
                          style: AppTextStyles.heading1.copyWith(
                            fontWeight: FontWeight.w800,
                            letterSpacing: 0.5,
                          ),
                        ),
                        TextSpan(
                          text: ' ${displayedMonth.year}',
                          style: AppTextStyles.heading1.copyWith(
                            color: AppColors.textMuted,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                _MonthButton(icon: Icons.chevron_left, onTap: onPreviousMonth),
                const SizedBox(width: 6),
                _MonthButton(icon: Icons.chevron_right, onTap: onNextMonth),
              ],
            ),
            const SizedBox(height: AppDimensions.md),
            const Divider(color: AppColors.borderDark, height: 1),
            const SizedBox(height: AppDimensions.md),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _weekLabels.length,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 7,
                childAspectRatio: 1.65,
              ),
              itemBuilder: (_, i) {
                return Center(
                  child: Text(
                    _weekLabels[i],
                    style: AppTextStyles.caption.copyWith(
                      fontSize: 10,
                      letterSpacing: 0.5,
                    ),
                  ),
                );
              },
            ),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: totalCells,
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 7,
                childAspectRatio: isCompact ? 0.78 : 0.9,
                mainAxisSpacing: 6,
                crossAxisSpacing: 6,
              ),
              itemBuilder: (_, i) {
                if (i < startOffset || i >= startOffset + daysInMonth) {
                  return const SizedBox.shrink();
                }

                final dayNumber = i - startOffset + 1;
                final dayDate = DateTime(displayedMonth.year, displayedMonth.month, dayNumber);
                final dayEvents = events.where((e) => _sameDay(e.date, dayDate)).toList();
                final isSelected = _sameDay(dayDate, selectedDay);

                return _DayCell(
                  day: dayNumber,
                  selected: isSelected,
                  markerColor: dayEvents.isNotEmpty ? dayEvents.first.color : null,
                  markerLabel: dayEvents.isNotEmpty ? dayEvents.first.category : null,
                  onTap: () => onSelectDay(dayDate),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  bool _sameDay(DateTime a, DateTime b) {
    return a.year == b.year && a.month == b.month && a.day == b.day;
  }
}

class _MonthButton extends StatelessWidget {
  const _MonthButton({required this.icon, required this.onTap});

  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.cardDark,
      shape: RoundedRectangleBorder(
        side: BorderSide(color: AppColors.borderDark),
      ),
      child: InkWell(
        onTap: onTap,
        child: SizedBox(
          width: 40,
          height: 34,
          child: Icon(icon, color: AppColors.textMuted, size: 18),
        ),
      ),
    );
  }
}

class _DayCell extends StatelessWidget {
  const _DayCell({
    required this.day,
    required this.selected,
    required this.onTap,
    this.markerColor,
    this.markerLabel,
  });

  final int day;
  final bool selected;
  final VoidCallback onTap;
  final Color? markerColor;
  final String? markerLabel;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: selected ? AppColors.gold : AppColors.cardDark.withValues(alpha: 0.22),
      shape: RoundedRectangleBorder(
        side: BorderSide(
          color: selected ? AppColors.gold : AppColors.borderDark,
          width: 1,
        ),
      ),
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(8),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '$day',
                style: AppTextStyles.labelLarge.copyWith(
                  color: selected ? AppColors.bgDark : AppColors.textPrimary,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const Spacer(),
              if (markerLabel != null && markerColor != null)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                  decoration: BoxDecoration(
                    color: markerColor!.withValues(alpha: selected ? 0.3 : 0.15),
                    borderRadius: BorderRadius.circular(3),
                  ),
                  child: Text(
                    markerLabel!,
                    overflow: TextOverflow.ellipsis,
                    style: AppTextStyles.caption.copyWith(
                      color: selected ? AppColors.bgDark : markerColor,
                      fontSize: 8,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.4,
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _DailyBriefCard extends StatelessWidget {
  const _DailyBriefCard({required this.selectedDay, required this.events});

  final DateTime selectedDay;
  final List<_CalendarEvent> events;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: AppColors.surfaceDark.withValues(alpha: 0.84),
        border: Border.all(color: AppColors.borderDark),
      ),
      padding: const EdgeInsets.all(AppDimensions.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'DAILY BRIEF',
            style: AppTextStyles.labelLarge.copyWith(fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 2),
          Text(
            DateFormat('EEEE • MMM d').format(selectedDay).toUpperCase(),
            style: AppTextStyles.caption.copyWith(
              color: AppColors.gold,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: AppDimensions.lg),
          if (events.isEmpty)
            Padding(
              padding: const EdgeInsets.only(bottom: AppDimensions.lg),
              child: Text(
                'STRUCTURAL VOID\nNO SYSTEM-MAPPED EVENTS FOR THIS COORDINATE.',
                style: AppTextStyles.caption.copyWith(
                  color: AppColors.textMuted,
                  height: 1.8,
                  letterSpacing: 0.5,
                ),
              ),
            )
          else
            ...events.map(
              (event) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      margin: const EdgeInsets.only(top: 4),
                      decoration: BoxDecoration(color: event.color, shape: BoxShape.circle),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            event.title,
                            style: AppTextStyles.bodySmall.copyWith(
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            event.category,
                            style: AppTextStyles.caption.copyWith(
                              color: event.color,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          const Divider(color: AppColors.borderDark),
          const SizedBox(height: AppDimensions.sm),
          Text(
            'INDEX',
            style: AppTextStyles.caption.copyWith(
              color: AppColors.textSecondary,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: AppDimensions.sm),
          Wrap(
            spacing: 10,
            runSpacing: 8,
            children: const [
              _LegendChip(label: 'HOLIDAY', color: AppColors.gold),
              _LegendChip(label: 'EXAM', color: AppColors.error),
              _LegendChip(label: 'EVENT', color: AppColors.info),
              _LegendChip(label: 'WORKSHOP', color: AppColors.warning),
              _LegendChip(label: 'ORIENTATION', color: AppColors.success),
            ],
          ),
        ],
      ),
    );
  }
}

class _LegendChip extends StatelessWidget {
  const _LegendChip({required this.label, required this.color});

  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 7,
          height: 7,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 5),
        Text(
          label,
          style: AppTextStyles.caption.copyWith(
            fontSize: 10,
            letterSpacing: 0.4,
          ),
        ),
      ],
    );
  }
}

class _RefineScopeBar extends StatelessWidget {
  const _RefineScopeBar({required this.isCompact});

  final bool isCompact;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppDimensions.md),
      decoration: BoxDecoration(
        color: AppColors.surfaceDark.withValues(alpha: 0.84),
        border: Border.all(color: AppColors.borderDark),
      ),
      child: Wrap(
        spacing: 10,
        runSpacing: 10,
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.filter_alt_outlined, color: AppColors.gold, size: 14),
              const SizedBox(width: 8),
              Text(
                'REFINE SCOPE',
                style: AppTextStyles.labelSmall.copyWith(letterSpacing: 0.7),
              ),
            ],
          ),
          _FilterSelect(label: 'ALL TYPES', minWidth: isCompact ? 130 : 150),
          _FilterSelect(label: 'ALL CATEGORIES', minWidth: isCompact ? 150 : 180),
        ],
      ),
    );
  }
}

class _FilterSelect extends StatelessWidget {
  const _FilterSelect({required this.label, required this.minWidth});

  final String label;
  final double minWidth;

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: BoxConstraints(minWidth: minWidth, maxWidth: 220),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 9),
      decoration: BoxDecoration(
        color: AppColors.bgDark,
        border: Border.all(color: AppColors.borderDark),
      ),
      child: Row(
        children: [
          Expanded(
            child: Text(
              label,
              overflow: TextOverflow.ellipsis,
              style: AppTextStyles.caption.copyWith(
                color: AppColors.textPrimary,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.4,
              ),
            ),
          ),
          const SizedBox(width: 6),
          const Icon(Icons.keyboard_arrow_down_rounded, size: 18, color: AppColors.textMuted),
        ],
      ),
    );
  }
}

class _CalendarEvent {
  const _CalendarEvent({
    required this.date,
    required this.title,
    required this.category,
    required this.color,
  });

  final DateTime date;
  final String title;
  final String category;
  final Color color;
}
