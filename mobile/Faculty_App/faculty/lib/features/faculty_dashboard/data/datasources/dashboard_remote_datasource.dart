import '../../../../core/api/api_client.dart';
import '../../../../core/api/api_endpoints.dart';

class DashboardRemoteDataSource {
  final ApiClient _client;
  DashboardRemoteDataSource(this._client);

  /// GET /courses?facultyId=...&limit=200
  Future<List<Map<String, dynamic>>> getFacultyCourses(String facultyId) async {
    final res = await _client.dio.get(
      ApiEndpoints.courses,
      queryParameters: {'facultyId': facultyId, 'limit': 200, 'offset': 0},
    );
    final data = res.data;
    if (data is Map && data.containsKey('data')) {
      return List<Map<String, dynamic>>.from(data['data'] as List);
    }
    if (data is List) return List<Map<String, dynamic>>.from(data);
    return [];
  }

  /// GET /courses?limit=200 (fallback — all courses)
  Future<List<Map<String, dynamic>>> getAllCourses() async {
    final res = await _client.dio.get(
      ApiEndpoints.courses,
      queryParameters: {'limit': 200, 'offset': 0},
    );
    final data = res.data;
    if (data is Map && data.containsKey('data')) {
      return List<Map<String, dynamic>>.from(data['data'] as List);
    }
    return [];
  }

  /// GET /enrollments?courseId=...&status=active&limit=200
  Future<List<Map<String, dynamic>>> getEnrollments(String courseId) async {
    final res = await _client.dio.get(
      ApiEndpoints.enrollments,
      queryParameters: {'courseId': courseId, 'status': 'active', 'limit': 200, 'offset': 0},
    );
    final data = res.data;
    if (data is Map && data.containsKey('data')) {
      return List<Map<String, dynamic>>.from(data['data'] as List);
    }
    return [];
  }

  /// GET /noticeboard?limit=5
  Future<List<Map<String, dynamic>>> getRecentNotices() async {
    final res = await _client.dio.get(
      ApiEndpoints.noticeboard,
      queryParameters: {'limit': 5},
    );
    final data = res.data;
    if (data is Map && data.containsKey('data')) {
      return List<Map<String, dynamic>>.from(data['data'] as List);
    }
    return [];
  }

  /// GET /timetable
  Future<List<Map<String, dynamic>>> getTimetable() async {
    final res = await _client.dio.get(ApiEndpoints.timetable);
    final data = res.data;
    if (data is Map && data.containsKey('data')) {
      return List<Map<String, dynamic>>.from(data['data'] as List);
    }
    return [];
  }

  /// GET /attendance/faculty-stats
  Future<Map<String, dynamic>> getFacultyStats() async {
    final res = await _client.dio.get(ApiEndpoints.attendanceFacultyStats);
    final data = res.data;
    if (data is Map<String, dynamic> && data.containsKey('data')) {
      final nested = data['data'];
      if (nested is Map<String, dynamic>) return nested;
    }
    if (data is Map<String, dynamic>) return data;
    return <String, dynamic>{};
  }
}
