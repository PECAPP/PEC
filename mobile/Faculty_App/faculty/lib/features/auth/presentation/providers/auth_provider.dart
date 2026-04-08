import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/auth/token_storage.dart';
import '../../data/datasources/auth_remote_datasource.dart';
import '../../data/models/user_model.dart';
import '../../domain/entities/user_entity.dart';

// ── Singletons ──
final tokenStorageProvider = Provider((_) => TokenStorage());
final apiClientProvider = Provider((ref) => ApiClient(ref.read(tokenStorageProvider)));
final authDataSourceProvider = Provider(
  (ref) => AuthRemoteDataSource(ref.read(apiClientProvider)),
);

// ── Auth State ──
enum AuthStatus { unknown, authenticated, unauthenticated }

class AuthState {
  final AuthStatus status;
  final UserEntity? user;
  final String? error;
  final bool isTestSession;

  const AuthState({
    this.status = AuthStatus.unknown,
    this.user,
    this.error,
    this.isTestSession = false,
  });

  AuthState copyWith({
    AuthStatus? status,
    UserEntity? user,
    String? error,
    bool? isTestSession,
  }) =>
      AuthState(
        status: status ?? this.status,
        user: user ?? this.user,
        error: error,
        isTestSession: isTestSession ?? this.isTestSession,
      );
}

// ── Auth Notifier ──
class AuthNotifier extends StateNotifier<AuthState> {
  final TokenStorage _tokenStorage;
  final AuthRemoteDataSource _dataSource;

  AuthNotifier(this._tokenStorage, this._dataSource) : super(const AuthState()) {
    _init();
  }

  Future<void> _init() async {
    final accessToken = await _tokenStorage.getAccessToken();
    if (accessToken == null) {
      state = state.copyWith(status: AuthStatus.unauthenticated);
      return;
    }
    try {
      final user = await _dataSource.getMe();
      _persistUser(user);
      state = AuthState(status: AuthStatus.authenticated, user: user, isTestSession: false);
    } catch (_) {
      // Try loading from Hive cache
      final cached = _loadCachedUser();
      if (cached != null) {
        state = AuthState(status: AuthStatus.authenticated, user: cached, isTestSession: false);
      } else {
        state = state.copyWith(status: AuthStatus.unauthenticated);
      }
    }
  }

  Future<void> signIn({required String email, required String password}) async {
    try {
      final data = await _dataSource.signIn(email: email, password: password);
      final accessToken = data['access_token'] as String;
      final refreshToken = (data['refresh_token'] as String?) ?? '';
      await _tokenStorage.saveTokens(accessToken: accessToken, refreshToken: refreshToken);

      final userJson = data['user'] as Map<String, dynamic>?;
      final user = userJson != null ? UserModel.fromJson(userJson) : await _dataSource.getMe();
      _persistUser(user);
      state = AuthState(status: AuthStatus.authenticated, user: user, isTestSession: false);
    } catch (e) {
      state = state.copyWith(status: AuthStatus.unauthenticated, error: e.toString());
      rethrow;
    }
  }

  /// Dev/test bypass: mark session authenticated without backend login.
  Future<void> signInWithTestAccount() async {
    const user = UserModel(
      uid: 'test-faculty-uid',
      email: 'faculty@pec.edu.in',
      fullName: 'Test Faculty',
      role: 'faculty',
      roles: ['faculty'],
      verified: true,
      profileComplete: true,
      department: 'Computer Science',
      designation: 'Assistant Professor',
      specialization: 'Software Engineering',
    );

    // Do not persist fake tokens; this mode is UI-only and intentionally offline.
    await _tokenStorage.clearAll();

    _persistUser(user);
    state = const AuthState(
      status: AuthStatus.authenticated,
      user: user,
      isTestSession: true,
    );
  }

  Future<void> refreshUser() async {
    try {
      final user = await _dataSource.getMe();
      _persistUser(user);
      state = AuthState(status: AuthStatus.authenticated, user: user, isTestSession: false);
    } catch (e) {
      debugPrint('refreshUser failed: $e');
    }
  }

  Future<void> signOut() async {
    await _dataSource.signOut();
    await _tokenStorage.clearAll();
    _clearCachedUser();
    state = const AuthState(status: AuthStatus.unauthenticated);
  }

  // ── Hive user cache ──
  void _persistUser(UserEntity user) {
    try {
      final box = Hive.box('auth');
      final model = user is UserModel ? user : UserModel(
        uid: user.uid,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        roles: user.roles,
        avatar: user.avatar,
        verified: user.verified,
        profileComplete: user.profileComplete,
        department: user.department,
        designation: user.designation,
        specialization: user.specialization,
      );
      box.put('user', jsonEncode(model.toJson()));
    } catch (_) {}
  }

  UserEntity? _loadCachedUser() {
    try {
      final box = Hive.box('auth');
      final raw = box.get('user') as String?;
      if (raw == null) return null;
      return UserModel.fromJson(jsonDecode(raw) as Map<String, dynamic>);
    } catch (_) {
      return null;
    }
  }

  void _clearCachedUser() {
    try {
      Hive.box('auth').delete('user');
    } catch (_) {}
  }
}

final authNotifierProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(
    ref.read(tokenStorageProvider),
    ref.read(authDataSourceProvider),
  );
});
