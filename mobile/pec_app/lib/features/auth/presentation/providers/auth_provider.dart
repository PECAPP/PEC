import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';

import '../../../../core/api/api_client.dart';
import '../../../../core/auth/token_storage.dart';
import '../../data/datasources/auth_remote_datasource.dart';
import '../../data/models/user_model.dart';
import '../../domain/entities/user_entity.dart';

// ── Enum ──────────────────────────────────────────────────────────────────
enum AuthStatus { unknown, authenticated, unauthenticated, onboarding, roleSelection }

// ── State ─────────────────────────────────────────────────────────────────
class AuthState {
  final AuthStatus status;
  final UserEntity? user;
  final String? error;

  const AuthState({
    this.status = AuthStatus.unknown,
    this.user,
    this.error,
  });

  AuthState copyWith({AuthStatus? status, UserEntity? user, String? error}) =>
      AuthState(
        status: status ?? this.status,
        user: user ?? this.user,
        error: error,
      );
}

// ── Infrastructure providers ──────────────────────────────────────────────
final tokenStorageProvider = Provider<TokenStorage>((_) => TokenStorage());

final apiClientProvider = Provider<ApiClient>((ref) {
  final storage = ref.watch(tokenStorageProvider);
  return ApiClient(storage);
});

final authRemoteDataSourceProvider = Provider<AuthRemoteDataSource>((ref) {
  return AuthRemoteDataSource(ref.watch(apiClientProvider));
});

// ── Notifier ──────────────────────────────────────────────────────────────
class AuthNotifier extends StateNotifier<AuthState> {
  final TokenStorage _tokenStorage;
  final AuthRemoteDataSource _dataSource;

  static const _hiveBox = 'auth';
  static const _keyUser = 'user';

  AuthNotifier(this._tokenStorage, this._dataSource)
      : super(const AuthState()) {
    _init();
  }

  Future<void> _init() async {
    final token = await _tokenStorage.getAccessToken();
    if (token == null) {
      state = state.copyWith(status: AuthStatus.unauthenticated);
      return;
    }
    // Restore user from local cache
    final box = await Hive.openBox(_hiveBox);
    final userJson = box.get(_keyUser) as String?;
    if (userJson != null) {
      final user = UserModel.fromJsonString(userJson);
      state = _resolveStatus(user);
    } else {
      // Token exists but no cached user — fetch fresh
      try {
        final user = await _dataSource.getMe();
        await _cacheUser(user);
        state = _resolveStatus(user);
      } catch (_) {
        await _tokenStorage.clearAll();
        state = state.copyWith(status: AuthStatus.unauthenticated);
      }
    }
  }

  Future<void> signIn({required String email, required String password}) async {
    state = state.copyWith(status: AuthStatus.unknown, error: null);
    try {
      final data = await _dataSource.signIn(email: email, password: password);
      final accessToken = data['accessToken'] as String;
      final refreshToken = data['refreshToken'] as String;
      await _tokenStorage.saveTokens(
        accessToken: accessToken,
        refreshToken: refreshToken,
      );
      final userJson = data['user'] as Map<String, dynamic>;
      final user = UserModel.fromJson(userJson);
      await _cacheUser(user);
      state = _resolveStatus(user);
    } on Exception catch (e) {
      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        error: e.toString(),
      );
    }
  }

  Future<void> signOut() async {
    try {
      await _dataSource.signOut();
    } catch (_) {}
    await _tokenStorage.clearAll();
    final box = await Hive.openBox(_hiveBox);
    await box.delete(_keyUser);
    state = const AuthState(status: AuthStatus.unauthenticated);
  }

  Future<void> refreshUser() async {
    try {
      final user = await _dataSource.getMe();
      await _cacheUser(user);
      state = _resolveStatus(user);
    } catch (_) {}
  }

  AuthState _resolveStatus(UserModel user) {
    if (!user.profileComplete) {
      return AuthState(status: AuthStatus.onboarding, user: user);
    }
    if (user.roles.length > 1) {
      return AuthState(status: AuthStatus.roleSelection, user: user);
    }
    return AuthState(status: AuthStatus.authenticated, user: user);
  }

  Future<void> _cacheUser(UserModel user) async {
    final box = await Hive.openBox(_hiveBox);
    await box.put(_keyUser, user.toJsonString());
  }

  void completeOnboarding() {
    if (state.user != null) {
      state = AuthState(status: AuthStatus.authenticated, user: state.user);
    }
  }

  void selectRole() {
    state = state.copyWith(status: AuthStatus.authenticated);
  }
}

// ── Provider ──────────────────────────────────────────────────────────────
final authNotifierProvider =
    StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(
    ref.watch(tokenStorageProvider),
    ref.watch(authRemoteDataSourceProvider),
  );
});
