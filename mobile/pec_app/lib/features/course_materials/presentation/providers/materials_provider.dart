import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/utils/hive_cache.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../data/datasources/materials_remote_datasource.dart';
import '../../data/models/material_model.dart';

final materialsDataSourceProvider = Provider<MaterialsRemoteDataSource>((ref) {
  return MaterialsRemoteDataSource(ref.watch(apiClientProvider));
});

final materialsProvider =
    FutureProvider.family<List<CourseMaterialModel>, String?>(
        (ref, courseId) async {
  final ds = ref.watch(materialsDataSourceProvider);
  final cacheKey = 'materials:list:${courseId ?? 'all'}';

  try {
    final items = await ds.getMaterials(courseId: courseId);
    await HiveCache.put(
      cacheKey,
      items.map((e) => e.toJson()).toList(growable: false),
      ttl: const Duration(hours: 6),
    );
    return items;
  } catch (_) {
    final cached = await HiveCache.get<List<dynamic>>(cacheKey);
    if (cached != null && cached.isNotEmpty) {
      return cached
          .whereType<Map<String, dynamic>>()
          .map(CourseMaterialModel.fromJson)
          .toList(growable: false);
    }
    rethrow;
  }
});
