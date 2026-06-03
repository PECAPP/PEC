import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/pec_card.dart';
import '../../../../shared/widgets/pec_empty_state.dart';
import '../../../../shared/widgets/pec_error_state.dart';
import '../../../../shared/widgets/pec_shimmer.dart';
import '../../data/models/room_model.dart';
import '../providers/rooms_provider.dart';

class RoomListScreen extends ConsumerStatefulWidget {
  const RoomListScreen({super.key});

  @override
  ConsumerState<RoomListScreen> createState() => _RoomListScreenState();
}

class _RoomListScreenState extends ConsumerState<RoomListScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tab;
  String _search = '';
  String _filterType = '';

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
    return Scaffold(
      appBar: AppBar(
        title: const Text('ROOM BOOKING'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              ref.invalidate(roomsProvider);
              ref.invalidate(myBookingsProvider);
            },
          ),
        ],
        bottom: TabBar(
          controller: _tab,
          labelStyle: AppTextStyles.labelSmall,
          tabs: const [Tab(text: 'AVAILABLE'), Tab(text: 'MY BOOKINGS')],
        ),
      ),
      body: TabBarView(
        controller: _tab,
        children: [
          _AvailableTab(
            search: _search,
            filterType: _filterType,
            onSearchChange: (v) => setState(() => _search = v.toLowerCase()),
            onTypeChange: (v) => setState(() => _filterType = v),
          ),
          const _BookingsTab(),
        ],
      ),
    );
  }
}

class _AvailableTab extends ConsumerWidget {
  final String search, filterType;
  final ValueChanged<String> onSearchChange, onTypeChange;
  const _AvailableTab(
      {required this.search,
      required this.filterType,
      required this.onSearchChange,
      required this.onTypeChange});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final roomsAsync = ref.watch(roomsProvider);

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(AppDimensions.md),
          child: Column(
            children: [
              TextField(
                onChanged: onSearchChange,
                decoration: InputDecoration(
                  hintText: 'Search rooms…',
                  hintStyle: AppTextStyles.bodySmall,
                  prefixIcon: const Icon(Icons.search, size: 20),
                  border: const OutlineInputBorder(
                      borderSide: BorderSide(color: AppColors.black, width: 2)),
                  enabledBorder: const OutlineInputBorder(
                      borderSide: BorderSide(color: AppColors.black, width: 2)),
                  focusedBorder: const OutlineInputBorder(
                      borderSide: BorderSide(color: AppColors.yellow, width: 2)),
                  filled: true,
                  contentPadding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
              ),
              const SizedBox(height: AppDimensions.sm),
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    for (final t in ['', 'classroom', 'lab', 'seminar', 'auditorium', 'conference'])
                      Padding(
                        padding: const EdgeInsets.only(right: AppDimensions.xs),
                        child: _Chip(
                          label: t.isEmpty ? 'ALL' : t.toUpperCase(),
                          active: filterType == t,
                          onTap: () => onTypeChange(t),
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: roomsAsync.when(
            loading: () => ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: AppDimensions.md),
              itemCount: 5,
              separatorBuilder: (_, __) =>
                  const SizedBox(height: AppDimensions.sm),
              itemBuilder: (_, __) =>
                  const PecShimmerBox(height: 90, width: double.infinity),
            ),
            error: (e, _) => PecErrorState(
                message: e.toString(),
                onRetry: () => ref.invalidate(roomsProvider)),
            data: (rooms) {
              final filtered = rooms.where((r) {
                final matchType = filterType.isEmpty || r.type == filterType;
                final matchSearch = search.isEmpty ||
                    r.name.toLowerCase().contains(search) ||
                    r.building.toLowerCase().contains(search);
                return matchType && matchSearch && r.isAvailable;
              }).toList();

              if (filtered.isEmpty) {
                return const PecEmptyState(
                    icon: Icons.meeting_room_outlined,
                    title: 'No rooms available');
              }

              return ListView.separated(
                padding: const EdgeInsets.fromLTRB(
                    AppDimensions.md, 0, AppDimensions.md, AppDimensions.md),
                itemCount: filtered.length,
                separatorBuilder: (_, __) =>
                    const SizedBox(height: AppDimensions.sm),
                itemBuilder: (_, i) => _RoomCard(room: filtered[i]),
              );
            },
          ),
        ),
      ],
    );
  }
}

