import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/api/api_client.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../data/datasources/courses_remote_datasource.dart';
import '../../data/models/course_model.dart';

final coursesDataSourceProvider = Provider<CoursesRemoteDataSource>((ref) {
  return CoursesRemoteDataSource(ref.watch(apiClientProvider));
});

// All courses (with optional filters)
final coursesProvider = FutureProvider.family<List<CourseModel>, Map<String, dynamic>>(
  (ref, filters) async {
    final ds = ref.watch(coursesDataSourceProvider);
    final resp = await ds.getCourses(
      department: filters['department'] as String?,
      semester: filters['semester'] as int?,
      status: filters['status'] as String?,
      facultyId: filters['facultyId'] as String?,
    );
    return resp.items;
  },
);

// Single course detail
final courseDetailProvider = FutureProvider.family<CourseModel, String>((ref, id) async {
  final ds = ref.watch(coursesDataSourceProvider);
  return ds.getCourse(id);
});

// Enrolled courses for current student
final enrolledCoursesProvider = FutureProvider<List<EnrollmentModel>>((ref) async {
  final user = ref.watch(authNotifierProvider).user;
  if (user == null) return [];
  final ds = ref.watch(coursesDataSourceProvider);
  final resp = await ds.getEnrollments(studentId: user.id);
  return resp.items;
});
