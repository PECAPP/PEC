import 'package:dio/dio.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/api/api_endpoints.dart';
import '../models/user_model.dart';

class AuthRemoteDataSource {
  final ApiClient _client;
  AuthRemoteDataSource(this._client);

  Future<Map<String, dynamic>> signIn({
    required String email,
    required String password,
  }) async {
    final response = await _client.dio.post(
      ApiEndpoints.signIn,
      data: {'email': email, 'password': password},
    );
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> refresh(String refreshToken) async {
    final response = await _client.dio.post(
      ApiEndpoints.refresh,
      data: {'refreshToken': refreshToken},
      options: Options(headers: {'Authorization': null}),
    );
    return response.data as Map<String, dynamic>;
  }

  Future<void> signOut() async {
    await _client.dio.post(ApiEndpoints.signOut);
  }

  Future<UserModel> getMe() async {
    final response = await _client.dio.get(ApiEndpoints.me);
    return UserModel.fromJson(response.data as Map<String, dynamic>);
  }

  Future<void> forgotPassword(String email) async {
    await _client.dio.post(ApiEndpoints.forgotPassword, data: {'email': email});
  }

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
