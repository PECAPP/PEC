import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/utils/hive_cache.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../data/datasources/notifications_remote_datasource.dart';
import '../../data/models/notification_model.dart';

const _cacheNotificationsKey = 'notifications:list:v1';
const _cacheReadOverridesKey = 'notifications:read_overrides:v1';
const _cacheDeletedIdsKey = 'notifications:deleted_ids:v1';

final _localReadOverridesProvider =
    StateProvider<Map<String, bool>>((ref) => <String, bool>{});
final _localDeletedIdsProvider =
    StateProvider<Set<String>>((ref) => <String>{});

final _notificationsHydrationProvider = FutureProvider<void>((ref) async {
  final readRaw = await HiveCache.get<Map>(_cacheReadOverridesKey);
  if (readRaw != null) {
    final hydratedRead = readRaw.map(
      (key, value) => MapEntry(key.toString(), value == true),
    );
    ref.read(_localReadOverridesProvider.notifier).state = hydratedRead;
  }

  final deletedRaw = await HiveCache.get<List>(_cacheDeletedIdsKey);
  if (deletedRaw != null) {
    ref.read(_localDeletedIdsProvider.notifier).state =
        deletedRaw.map((e) => e.toString()).toSet();
  }
});

final notificationsDataSourceProvider =
    Provider<NotificationsRemoteDataSource>((ref) {
  return NotificationsRemoteDataSource(ref.watch(apiClientProvider));
});

final notificationsProvider =
    FutureProvider<List<AppNotification>>((ref) async {
  await ref.watch(_notificationsHydrationProvider.future);

  final ds = ref.watch(notificationsDataSourceProvider);
  final readOverrides = ref.watch(_localReadOverridesProvider);
  final deletedIds = ref.watch(_localDeletedIdsProvider);

  List<AppNotification> list;
  try {
    list = await ds.getNotifications();

    await HiveCache.put(
      _cacheNotificationsKey,
      list.map((n) => n.toJson()).toList(),
      ttl: const Duration(days: 7),
    );
  } catch (_) {
    final cachedRaw = await HiveCache.get<List>(_cacheNotificationsKey);
    if (cachedRaw != null) {
      list = cachedRaw
          .whereType<Map>()
          .map((e) => AppNotification.fromJson(Map<String, dynamic>.from(e)))
          .toList();
    } else {
      list = _fallbackNotifications();
    }
  }

  final merged = list
      .where((n) => !deletedIds.contains(n.id))
      .map((n) => readOverrides[n.id] == true ? n.copyWith(isRead: true) : n)
      .toList();

  merged.sort((a, b) => b.createdAt.compareTo(a.createdAt));
  return merged;
});

List<AppNotification> _fallbackNotifications() {
  final now = DateTime.now();
  return [
    AppNotification(
      id: 'fallback-notice-1',
      title: 'Welcome to Notifications',
      body: 'You will see campus updates, reminders, and alerts here.',
      type: 'notice',
      isRead: false,
      actionRoute: '/dashboard',
      createdAt: now.subtract(const Duration(minutes: 6)),
    ),
    AppNotification(
      id: 'fallback-attendance-1',
      title: 'Attendance summary updated',
      body: 'Tap to review your latest attendance details.',
      type: 'attendance',
      isRead: false,
      actionRoute: '/attendance',
      createdAt: now.subtract(const Duration(hours: 2)),
    ),
    AppNotification(
      id: 'fallback-general-1',
      title: 'Notification service running in offline mode',
      body:
          'Live notifications will appear automatically when backend is available.',
      type: 'general',
      isRead: true,
      createdAt: now.subtract(const Duration(days: 1)),
    ),
  ];
}

final unreadCountProvider = Provider<int>((ref) {
  return ref.watch(notificationsProvider).whenOrNull(
            data: (list) => list.where((n) => !n.isRead).length,
          ) ??
      0;
});

class NotificationActionsNotifier extends StateNotifier<void> {
  final NotificationsRemoteDataSource _ds;
  final Ref _ref;
  NotificationActionsNotifier(this._ds, this._ref) : super(null);

  Future<void> markRead(String id) async {
    final nextReadMap =
        _ref.read(_localReadOverridesProvider.notifier).update((state) {
      return {...state, id: true};
    });

    await HiveCache.put(
      _cacheReadOverridesKey,
      nextReadMap,
      ttl: const Duration(days: 30),
    );

    try {
      await _ds.markRead(id);
    } catch (_) {}
    _ref.invalidate(notificationsProvider);
  }

  Future<void> delete(String id) async {
    final nextDeletedSet =
        _ref.read(_localDeletedIdsProvider.notifier).update((state) {
      return {...state, id};
    });

    await HiveCache.put(
      _cacheDeletedIdsKey,
      nextDeletedSet.toList(),
      ttl: const Duration(days: 30),
    );

    try {
      await _ds.delete(id);
    } catch (_) {}
    _ref.invalidate(notificationsProvider);
  }
}

final notificationActionsProvider =
    StateNotifierProvider<NotificationActionsNotifier, void>((ref) {
  return NotificationActionsNotifier(
      ref.watch(notificationsDataSourceProvider), ref);
});
