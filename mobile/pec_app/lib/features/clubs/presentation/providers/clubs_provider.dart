import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../data/datasources/clubs_remote_datasource.dart';
import '../../data/models/club_model.dart';

final clubsDataSourceProvider = Provider<ClubsRemoteDataSource>((ref) {
  return ClubsRemoteDataSource(ref.watch(apiClientProvider));
});

final clubsProvider = FutureProvider<List<ClubModel>>((ref) async {
  final ds = ref.watch(clubsDataSourceProvider);
  return ds.getClubs();
});

final clubDetailProvider =
    FutureProvider.family<ClubModel, String>((ref, id) async {
  final ds = ref.watch(clubsDataSourceProvider);
  return ds.getClub(id);
});

// Notifier for join/leave request actions
class ClubJoinNotifier extends StateNotifier<AsyncValue<void>> {
  final ClubsRemoteDataSource _ds;
  final Ref _ref;
  ClubJoinNotifier(this._ds, this._ref) : super(const AsyncValue.data(null));

  Future<void> sendJoinRequest(String clubId) async {
    state = const AsyncValue.loading();
    try {
      await _ds.sendJoinRequest(clubId);
      state = const AsyncValue.data(null);
      _ref.invalidate(clubsProvider);
      _ref.invalidate(clubDetailProvider(clubId));
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

final clubJoinNotifierProvider =
    StateNotifierProvider<ClubJoinNotifier, AsyncValue<void>>((ref) {
  return ClubJoinNotifier(
      ref.watch(clubsDataSourceProvider), ref);
});
