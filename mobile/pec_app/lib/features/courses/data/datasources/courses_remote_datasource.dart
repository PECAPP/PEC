import '../../../../core/api/api_client.dart';
import '../../../../core/api/api_endpoints.dart';
import '../../../../shared/models/paginated_response.dart';
import '../models/course_model.dart';

class CoursesRemoteDataSource {
  final ApiClient _client;
  CoursesRemoteDataSource(this._client);

  List<dynamic> _extractItems(dynamic raw) {
    if (raw is List) return raw;
    if (raw is Map<String, dynamic>) {
      final data = raw['data'];
      if (data is List) return data;
      if (data is Map<String, dynamic>) {
        final nestedItems = data['items'];
        if (nestedItems is List) return nestedItems;
      }
      final items = raw['items'];
      if (items is List) return items;
      final results = raw['results'];
      if (results is List) return results;
    }
    return const [];
  }

  Map<String, dynamic> _extractObject(dynamic raw) {
    if (raw is Map<String, dynamic>) {
      final data = raw['data'];
      if (data is Map<String, dynamic>) return data;
      return raw;
    }
    return const {};
  }

  Future<PaginatedResponse<CourseModel>> getCourses({
    String? department,
    int? semester,
    String? status,
    String? facultyId,
    int limit = 100,
    int offset = 0,
  }) async {
    final resp = await _client.dio.get(
      ApiEndpoints.courses,
      queryParameters: {
        'limit': limit,
        'offset': offset,
        if (department != null) 'department': department,
        if (semester != null) 'semester': semester,
        if (status != null) 'status': status,
        if (facultyId != null) 'facultyId': facultyId,
      },
    );
    final raw = resp.data;
    final root = raw is Map<String, dynamic> ? raw : const <String, dynamic>{};
    final itemMaps = _extractItems(raw)
        .whereType<Map<String, dynamic>>()
        .toList(growable: false);
    final items = itemMaps.map(CourseModel.fromJson).toList(growable: false);

    return PaginatedResponse(
      items: items,
      total: (root['total'] as num?)?.toInt() ?? items.length,
      limit: (root['limit'] as num?)?.toInt() ?? limit,
      offset: (root['offset'] as num?)?.toInt() ?? offset,
    );
  }

  Future<CourseModel> getCourse(String id) async {
    final resp = await _client.dio.get(ApiEndpoints.course(id));
    return CourseModel.fromJson(_extractObject(resp.data));
  }

  Future<PaginatedResponse<EnrollmentModel>> getEnrollments({
    String? studentId,
    String? courseId,
    int limit = 200,
  }) async {
    final resp = await _client.dio.get(
      ApiEndpoints.enrollments,
      queryParameters: {
        'limit': limit,
        if (studentId != null) 'studentId': studentId,
        if (courseId != null) 'courseId': courseId,
      },
    );
    final raw = resp.data;
    final root = raw is Map<String, dynamic> ? raw : const <String, dynamic>{};
    final itemMaps = _extractItems(raw)
        .whereType<Map<String, dynamic>>()
        .toList(growable: false);
    final items =
        itemMaps.map(EnrollmentModel.fromJson).toList(growable: false);

    return PaginatedResponse(
      items: items,
      total: (root['total'] as num?)?.toInt() ?? items.length,
      limit: (root['limit'] as num?)?.toInt() ?? limit,
      offset: (root['offset'] as num?)?.toInt() ?? 0,
    );
  }

  Future<void> enroll({
    required String studentId,
    required String courseId,
    required String courseName,
    required String courseCode,
    int? semester,
  }) async {
    await _client.dio.post(ApiEndpoints.enrollments, data: {
      'studentId': studentId,
      'courseId': courseId,
      'courseName': courseName,
      'courseCode': courseCode,
      if (semester != null) 'semester': semester,
    });
  }

  Future<void> unenroll(String enrollmentId) async {
    await _client.dio.delete('${ApiEndpoints.enrollments}/$enrollmentId');
  }
}
