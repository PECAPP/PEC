import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/utils/hive_cache.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../data/datasources/courses_remote_datasource.dart';
import '../../data/models/course_model.dart';

final coursesDataSourceProvider = Provider<CoursesRemoteDataSource>((ref) {
  return CoursesRemoteDataSource(ref.watch(apiClientProvider));
});

const _cacheAllCoursesKeyPrefix = 'courses:all';
const _cacheEnrolledCoursesKeyPrefix = 'courses:enrolled';

String _coursesCacheKey(Map<String, dynamic> filters) {
  final sortedEntries = filters.entries.toList()
    ..sort((a, b) => a.key.compareTo(b.key));
  final serialized = sortedEntries.map((e) => '${e.key}=${e.value}').join('&');
  return '$_cacheAllCoursesKeyPrefix:$serialized';
}

// All courses (with optional filters)
final coursesProvider =
    FutureProvider.family<List<CourseModel>, Map<String, dynamic>>(
  (ref, filters) async {
    final ds = ref.watch(coursesDataSourceProvider);
    final cacheKey = _coursesCacheKey(filters);

    try {
      final resp = await ds.getCourses(
        department: filters['department'] as String?,
        semester: filters['semester'] as int?,
        status: filters['status'] as String?,
        facultyId: filters['facultyId'] as String?,
      );
      final items = resp.items;
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
            .map(CourseModel.fromJson)
            .toList(growable: false);
      }
      rethrow;
    }
  },
);

// Single course detail
final courseDetailProvider =
    FutureProvider.family<CourseModel, String>((ref, id) async {
  final ds = ref.watch(coursesDataSourceProvider);
  return ds.getCourse(id);
});

// Enrolled courses for current student
final enrolledCoursesProvider =
    FutureProvider<List<EnrollmentModel>>((ref) async {
  final user = ref.watch(authNotifierProvider).user;
  if (user == null) return [];
  final ds = ref.watch(coursesDataSourceProvider);
  final cacheKey = '$_cacheEnrolledCoursesKeyPrefix:${user.id}';

  try {
    final resp = await ds.getEnrollments(studentId: user.id);
    final items = resp.items;
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
          .map(EnrollmentModel.fromJson)
          .toList(growable: false);
    }
    rethrow;
  }
});
