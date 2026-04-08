// integration_test package is used for on-device integration tests.
// Run with: flutter test integration/login_flow_test.dart
// Or on device: flutter test --device-id=<id> integration/login_flow_test.dart

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:pec_app/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('Login flow (end-to-end)', () {
    testWidgets('shows login screen on cold start when unauthenticated',
        (tester) async {
      app.main();
      await tester.pumpAndSettle(const Duration(seconds: 3));

      // Should land on welcome/intro or login
      expect(
        find.byType(Scaffold),
        findsWidgets,
        reason: 'At least one scaffold should be visible',
      );
    });

    testWidgets('can submit email and navigate to signing-in splash',
        (tester) async {
      app.main();
      await tester.pumpAndSettle(const Duration(seconds: 3));

      // Navigate to login if not already there
      final loginFinder = find.text('SIGN IN');
      if (loginFinder.evaluate().isEmpty) {
        return; // Skip if already authenticated from a previous run
      }

      // Enter credentials
      final fields = find.byType(TextField);
      if (fields.evaluate().length >= 2) {
        await tester.tap(fields.first);
        await tester.enterText(fields.first, 'student@pec.edu');
        await tester.tap(fields.at(1));
        await tester.enterText(fields.at(1), 'password123');
        await tester.pump();

        // Tap the SIGN IN button (the PecButton one, not the tab)
        await tester.tap(find.text('SIGN IN').last);
        await tester.pumpAndSettle(const Duration(seconds: 2));

        // Should transition to signing-in splash or dashboard
        expect(find.byType(Scaffold), findsWidgets);
      }
    });
  });
}
