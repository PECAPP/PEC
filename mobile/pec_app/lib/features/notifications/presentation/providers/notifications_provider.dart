import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../data/datasources/notifications_remote_datasource.dart';
import '../../data/models/notification_model.dart';

final notificationsDataSourceProvider =
    Provider<NotificationsRemoteDataSource>((ref) {
  return NotificationsRemoteDataSource(ref.watch(apiClientProvider));
});

final notificationsProvider =
    FutureProvider<List<AppNotification>>((ref) async {
  final ds = ref.watch(notificationsDataSourceProvider);
  final list = await ds.getNotifications();
  list.sort((a, b) => b.createdAt.compareTo(a.createdAt));
  return list;
});

final unreadCountProvider = Provider<int>((ref) {
  return ref.watch(notificationsProvider).whenOrNull(
        data: (list) => list.where((n) => !n.isRead).length,
      ) ?? 0;
});

class NotificationActionsNotifier extends StateNotifier<void> {
  final NotificationsRemoteDataSource _ds;
  final Ref _ref;
  NotificationActionsNotifier(this._ds, this._ref) : super(null);

  Future<void> markRead(String id) async {
    await _ds.markRead(id);
    _ref.invalidate(notificationsProvider);
  }

  Future<void> delete(String id) async {
    await _ds.delete(id);
    _ref.invalidate(notificationsProvider);
  }
}

final notificationActionsProvider =
    StateNotifierProvider<NotificationActionsNotifier, void>((ref) {
  return NotificationActionsNotifier(
      ref.watch(notificationsDataSourceProvider), ref);
});
