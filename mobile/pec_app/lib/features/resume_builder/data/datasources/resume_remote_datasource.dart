import '../../../../core/api/api_client.dart';
import '../../../../core/api/api_endpoints.dart';
import '../models/resume_model.dart';

class ResumeRemoteDataSource {
  final ApiClient _client;
  ResumeRemoteDataSource(this._client);

  Future<ResumeData?> getMyResume() async {
    try {
      final resp = await _client.dio.get(ApiEndpoints.meResume);
      final raw = resp.data;
      if (raw == null) return null;
      return ResumeData.fromJson(raw is Map<String, dynamic>
          ? raw
          : raw['data'] as Map<String, dynamic>? ?? {});
    } catch (_) {
      return null;
    }
  }

  Future<void> saveResume(ResumeData data) async {
    await _client.dio.patch(ApiEndpoints.meResume, data: data.toJson());
  }
}
