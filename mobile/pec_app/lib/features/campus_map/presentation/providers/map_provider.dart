import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../data/datasources/map_remote_datasource.dart';
import '../../data/models/map_model.dart';

final mapDataSourceProvider = Provider<MapRemoteDataSource>((ref) =>
    MapRemoteDataSource(ref.watch(apiClientProvider)));

final mapRegionsProvider = FutureProvider<List<MapRegion>>((ref) async {
  final ds = ref.watch(mapDataSourceProvider);
  return ds.getRegions();
});

final selectedRegionProvider = StateProvider<MapRegion?>((ref) => null);
