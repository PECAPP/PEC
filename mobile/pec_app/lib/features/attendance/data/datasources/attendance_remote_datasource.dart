import '../../../../core/api/api_client.dart';
import '../../../../core/api/api_endpoints.dart';
import '../models/attendance_model.dart';

class AttendanceRemoteDataSource {
  final ApiClient _client;
  AttendanceRemoteDataSource(this._client);

  Future<List<AttendanceSummary>> getSummary({required String studentId}) async {
    final resp = await _client.dio.get(
      ApiEndpoints.attendanceSummary,
      queryParameters: {'studentId': studentId},
    );
    final raw = resp.data as Map<String, dynamic>;
    final data = raw['data'];
    if (data is List) {
      return data
          .map((e) => AttendanceSummary.fromJson(e as Map<String, dynamic>))
          .toList();
    }
    return [];
  }

  Future<List<AttendanceRecord>> getHistory({
    required String studentId,
    String? courseId,
    int limit = 200,
  }) async {
    final resp = await _client.dio.get(
      ApiEndpoints.attendance,
      queryParameters: {
        'studentId': studentId,
        'limit': limit,
        if (courseId != null) 'courseId': courseId,
      },
    );
    final raw = resp.data as Map<String, dynamic>;
    final items = raw['data'] as List<dynamic>? ?? raw['items'] as List<dynamic>? ?? [];
    return items
        .map((e) => AttendanceRecord.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  /// Student marks attendance by submitting the session token from QR.
  Future<void> markAttendance({
    required String sessionId,
    required String studentId,
  }) async {
    await _client.dio.post(ApiEndpoints.attendance, data: {
      'sessionId': sessionId,
      'studentId': studentId,
    });
  }
}
