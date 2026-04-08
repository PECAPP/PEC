import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:hive/hive.dart';
import 'package:pec_app/core/api/api_client.dart';
import 'package:pec_app/core/auth/token_storage.dart';
import 'package:pec_app/features/auth/domain/entities/user_entity.dart';
import 'package:pec_app/features/auth/data/datasources/auth_remote_datasource.dart';
import 'package:pec_app/features/auth/data/models/user_model.dart';
import 'package:pec_app/features/auth/presentation/providers/auth_provider.dart';
import 'package:pec_app/features/courses/data/models/course_model.dart';
import 'package:pec_app/features/courses/presentation/providers/courses_provider.dart';
import 'package:pec_app/features/attendance/presentation/providers/attendance_provider.dart';
import 'package:pec_app/features/notifications/presentation/providers/notifications_provider.dart';
import 'package:pec_app/features/dashboard/presentation/screens/dashboard_screen.dart';

UserEntity _testUser() => const UserEntity(
      id: '1',
      email: 'test@pec.edu',
      name: 'Test User',
      roles: [UserRole.student],
      profileComplete: true,
      department: 'Computer Science',
      semester: 3,
    );

class _NeverCompletingTokenStorage extends TokenStorage {
  @override
  Future<String?> getAccessToken() async => 'access-token';

  @override
  Future<String?> getRefreshToken() async => 'refresh-token';

  @override
  Future<void> clearAll() async {}

  @override
  Future<void> saveAccessToken(String token) async {}

  @override
  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {}
}

class _FakeAuthRemoteDataSource extends AuthRemoteDataSource {
  _FakeAuthRemoteDataSource() : super(ApiClient(_NoopTokenStorage()));

  @override
  Future<Map<String, dynamic>> signIn({
    required String email,
    required String password,
  }) async =>
      throw UnimplementedError();

  @override
  Future<Map<String, dynamic>> refresh(String refreshToken) async =>
      throw UnimplementedError();

  @override
  Future<void> signOut() async {}

  @override
  Future<UserModel> getMe() async => UserModel(
        id: _testUser().id,
        email: _testUser().email,
        name: _testUser().name,
        roles: _testUser().roles,
        profileComplete: true,
        department: _testUser().department,
        semester: _testUser().semester,
      );

  @override
  Future<void> forgotPassword(String email) async {}

  @override
  Future<void> resetPassword({
    required String token,
    required String newPassword,
  }) async {}
}

class _NoopTokenStorage extends TokenStorage {
  @override
  Future<String?> getAccessToken() async => null;

  @override
  Future<String?> getRefreshToken() async => null;

  @override
  Future<void> clearAll() async {}

  @override
  Future<void> saveAccessToken(String token) async {}

  @override
  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {}
}

class _FakeAuthNotifier extends AuthNotifier {
  _FakeAuthNotifier()
      : super(_NeverCompletingTokenStorage(), _FakeAuthRemoteDataSource()) {
    state = AuthState(
      status: AuthStatus.authenticated,
      user: _testUser(),
    );
  }

  @override
  Future<void> refreshUser() async {}

  @override
  Future<void> signOut() async {}
}

Future<void> _initHive() async {
  Hive.init(Directory.systemTemp.path);
}

GoRouter _testRouter() => GoRouter(
      initialLocation: '/dashboard',
      routes: [
        GoRoute(
          path: '/dashboard',
          builder: (_, __) => const DashboardScreen(),
        ),
        // Stub all routes DashboardScreen may reference
        GoRoute(path: '/timetable', builder: (_, __) => const Scaffold()),
        GoRoute(path: '/attendance', builder: (_, __) => const Scaffold()),
        GoRoute(path: '/courses', builder: (_, __) => const Scaffold()),
        GoRoute(path: '/score-sheet', builder: (_, __) => const Scaffold()),
        GoRoute(path: '/noticeboard', builder: (_, __) => const Scaffold()),
        GoRoute(path: '/notifications', builder: (_, __) => const Scaffold()),
        GoRoute(path: '/profile', builder: (_, __) => const Scaffold()),
      ],
    );

void main() {
  setUpAll(_initHive);

  tearDownAll(() async {
    await Hive.close();
  });

  group('DashboardScreen render', () {
    testWidgets('renders without crashing', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authNotifierProvider.overrideWith((_) => _FakeAuthNotifier()),
            unreadCountProvider.overrideWith((_) => 0),
            overallAttendanceProvider.overrideWith(
              (_) => const AsyncValue.data(<String, dynamic>{
                    'present': 18,
                    'absent': 2,
                    'pct': 90.0,
                  }),
            ),
            enrolledCoursesProvider.overrideWith(
              (_) async => <EnrollmentModel>[],
            ),
          ],
          child: MaterialApp.router(
            routerConfig: _testRouter(),
          ),
        ),
      );

      // First frame — providers initialising
      await tester.pump();

      // Does not throw; DashboardScreen is in the tree
      expect(find.byType(DashboardScreen), findsOneWidget);
    });

    testWidgets('shows greeting with user name', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authNotifierProvider.overrideWith((_) => _FakeAuthNotifier()),
            unreadCountProvider.overrideWith((_) => 0),
            overallAttendanceProvider.overrideWith(
              (_) => const AsyncValue.data(<String, dynamic>{
                    'present': 18,
                    'absent': 2,
                    'pct': 90.0,
                  }),
            ),
            enrolledCoursesProvider.overrideWith(
              (_) async => <EnrollmentModel>[],
            ),
          ],
          child: MaterialApp.router(
            routerConfig: _testRouter(),
          ),
        ),
      );

      await tester.pump();

      // User firstName should appear somewhere on screen
      expect(find.textContaining('Test'), findsWidgets);
    });
  });
}
