import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/utils/hive_cache.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../data/datasources/clubs_remote_datasource.dart';
import '../../data/models/club_model.dart';

const _cacheClubsKey = 'clubs:list:v1';
const _cacheJoinOverridesKey = 'clubs:join_overrides:v1';

final _localJoinOverridesProvider =
    StateProvider<Map<String, String>>((ref) => <String, String>{});

final _clubsHydrationProvider = FutureProvider<void>((ref) async {
  final joinRaw = await HiveCache.get<Map>(_cacheJoinOverridesKey);
  if (joinRaw != null) {
    ref.read(_localJoinOverridesProvider.notifier).state = joinRaw.map(
      (key, value) => MapEntry(key.toString(), value.toString()),
    );
  }
});

final clubsDataSourceProvider = Provider<ClubsRemoteDataSource>((ref) {
  return ClubsRemoteDataSource(ref.watch(apiClientProvider));
});

final clubsProvider = FutureProvider<List<ClubModel>>((ref) async {
  await ref.watch(_clubsHydrationProvider.future);

  final ds = ref.watch(clubsDataSourceProvider);
  final joinOverrides = ref.watch(_localJoinOverridesProvider);

  List<ClubModel> list;
  try {
    list = await ds.getClubs();
    await HiveCache.put(
      _cacheClubsKey,
      list.map((c) => c.toJson()).toList(),
      ttl: const Duration(days: 7),
    );
  } catch (_) {
    final cachedRaw = await HiveCache.get<List>(_cacheClubsKey);
    if (cachedRaw != null) {
      list = cachedRaw
          .whereType<Map>()
          .map((e) => ClubModel.fromJson(Map<String, dynamic>.from(e)))
          .toList();
    } else {
      list = _fallbackClubs();
    }
  }

  final merged = list
      .map((club) {
        final status = joinOverrides[club.id];
        if (status == null) return club;
        return club.copyWith(myJoinStatus: status);
      })
      .where((c) => c.isActive)
      .toList()
    ..sort((a, b) => a.name.toLowerCase().compareTo(b.name.toLowerCase()));

  return merged;
});

List<ClubModel> _fallbackClubs() {
  return const [
    ClubModel(
      id: 'fallback-club-tech-1',
      name: 'PEC Coding Club',
      description: 'Competitive programming, app dev, and hackathons.',
      category: 'technical',
      memberCount: 84,
      isActive: true,
    ),
    ClubModel(
      id: 'fallback-club-cultural-1',
      name: 'Dramatics Society',
      description: 'Theatre, acting workshops, and stage performances.',
      category: 'cultural',
      memberCount: 47,
      isActive: true,
    ),
    ClubModel(
      id: 'fallback-club-sports-1',
      name: 'Athletics Club',
      description: 'Track, field, fitness sessions, and competitions.',
      category: 'sports',
      memberCount: 62,
      isActive: true,
    ),
  ];
}

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
    final nextOverrides =
        _ref.read(_localJoinOverridesProvider.notifier).update((map) {
      return {...map, clubId: 'pending'};
    });

    await HiveCache.put(
      _cacheJoinOverridesKey,
      nextOverrides,
      ttl: const Duration(days: 30),
    );

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
  return ClubJoinNotifier(ref.watch(clubsDataSourceProvider), ref);
});