class _RoomCard extends ConsumerWidget {
  final RoomModel room;
  const _RoomCard({required this.room});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return PecCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 48,
                height: 48,
                color: room.typeColor.withValues(alpha: 0.15),
                child: Icon(room.typeIcon, color: room.typeColor, size: 24),
              ),
              const SizedBox(width: AppDimensions.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(room.name, style: AppTextStyles.labelLarge),
                    Text('${room.building} · ${room.typeLabel} · ${room.capacity} seats',
                        style: AppTextStyles.caption),
                  ],
                ),
              ),
              GestureDetector(
                onTap: () => _showBookDialog(context, ref, room),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.yellow,
                    border: Border.all(color: AppColors.black, width: 1.5),
                    boxShadow: const [
                      BoxShadow(offset: Offset(2, 2), color: AppColors.black)
                    ],
                  ),
                  child: Text('BOOK',
                      style: AppTextStyles.labelSmall
                          .copyWith(color: AppColors.black, fontSize: 10)),
                ),
              ),
            ],
          ),
          if (room.amenities.isNotEmpty) ...[
            const SizedBox(height: AppDimensions.xs),
            Wrap(
              spacing: 4,
              children: room.amenities
                  .map((a) => Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 6, vertical: 2),
                        color: AppColors.bgSurface,
                        child: Text(a,
                            style: AppTextStyles.caption
                                .copyWith(fontSize: 9)),
                      ))
                  .toList(),
            ),
          ],
        ],
      ),
    );
  }

  void _showBookDialog(
      BuildContext context, WidgetRef ref, RoomModel room) {
    showDialog(
      context: context,
      builder: (_) => _BookDialog(room: room),
    );
  }
}

class _BookDialog extends ConsumerStatefulWidget {
  final RoomModel room;
  const _BookDialog({required this.room});

  @override
  ConsumerState<_BookDialog> createState() => _BookDialogState();
}

class _BookDialogState extends ConsumerState<_BookDialog> {
  final _purposeCtrl = TextEditingController();
  DateTime _date = DateTime.now();
  TimeOfDay _startTime = TimeOfDay.now();
  TimeOfDay _endTime = TimeOfDay(
      hour: TimeOfDay.now().hour + 1, minute: TimeOfDay.now().minute);

  @override
  void dispose() {
    _purposeCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bookingAsync = ref.watch(bookingNotifierProvider);

    return AlertDialog(
      title: Text('Book ${widget.room.name}'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            TextField(
              controller: _purposeCtrl,
              decoration: const InputDecoration(labelText: 'Purpose'),
            ),
            const SizedBox(height: AppDimensions.sm),
            ListTile(
              contentPadding: EdgeInsets.zero,
              title: Text(DateFormat('dd MMM yyyy').format(_date),
                  style: AppTextStyles.bodySmall),
              leading: const Icon(Icons.calendar_today_outlined, size: 18),
              onTap: () async {
                final picked = await showDatePicker(
                  context: context,
                  initialDate: _date,
                  firstDate: DateTime.now(),
                  lastDate: DateTime.now().add(const Duration(days: 30)),
                );
                if (picked != null) setState(() => _date = picked);
              },
            ),
            Row(
              children: [
                Expanded(
                  child: ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: Text(_startTime.format(context),
                        style: AppTextStyles.bodySmall),
                    leading:
                        const Icon(Icons.access_time_outlined, size: 18),
                    onTap: () async {
                      final t = await showTimePicker(
                          context: context, initialTime: _startTime);
                      if (t != null) setState(() => _startTime = t);
                    },
                  ),
                ),
                const Text('→'),
                Expanded(
                  child: ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: Text(_endTime.format(context),
                        style: AppTextStyles.bodySmall),
                    leading:
                        const Icon(Icons.access_time_outlined, size: 18),
                    onTap: () async {
                      final t = await showTimePicker(
                          context: context, initialTime: _endTime);
                      if (t != null) setState(() => _endTime = t);
                    },
                  ),
                ),
              ],
            ),
            if (bookingAsync is AsyncError)
              Text(bookingAsync.error.toString(),
                  style: AppTextStyles.bodySmall
                      .copyWith(color: AppColors.red)),
            if (bookingAsync.value != null)
              Text('Booking submitted! Status: ${bookingAsync.value!.status}',
                  style: AppTextStyles.bodySmall
                      .copyWith(color: AppColors.green)),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () {
            ref.read(bookingNotifierProvider.notifier).reset();
            Navigator.pop(context);
          },
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.yellow),
          onPressed: bookingAsync.isLoading
              ? null
              : () async {
                  final purpose = _purposeCtrl.text.trim();
                  if (purpose.isEmpty) return;
                  final start = DateTime(_date.year, _date.month, _date.day,
                      _startTime.hour, _startTime.minute);
                  final end = DateTime(_date.year, _date.month, _date.day,
                      _endTime.hour, _endTime.minute);
                  await ref.read(bookingNotifierProvider.notifier).book(
                        roomId: widget.room.id,
                        purpose: purpose,
                        start: start,
                        end: end,
                      );
                },
          child: bookingAsync.isLoading
              ? const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(
                      strokeWidth: 2, color: AppColors.black))
              : Text('Book', style: AppTextStyles.labelSmall),
        ),
      ],
    );
  }
}

