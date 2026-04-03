import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:pec_app/features/academic_calendar/presentation/screens/calendar_screen.dart';
import 'package:pec_app/features/attendance/presentation/screens/attendance_home_screen.dart';
import 'package:pec_app/features/attendance/presentation/screens/qr_generate_screen.dart';
import 'package:pec_app/features/attendance/presentation/screens/qr_scan_screen.dart';
import 'package:pec_app/features/auth/presentation/providers/auth_provider.dart';
import 'package:pec_app/features/auth/presentation/screens/forgot_password_screen.dart';
import 'package:pec_app/features/auth/presentation/screens/login_screen.dart';
import 'package:pec_app/features/auth/presentation/screens/onboarding_screen.dart';
import 'package:pec_app/features/auth/presentation/screens/role_selection_screen.dart';
import 'package:pec_app/features/campus_map/presentation/screens/campus_map_screen.dart';
import 'package:pec_app/features/canteen/presentation/screens/canteen_menu_screen.dart';
import 'package:pec_app/features/chat/presentation/screens/chat_list_screen.dart';
import 'package:pec_app/features/chat/presentation/screens/chat_room_screen.dart';
import 'package:pec_app/features/clubs/presentation/screens/club_list_screen.dart';
import 'package:pec_app/features/course_materials/presentation/screens/materials_list_screen.dart';
import 'package:pec_app/features/courses/presentation/screens/course_detail_screen.dart';
import 'package:pec_app/features/courses/presentation/screens/course_list_screen.dart';
import 'package:pec_app/features/dashboard/presentation/screens/dashboard_screen.dart';
import 'package:pec_app/features/departments/presentation/screens/department_list_screen.dart';
import 'package:pec_app/features/examinations/presentation/screens/exam_list_screen.dart';
import 'package:pec_app/features/faculty/presentation/screens/faculty_list_screen.dart';
import 'package:pec_app/features/hostel_issues/presentation/screens/issue_list_screen.dart';
import 'package:pec_app/features/noticeboard/presentation/screens/notice_list_screen.dart';
import 'package:pec_app/features/notifications/presentation/screens/notifications_screen.dart';
import 'package:pec_app/features/profile/presentation/screens/profile_screen.dart';
import 'package:pec_app/features/resume_builder/presentation/screens/resume_editor_screen.dart';
import 'package:pec_app/features/rooms/presentation/screens/room_list_screen.dart';
import 'package:pec_app/features/score_sheet/presentation/screens/score_sheet_screen.dart';
import 'package:pec_app/features/settings/presentation/screens/settings_screen.dart';
import 'package:pec_app/features/student_portfolio/presentation/screens/portfolio_screen.dart';
import 'package:pec_app/features/timetable/presentation/screens/timetable_screen.dart';
import 'package:pec_app/features/users/presentation/screens/user_list_screen.dart';
import 'package:pec_app/shared/widgets/app_scaffold.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authNotifierProvider);
  final notifier = _RouterRefreshNotifier(ref);

  return GoRouter(
    initialLocation: '/dashboard',
    refreshListenable: notifier,
    redirect: (context, state) {
      final isAuthenticated = authState.status == AuthStatus.authenticated;
      final isOnboarding = authState.status == AuthStatus.onboarding;
      final needsRoleSelection = authState.status == AuthStatus.roleSelection;
      final isAuthRoute = state.matchedLocation.startsWith('/login') ||
          state.matchedLocation.startsWith('/forgot-password');

      if (!isAuthenticated && !isOnboarding && !needsRoleSelection && !isAuthRoute) {
        return '/login';
      }
      if (isAuthenticated && isAuthRoute) return '/dashboard';
      if (isOnboarding && state.matchedLocation != '/onboarding') return '/onboarding';
      if (needsRoleSelection && state.matchedLocation != '/role-selection') {
        return '/role-selection';
      }
      return null;
    },
    routes: [
      // ── Public routes ──────────────────────────────────────────────────
      GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
      GoRoute(path: '/forgot-password', builder: (_, __) => const ForgotPasswordScreen()),
      GoRoute(path: '/onboarding', builder: (_, __) => const OnboardingScreen()),
      GoRoute(path: '/role-selection', builder: (_, __) => const RoleSelectionScreen()),

      // ── Protected shell (bottom nav) ───────────────────────────────────
      ShellRoute(
        builder: (context, state, child) => AppScaffold(child: child),
        routes: [
          GoRoute(path: '/dashboard', builder: (_, __) => const DashboardScreen()),
          GoRoute(
            path: '/courses',
            builder: (_, __) => const CourseListScreen(),
            routes: [
              GoRoute(
                path: ':id',
                builder: (_, state) => CourseDetailScreen(courseId: state.pathParameters['id']!),
              ),
            ],
          ),
          GoRoute(
            path: '/attendance',
            builder: (_, __) => const AttendanceHomeScreen(),
            routes: [
              GoRoute(path: 'scan', builder: (_, __) => const QrScanScreen()),
              GoRoute(path: 'generate', builder: (_, __) => const QrGenerateScreen()),
            ],
          ),
          GoRoute(path: '/timetable', builder: (_, __) => const TimetableScreen()),
          GoRoute(path: '/examinations', builder: (_, __) => const ExamListScreen()),
          GoRoute(
            path: '/course-materials',
            builder: (_, state) => MaterialsListScreen(
              courseId: state.uri.queryParameters['courseId'],
            ),
          ),
          GoRoute(path: '/calendar', builder: (_, __) => const CalendarScreen()),
          GoRoute(
            path: '/chat',
            builder: (_, __) => const ChatListScreen(),
            routes: [
              GoRoute(
                path: ':roomId',
                builder: (_, state) =>
                    ChatRoomScreen(roomId: state.pathParameters['roomId']!),
              ),
            ],
          ),
          GoRoute(path: '/noticeboard', builder: (_, __) => const NoticeListScreen()),
          GoRoute(path: '/clubs', builder: (_, __) => const ClubListScreen()),
          GoRoute(path: '/canteen', builder: (_, __) => const CanteenMenuScreen()),
          GoRoute(path: '/rooms', builder: (_, __) => const RoomListScreen()),
          GoRoute(path: '/hostel-issues', builder: (_, __) => const IssueListScreen()),
          GoRoute(path: '/campus-map', builder: (_, __) => const CampusMapScreen()),
          GoRoute(path: '/score-sheet', builder: (_, __) => const ScoreSheetScreen()),
          GoRoute(path: '/departments', builder: (_, __) => const DepartmentListScreen()),
          GoRoute(path: '/faculty', builder: (_, __) => const FacultyListScreen()),
          GoRoute(path: '/users', builder: (_, __) => const UserListScreen()),
          GoRoute(path: '/profile', builder: (_, __) => const ProfileScreen()),
          GoRoute(path: '/resume', builder: (_, __) => const ResumeEditorScreen()),
          GoRoute(path: '/portfolio', builder: (_, __) => const PortfolioScreen()),
          GoRoute(path: '/notifications', builder: (_, __) => const NotificationsScreen()),
          GoRoute(path: '/settings', builder: (_, __) => const SettingsScreen()),
        ],
      ),
    ],
  );
});

class _RouterRefreshNotifier extends ChangeNotifier {
  late final ProviderSubscription<AuthState> _sub;

  _RouterRefreshNotifier(Ref ref) {
    _sub = ref.listen(authNotifierProvider, (_, __) => notifyListeners());
  }

  @override
  void dispose() {
    _sub.close();
    super.dispose();
  }
}
