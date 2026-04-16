import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/attendance/presentation/screens/attendance_screen.dart';
import '../../features/attendance/presentation/screens/qr_generate_screen.dart';
import '../../features/academic_calendar/presentation/screens/academic_calendar_screen.dart';
import '../../features/auth/presentation/providers/auth_provider.dart';
import '../../features/auth/presentation/screens/forgot_password_screen.dart';
import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/auth/presentation/screens/splash_screen.dart';
import '../../features/chat/presentation/screens/chat_list_screen.dart';
import '../../features/chat/presentation/screens/chat_room_screen.dart';
import '../../features/buy_sell/presentation/screens/marketplace_screen.dart';
import '../../features/courses/presentation/screens/course_materials_screen.dart';
import '../../features/courses/presentation/screens/courses_screen.dart';
import '../../features/courses/presentation/screens/course_materials_management_screen.dart';
import '../../features/examinations/presentation/screens/examinations_screen.dart';
import '../../features/finance/presentation/screens/finance_screen.dart';
import '../../features/faculty_bio/presentation/screens/faculty_bio_screen.dart';
import '../../features/help_support/presentation/screens/help_support_screen.dart';
import '../../features/faculty_dashboard/presentation/screens/dashboard_screen.dart';
import '../../features/noticeboard/presentation/screens/noticeboard_screen.dart';
import '../../features/notifications/presentation/screens/notifications_screen.dart';
import '../../features/profile/presentation/screens/profile_screen.dart';
import '../../features/settings/presentation/screens/settings_screen.dart';
import '../../features/timetable/presentation/screens/timetable_screen.dart';
import '../../features/campus_map/presentation/screens/campus_map_screen.dart';
import '../../features/users/presentation/screens/users_screen.dart';
import '../../shared/widgets/app_scaffold.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authNotifierProvider);
  final notifier = _RouterRefreshNotifier(ref);

  return GoRouter(
    initialLocation: '/splash',
    refreshListenable: notifier,
    redirect: (context, state) {
      final isAuthenticated = authState.status == AuthStatus.authenticated;
      final isUnknown = authState.status == AuthStatus.unknown;
      final loc = state.matchedLocation;
      final isSplash = loc == '/splash';
      final isAuthRoute = isSplash || loc.startsWith('/login') || loc.startsWith('/forgot-password');

      if (isSplash) return null; // splash handles its own navigation

      if (isUnknown) return null; // still checking

      if (!isAuthenticated && !isAuthRoute) return '/login';
      if (isAuthenticated && isAuthRoute) return '/dashboard';
      return null;
    },
    routes: [
      GoRoute(path: '/splash', builder: (_, _) => const SplashScreen()),
      GoRoute(path: '/login', builder: (_, _) => const LoginScreen()),
      GoRoute(path: '/forgot-password', builder: (_, _) => const ForgotPasswordScreen()),

      ShellRoute(
        builder: (context, state, child) => AppScaffold(child: child),
        routes: [
          GoRoute(path: '/dashboard', builder: (_, _) => const DashboardScreen()),
          GoRoute(path: '/users', builder: (_, _) => const UsersScreen()),
          GoRoute(
            path: '/courses',
            builder: (_, _) => const CoursesScreen(),
          ),
            GoRoute(path: '/course-materials', builder: (_, _) => const CourseMaterialsManagementScreen()),
          GoRoute(
            path: '/attendance',
            builder: (_, _) => const AttendanceScreen(),
            routes: [
              GoRoute(
                path: 'generate-qr',
                builder: (_, _) => const QrGenerateScreen(),
              ),
            ],
          ),
          GoRoute(path: '/timetable', builder: (_, _) => const TimetableScreen()),
          GoRoute(path: '/academic-calendar', builder: (_, _) => const AcademicCalendarScreen()),
          GoRoute(path: '/examinations', builder: (_, _) => const ExaminationsScreen()),
          GoRoute(path: '/noticeboard', builder: (_, _) => const NoticeboardScreen()),
          GoRoute(path: '/finance', builder: (_, _) => const FinanceScreen()),
          GoRoute(path: '/buy-sell', builder: (_, _) => const MarketplaceScreen()),
          GoRoute(path: '/notifications', builder: (_, _) => const NotificationsScreen()),
          GoRoute(
            path: '/chat',
            builder: (_, _) => const ChatListScreen(),
            routes: [
              GoRoute(
                path: ':roomId',
                builder: (_, state) => ChatRoomScreen(
                  roomId: state.pathParameters['roomId']!,
                ),
              ),
            ],
          ),
          GoRoute(path: '/faculty-bio', builder: (_, _) => const FacultyBioScreen()),
          GoRoute(path: '/profile', builder: (_, _) => const ProfileScreen()),
          GoRoute(path: '/settings', builder: (_, _) => const SettingsScreen()),
          GoRoute(path: '/help-support', builder: (_, _) => const HelpSupportScreen()),
          GoRoute(path: '/campus-map', builder: (_, _) => const CampusMapScreen()),
          GoRoute(
            path: '/course-materials/:courseId',
            builder: (_, state) {
              final courseId = state.pathParameters['courseId']!;
              final name = state.uri.queryParameters['name'] ?? 'Materials';
              return CourseMaterialsScreen(courseId: courseId, courseName: name);
            },
          ),
        ],
      ),
    ],
  );
});

class _RouterRefreshNotifier extends ChangeNotifier {
  late final ProviderSubscription<AuthState> _sub;

  _RouterRefreshNotifier(Ref ref) {
    _sub = ref.listen(authNotifierProvider, (_, _) => notifyListeners());
  }

  @override
  void dispose() {
    _sub.close();
    super.dispose();
  }
}
