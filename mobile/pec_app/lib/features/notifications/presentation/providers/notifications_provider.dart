import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../auth/presentation/providers/auth_provider.dart';
import '../../data/datasources/notifications_remote_datasource.dart';
import '../../data/models/notification_model.dart';

final notificationsDataSourceProvider =
    Provider<NotificationsRemoteDataSource>((ref) {
  return NotificationsRemoteDataSource(ref.watch(apiClientProvider));
});

// ---------------------------------------------------------------------------
// Dummy notifications — shown while backend is not yet connected
// ---------------------------------------------------------------------------
final _dummyNotifications = <AppNotification>[
  AppNotification(
    id: 'dummy_1',
    title: 'Fee Payment Due',
    body: 'Your semester fee of ₹45,000 is due on 15th April 2026. Pay now to avoid late charges.',
    type: 'fee',
    isRead: false,
    actionRoute: '/finance',
    createdAt: DateTime.now().subtract(const Duration(minutes: 10)),
  ),
  AppNotification(
    id: 'dummy_2',
    title: 'Low Attendance Warning',
    body: 'Your attendance in CS-301 Data Structures is 68%. Minimum required is 75%.',
    type: 'attendance',
    isRead: false,
    actionRoute: '/attendance',
    createdAt: DateTime.now().subtract(const Duration(hours: 1, minutes: 30)),
  ),
  AppNotification(
    id: 'dummy_3',
    title: 'Mid-Sem Exam Schedule Released',
    body: 'Mid-semester examinations are scheduled from 21st April to 28th April 2026.',
    type: 'notice',
    isRead: false,
    actionRoute: '/examinations',
    createdAt: DateTime.now().subtract(const Duration(hours: 3)),
  ),
  AppNotification(
    id: 'dummy_4',
    title: 'New message from Prof. Sharma',
    body: 'Please submit the assignment by tomorrow morning. Late submissions will not be accepted.',
    type: 'chat',
    isRead: true,
    actionRoute: '/chat',
    createdAt: DateTime.now().subtract(const Duration(hours: 5)),
  ),
  AppNotification(
    id: 'dummy_5',
    title: 'Attendance Marked — CS-401',
    body: 'Your attendance for CS-401 Software Engineering has been marked for today\'s session.',
    type: 'attendance',
    isRead: true,
    actionRoute: '/attendance',
    createdAt: DateTime.now().subtract(const Duration(hours: 8)),
  ),
  AppNotification(
    id: 'dummy_6',
    title: 'Holiday: Dr. Ambedkar Jayanti',
    body: 'The college will remain closed on 14th April 2026 on account of Dr. B.R. Ambedkar Jayanti.',
    type: 'notice',
    isRead: true,
    createdAt: DateTime.now().subtract(const Duration(days: 1, hours: 2)),
  ),
  AppNotification(
    id: 'dummy_7',
    title: 'Fee Receipt Generated',
    body: 'Your fee receipt for Semester 6 has been generated. Download it from the Finance section.',
    type: 'fee',
    isRead: true,
    actionRoute: '/finance',
    createdAt: DateTime.now().subtract(const Duration(days: 1, hours: 10)),
  ),
  AppNotification(
    id: 'dummy_8',
    title: 'Result Declared: CS-301',
    body: 'Marks for CS-301 Data Structures Mid-Semester examination have been published.',
    type: 'notice',
    isRead: true,
    actionRoute: '/examinations',
    createdAt: DateTime.now().subtract(const Duration(days: 2)),
  ),
  AppNotification(
    id: 'dummy_9',
    title: 'Timetable Updated — Week 12',
    body: 'The class timetable for Week 12 has been updated. Check the schedule for any changes.',
    type: 'general',
    isRead: true,
    actionRoute: '/timetable',
    createdAt: DateTime.now().subtract(const Duration(days: 3)),
  ),
  AppNotification(
    id: 'dummy_10',
    title: 'Group Chat: PEC CSE Batch 2022',
    body: 'Rajat Kumar: Has anyone completed the DBMS lab assignment? Submission is tonight.',
    type: 'chat',
    isRead: true,
    actionRoute: '/chat',
    createdAt: DateTime.now().subtract(const Duration(days: 4)),
  ),
];

// ---------------------------------------------------------------------------
// StateNotifier — manages local state with optimistic updates + API sync
// ---------------------------------------------------------------------------
class NotificationsNotifier
    extends StateNotifier<AsyncValue<List<AppNotification>>> {
  final NotificationsRemoteDataSource _ds;

  NotificationsNotifier(this._ds) : super(const AsyncValue.loading()) {
    _load();
  }

  Future<void> _load() async {
    state = const AsyncValue.loading();
    try {
      final list = await _ds.getNotifications();
      list.sort((a, b) => b.createdAt.compareTo(a.createdAt));
      state = AsyncValue.data(list);
    } catch (_) {
      // Fallback to dummy data until backend is connected
      state = AsyncValue.data(List<AppNotification>.from(_dummyNotifications));
    }
  }

  Future<void> refresh() => _load();

  void markRead(String id) {
    state.whenData((list) {
      state = AsyncValue.data(
        list.map((n) => n.id == id ? n.copyWith(isRead: true) : n).toList(),
      );
    });
    _ds.markRead(id).catchError((_) {});
  }

  void markAllRead() {
    state.whenData((list) {
      state = AsyncValue.data(
        list.map((n) => n.copyWith(isRead: true)).toList(),
      );
    });
  }

  void delete(String id) {
    state.whenData((list) {
      state = AsyncValue.data(list.where((n) => n.id != id).toList());
    });
    _ds.delete(id).catchError((_) {});
  }

  void clearAll() {
    state = const AsyncValue.data([]);
  }
}

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------
final notificationsProvider = StateNotifierProvider<NotificationsNotifier,
    AsyncValue<List<AppNotification>>>((ref) {
  return NotificationsNotifier(ref.watch(notificationsDataSourceProvider));
});

final unreadCountProvider = Provider<int>((ref) {
  return ref.watch(notificationsProvider).whenOrNull(
        data: (list) => list.where((n) => !n.isRead).length,
      ) ??
      0;
});

// ---------------------------------------------------------------------------
// Legacy shim — keeps any external callers working without changes
// ---------------------------------------------------------------------------
class NotificationActionsNotifier extends StateNotifier<void> {
  final Ref _ref;
  NotificationActionsNotifier(this._ref) : super(null);

  Future<void> markRead(String id) async =>
      _ref.read(notificationsProvider.notifier).markRead(id);

  Future<void> delete(String id) async =>
      _ref.read(notificationsProvider.notifier).delete(id);
}

final notificationActionsProvider =
    StateNotifierProvider<NotificationActionsNotifier, void>((ref) {
  return NotificationActionsNotifier(ref);
});
