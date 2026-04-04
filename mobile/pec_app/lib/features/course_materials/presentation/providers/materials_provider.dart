import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../data/datasources/materials_remote_datasource.dart';
import '../../data/models/material_model.dart';

final materialsDataSourceProvider = Provider<MaterialsRemoteDataSource>((ref) {
  return MaterialsRemoteDataSource(ref.watch(apiClientProvider));
});

final materialsProvider =
    FutureProvider.family<List<CourseMaterialModel>, String?>((ref, courseId) async {
  final ds = ref.watch(materialsDataSourceProvider);
  return ds.getMaterials(courseId: courseId);
});
