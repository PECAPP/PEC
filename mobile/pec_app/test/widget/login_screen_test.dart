import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:pec_app/features/auth/presentation/screens/login_screen.dart';
import 'package:pec_app/core/constants/app_colors.dart';

// Minimal router that only exposes /login to avoid needing the full app
GoRouter _testRouter() => GoRouter(
      initialLocation: '/login',
      routes: [
        GoRoute(
          path: '/login',
          builder: (_, __) => const LoginScreen(),
        ),
        // Stub routes that LoginScreen may navigate to
        GoRoute(path: '/intro', builder: (_, __) => const Scaffold()),
        GoRoute(path: '/forgot-password', builder: (_, __) => const Scaffold()),
        GoRoute(path: '/loading-splash', builder: (_, __) => const Scaffold()),
      ],
    );

Widget _buildTestApp() {
  return ProviderScope(
    child: MaterialApp.router(
      routerConfig: _testRouter(),
      theme: ThemeData.dark(),
    ),
  );
}

void main() {
  group('LoginScreen', () {
    testWidgets('renders email and password fields', (tester) async {
      await tester.pumpWidget(_buildTestApp());
      await tester.pumpAndSettle();

      expect(find.byType(TextField), findsNWidgets(2));
    });

    testWidgets('renders SIGN IN button', (tester) async {
      await tester.pumpWidget(_buildTestApp());
      await tester.pumpAndSettle();

      // PecButton with label "SIGN IN"
      expect(find.text('SIGN IN'), findsWidgets);
    });

    testWidgets('renders USE TEST ACCOUNTS button', (tester) async {
      await tester.pumpWidget(_buildTestApp());
      await tester.pumpAndSettle();

      expect(find.text('USE TEST ACCOUNTS'), findsOneWidget);
    });

    testWidgets('renders Forgot password link', (tester) async {
      await tester.pumpWidget(_buildTestApp());
      await tester.pumpAndSettle();

      expect(find.text('Forgot password?'), findsOneWidget);
    });

    testWidgets('can type into email field', (tester) async {
      await tester.pumpWidget(_buildTestApp());
      await tester.pumpAndSettle();

      final emailField = find.byType(TextField).first;
      await tester.tap(emailField);
      await tester.enterText(emailField, 'test@pec.edu');
      expect(find.text('test@pec.edu'), findsOneWidget);
    });

    testWidgets('password toggle icon changes obscureText', (tester) async {
      await tester.pumpWidget(_buildTestApp());
      await tester.pumpAndSettle();

      // Initially visibility_outlined (password obscured)
      expect(find.byIcon(Icons.visibility_outlined), findsOneWidget);

      await tester.tap(find.byIcon(Icons.visibility_outlined));
      await tester.pump();

      // After tap, visibility_off_outlined (password visible)
      expect(find.byIcon(Icons.visibility_off_outlined), findsOneWidget);
    });

    testWidgets('has dark background color', (tester) async {
      await tester.pumpWidget(_buildTestApp());
      await tester.pumpAndSettle();

      final scaffold = tester.widget<Scaffold>(find.byType(Scaffold).first);
      expect(scaffold.backgroundColor, AppColors.black);
    });
  });
}
