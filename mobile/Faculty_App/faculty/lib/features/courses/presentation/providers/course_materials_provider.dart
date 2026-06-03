import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../features/auth/presentation/providers/auth_provider.dart';
import '../../data/datasources/course_materials_datasource.dart';

final _courseMaterialsDataSourceProvider = Provider((ref) {
  return CourseMaterialsDataSource(ref.read(apiClientProvider));
});

class CourseMaterialsState {
  final bool loading;
  final List<Map<String, dynamic>> materials;
  final String? error;

  const CourseMaterialsState({
    this.loading = true,
    this.materials = const [],
    this.error,
  });

  CourseMaterialsState copyWith({
    bool? loading,
    List<Map<String, dynamic>>? materials,
    String? error,
  }) =>
      CourseMaterialsState(
        loading: loading ?? this.loading,
        materials: materials ?? this.materials,
        error: error,
      );
}

class CourseMaterialsNotifier extends StateNotifier<CourseMaterialsState> {
  final CourseMaterialsDataSource _ds;
  final String courseId;

  CourseMaterialsNotifier(this._ds, this.courseId)
      : super(const CourseMaterialsState()) {
    if (courseId.isNotEmpty) load();
  }

  Future<void> load() async {
    state = state.copyWith(loading: true, error: null);
    try {
      final materials = await _ds.getMaterials(courseId);
      state = CourseMaterialsState(loading: false, materials: materials);
    } catch (e) {
      state = state.copyWith(loading: false, error: e.toString());
    }
  }

  Future<void> add(Map<String, dynamic> body) async {
    await _ds.create({...body, 'courseId': courseId});
    await load();
  }

  Future<void> remove(String id) async {
    await _ds.delete(id);
    state = state.copyWith(
      materials: state.materials.where((m) => m['id']?.toString() != id).toList(),
    );
  }
}

/// Family provider keyed by courseId.
final courseMaterialsProvider = StateNotifierProvider.family<
    CourseMaterialsNotifier, CourseMaterialsState, String>((ref, courseId) {
  return CourseMaterialsNotifier(
    ref.read(_courseMaterialsDataSourceProvider),
    courseId,
  );
});