class _BookingsTab extends ConsumerWidget {
  const _BookingsTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bookingsAsync = ref.watch(myBookingsProvider);

    return bookingsAsync.when(
      loading: () => ListView.separated(
        padding: const EdgeInsets.all(AppDimensions.md),
        itemCount: 4,
        separatorBuilder: (_, __) =>
            const SizedBox(height: AppDimensions.sm),
        itemBuilder: (_, __) =>
            const PecShimmerBox(height: 90, width: double.infinity),
      ),
      error: (e, _) => PecErrorState(
          message: e.toString(),
          onRetry: () => ref.invalidate(myBookingsProvider)),
      data: (bookings) {
        if (bookings.isEmpty) {
          return const PecEmptyState(
              icon: Icons.event_available_outlined,
              title: 'No bookings yet',
              subtitle: 'Book a room from the Available tab');
        }
        return ListView.separated(
          padding: const EdgeInsets.all(AppDimensions.md),
          itemCount: bookings.length,
          separatorBuilder: (_, __) =>
              const SizedBox(height: AppDimensions.sm),
          itemBuilder: (_, i) => _BookingCard(booking: bookings[i]),
        );
      },
    );
  }
}

class _BookingCard extends StatelessWidget {
  final RoomBooking booking;
  const _BookingCard({required this.booking});

  @override
  Widget build(BuildContext context) {
    final fmt = DateFormat('dd MMM, hh:mm a');
    return PecCard(
      child: Row(
        children: [
          Container(width: 4, color: booking.statusColor),
          const SizedBox(width: AppDimensions.sm),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(booking.roomName, style: AppTextStyles.labelLarge),
                Text(booking.purpose,
                    style: AppTextStyles.bodySmall,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis),
                Text(
                    '${fmt.format(booking.startTime)} → ${DateFormat('hh:mm a').format(booking.endTime)}',
                    style: AppTextStyles.caption),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            color: booking.statusColor,
            child: Text(booking.status.toUpperCase(),
                style: AppTextStyles.labelSmall
                    .copyWith(color: AppColors.black, fontSize: 8)),
          ),
        ],
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  final String label;
  final bool active;
  final VoidCallback onTap;
  const _Chip(
      {required this.label, required this.active, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: active ? AppColors.yellow : Colors.transparent,
          border: Border.all(color: AppColors.black, width: 2),
          boxShadow: active
              ? const [BoxShadow(offset: Offset(2, 2), color: AppColors.black)]
              : null,
        ),
        child: Text(label,
            style: AppTextStyles.labelSmall
                .copyWith(fontSize: 10, color: AppColors.black)),
      ),
    );
  }
}
