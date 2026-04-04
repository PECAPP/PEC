import '../../../../core/api/api_client.dart';
import '../../../../core/api/api_endpoints.dart';
import '../models/portfolio_model.dart';

class PortfolioRemoteDataSource {
  final ApiClient _client;
  PortfolioRemoteDataSource(this._client);

  Future<List<PortfolioProject>> getMyProjects() async {
    final resp = await _client.dio.get(
      ApiEndpoints.studentPortfolio,
      queryParameters: {'mine': true, 'limit': 100},
    );
    final raw = resp.data as Map<String, dynamic>;
    final items = raw['data'] as List<dynamic>? ??
        raw['items'] as List<dynamic>? ??
        (resp.data is List ? resp.data as List<dynamic> : []);
    return items
        .map((e) => PortfolioProject.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<PortfolioProject> addProject({
    required String title,
    String? description,
    List<String> techStack = const [],
    String? imageUrl,
    String? repoUrl,
    String? demoUrl,
  }) async {
    final resp = await _client.dio.post(ApiEndpoints.studentPortfolio, data: {
      'title': title,
      if (description != null) 'description': description,
      'techStack': techStack,
      if (imageUrl != null) 'imageUrl': imageUrl,
      if (repoUrl != null) 'repoUrl': repoUrl,
      if (demoUrl != null) 'demoUrl': demoUrl,
    });
    return PortfolioProject.fromJson(resp.data as Map<String, dynamic>);
  }

  Future<void> deleteProject(String id) async {
    await _client.dio.delete(ApiEndpoints.studentPortfolioItem(id));
  }
}
