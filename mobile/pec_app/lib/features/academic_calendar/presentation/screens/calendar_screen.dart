import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:table_calendar/table_calendar.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/pec_card.dart';
import '../../../../shared/widgets/pec_error_state.dart';
import '../../../../shared/widgets/pec_shimmer.dart';
import '../../data/models/calendar_event_model.dart';
import '../providers/calendar_provider.dart';

class CalendarScreen extends ConsumerStatefulWidget {
  const CalendarScreen({super.key});

  @override
  ConsumerState<CalendarScreen> createState() => _CalendarScreenState();
}

class _CalendarScreenState extends ConsumerState<CalendarScreen> {
  DateTime _focusedDay = DateTime.now();
  DateTime _selectedDay = DateTime.now();

  String _dateKey(DateTime d) =>
      '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

  @override
  Widget build(BuildContext context) {
    final eventsMapAsync = ref.watch(eventsByDayProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('ACADEMIC CALENDAR'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.invalidate(calendarEventsProvider),
          ),
        ],
      ),
      body: eventsMapAsync.when(
        loading: () => const Center(
            child: CircularProgressIndicator(color: AppColors.yellow)),
        error: (e, _) => PecErrorState(
            message: e.toString(),
            onRetry: () => ref.invalidate(calendarEventsProvider)),
        data: (eventsMap) {
          final selectedEvents = eventsMap[_dateKey(_selectedDay)] ?? [];

          return Column(
            children: [
              // ── Calendar ───────────────────────────────────────────────
              Container(
                decoration: const BoxDecoration(
                  border: Border(
                      bottom: BorderSide(color: AppColors.black, width: 2)),
                ),
                child: TableCalendar<CalendarEventModel>(
                  firstDay: DateTime(2020),
                  lastDay: DateTime(2030),
                  focusedDay: _focusedDay,
                  selectedDayPredicate: (day) => isSameDay(day, _selectedDay),
                  onDaySelected: (selected, focused) {
                    setState(() {
                      _selectedDay = selected;
                      _focusedDay = focused;
                    });
                  },
                  onPageChanged: (focused) =>
                      setState(() => _focusedDay = focused),
                  eventLoader: (day) => eventsMap[_dateKey(day)] ?? [],
                  calendarStyle: CalendarStyle(
                    selectedDecoration: const BoxDecoration(
                        color: AppColors.yellow, shape: BoxShape.rectangle),
                    selectedTextStyle: AppTextStyles.labelLarge
                        .copyWith(color: AppColors.black),
                    todayDecoration: BoxDecoration(
                      border: Border.all(
                          color: AppColors.yellow, width: 2),
                      shape: BoxShape.rectangle,
                    ),
                    todayTextStyle: AppTextStyles.labelLarge,
                    weekendTextStyle: AppTextStyles.bodySmall
                        .copyWith(color: AppColors.red),
                    outsideDaysVisible: false,
                    markerDecoration: const BoxDecoration(
                        color: AppColors.yellow, shape: BoxShape.circle),
                    markersMaxCount: 3,
                    markerSize: 5,
                  ),
                  headerStyle: HeaderStyle(
                    formatButtonVisible: false,
                    titleCentered: true,
                    titleTextStyle: AppTextStyles.labelLarge,
                    leftChevronIcon: const Icon(Icons.chevron_left,
                        color: AppColors.black),
                    rightChevronIcon: const Icon(Icons.chevron_right,
                        color: AppColors.black),
                  ),
                  daysOfWeekStyle: DaysOfWeekStyle(
                    weekdayStyle: AppTextStyles.labelSmall.copyWith(fontSize: 11),
                    weekendStyle: AppTextStyles.labelSmall
                        .copyWith(color: AppColors.red, fontSize: 11),
                  ),
                ),
              ),
              // ── Events list ────────────────────────────────────────────
              Expanded(
                child: selectedEvents.isEmpty
                    ? _NoEvents(day: _selectedDay)
                    : ListView.separated(
                        padding: const EdgeInsets.all(AppDimensions.md),
                        itemCount: selectedEvents.length,
                        separatorBuilder: (_, __) =>
                            const SizedBox(height: AppDimensions.sm),
                        itemBuilder: (_, i) =>
                            _EventCard(event: selectedEvents[i]),
                      ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _EventCard extends StatelessWidget {
  final CalendarEventModel event;
  const _EventCard({required this.event});

  @override
  Widget build(BuildContext context) {
    return PecCard(
      shadowColor: event.dotColor,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(width: 4, color: event.dotColor),
          const SizedBox(width: AppDimensions.sm),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(event.title,
                          style: AppTextStyles.labelLarge,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis),
                    ),
                    const SizedBox(width: AppDimensions.sm),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      color: event.dotColor,
                      child: Text(event.typeLabel,
                          style: AppTextStyles.labelSmall
                              .copyWith(color: AppColors.black, fontSize: 8)),
                    ),
                  ],
                ),
                if (event.description.isNotEmpty) ...[
                  const SizedBox(height: 2),
                  Text(event.description,
                      style: AppTextStyles.bodySmall,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis),
                ],
                if (event.location != null) ...[
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.location_on_outlined, size: 12),
                      const SizedBox(width: 2),
                      Text(event.location!, style: AppTextStyles.caption),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _NoEvents extends StatelessWidget {
  final DateTime day;
  const _NoEvents({required this.day});

  @override
  Widget build(BuildContext context) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.event_available_outlined,
              size: 48, color: AppColors.yellow),
          const SizedBox(height: AppDimensions.md),
          Text(
            'No events on ${day.day} ${months[day.month - 1]}',
            style: AppTextStyles.bodyMedium
                .copyWith(color: AppColors.textSecondary),
          ),
        ],
      ),
    );
  }
}
