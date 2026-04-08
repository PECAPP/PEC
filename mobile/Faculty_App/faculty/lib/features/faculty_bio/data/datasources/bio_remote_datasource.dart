import '../../../../core/api/api_client.dart';
import '../../../../core/api/api_endpoints.dart';
import '../models/publication_model.dart';

class BioRemoteDataSource {
  final ApiClient _client;
  BioRemoteDataSource(this._client);

  Future<Map<String, dynamic>> getFacultyBio(String facultyId) async {
    final res = await _client.dio.get(ApiEndpoints.facultyBio(facultyId));
    final data = res.data;
    return data is Map<String, dynamic> ? data : {};
  }

  // ── Publications ──
  Future<PublicationModel> createPublication(Map<String, dynamic> body) async {
    final res = await _client.dio.post(ApiEndpoints.publications, data: body);
    return PublicationModel.fromJson(res.data as Map<String, dynamic>);
  }

  Future<void> updatePublication(String id, Map<String, dynamic> body) async {
    await _client.dio.patch(ApiEndpoints.publication(id), data: body);
  }

  Future<void> deletePublication(String id) async {
    await _client.dio.delete(ApiEndpoints.publication(id));
  }

  // ── Awards ──
  Future<AwardModel> createAward(Map<String, dynamic> body) async {
    final res = await _client.dio.post(ApiEndpoints.awards, data: body);
    return AwardModel.fromJson(res.data as Map<String, dynamic>);
  }

  Future<void> updateAward(String id, Map<String, dynamic> body) async {
    await _client.dio.patch(ApiEndpoints.award(id), data: body);
  }

  Future<void> deleteAward(String id) async {
    await _client.dio.delete(ApiEndpoints.award(id));
  }

  // ── Conferences ──
  Future<ConferenceModel> createConference(Map<String, dynamic> body) async {
    final res = await _client.dio.post(ApiEndpoints.conferences, data: body);
    return ConferenceModel.fromJson(res.data as Map<String, dynamic>);
  }

  Future<void> updateConference(String id, Map<String, dynamic> body) async {
    await _client.dio.patch(ApiEndpoints.conference(id), data: body);
  }

  Future<void> deleteConference(String id) async {
    await _client.dio.delete(ApiEndpoints.conference(id));
  }

  // ── Consultations ──
  Future<ConsultationModel> createConsultation(Map<String, dynamic> body) async {
    final res = await _client.dio.post(ApiEndpoints.consultations, data: body);
    return ConsultationModel.fromJson(res.data as Map<String, dynamic>);
  }

  Future<void> updateConsultation(String id, Map<String, dynamic> body) async {
    await _client.dio.patch(ApiEndpoints.consultation(id), data: body);
  }

  Future<void> deleteConsultation(String id) async {
    await _client.dio.delete(ApiEndpoints.consultation(id));
  }
}
