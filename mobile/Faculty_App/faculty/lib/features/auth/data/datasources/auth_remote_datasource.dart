import '../../../../core/api/api_client.dart';
import '../../../../core/api/api_endpoints.dart';
import '../models/user_model.dart';

class AuthRemoteDataSource {
  final ApiClient _client;
  AuthRemoteDataSource(this._client);

  /// POST /auth/login → { access_token, refresh_token, user }
  Future<Map<String, dynamic>> signIn({
    required String email,
    required String password,
  }) async {
    final response = await _client.dio.post(
      ApiEndpoints.login,
      data: {'email': email, 'password': password},
    );
    return response.data as Map<String, dynamic>;
  }

  /// POST /auth/refresh → { access_token, refresh_token, user }
  Future<Map<String, dynamic>> refresh(String refreshToken) async {
    final response = await _client.dio.post(
      ApiEndpoints.refresh,
      data: {'refreshToken': refreshToken},
    );
    return response.data as Map<String, dynamic>;
  }

  /// GET /auth/profile → user json
  Future<UserModel> getMe() async {
    final response = await _client.dio.get(ApiEndpoints.profile);
    final data = response.data;
    final user = data is Map<String, dynamic> && data.containsKey('data')
        ? data['data'] as Map<String, dynamic>
        : data as Map<String, dynamic>;
    return UserModel.fromJson(user);
  }

  /// POST /auth/logout
  Future<void> signOut() async {
    try {
      await _client.dio.post(ApiEndpoints.logout);
    } catch (_) {
      // Best-effort
    }
  }

  /// POST /auth/request-password-reset
  Future<void> forgotPassword(String email) async {
    await _client.dio.post(ApiEndpoints.forgotPassword, data: {'email': email});
  }

  /// POST /auth/reset-password
  Future<void> resetPassword({
    required String token,
    required String newPassword,
  }) async {
    await _client.dio.post(
      ApiEndpoints.resetPassword,
      data: {'token': token, 'password': newPassword},
    );
  }
}
