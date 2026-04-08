import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:pec_app/shared/widgets/pec_button.dart';
import 'package:pec_app/core/constants/app_colors.dart';

void main() {
  group('PecButton', () {
    testWidgets('shows label text', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: PecButton(label: 'SUBMIT', onPressed: () {}),
          ),
        ),
      );

      expect(find.text('SUBMIT'), findsOneWidget);
    });

    testWidgets('shows loading indicator when isLoading is true', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: PecButton(
              label: 'SUBMIT',
              onPressed: () {},
              isLoading: true,
            ),
          ),
        ),
      );

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
      expect(find.text('SUBMIT'), findsNothing);
    });

    testWidgets('fires onPressed callback', (tester) async {
      bool pressed = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: PecButton(
              label: 'GO',
              onPressed: () => pressed = true,
            ),
          ),
        ),
      );

      await tester.tap(find.byType(PecButton));
      expect(pressed, isTrue);
    });

    testWidgets('does not fire callback when onPressed is null', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: PecButton(label: 'DISABLED', onPressed: null),
          ),
        ),
      );

      // Should not throw
      await tester.tap(find.byType(PecButton), warnIfMissed: false);
    });

    testWidgets('fullWidth fills available width', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: PecButton(
              label: 'WIDE',
              onPressed: () {},
              fullWidth: true,
            ),
          ),
        ),
      );

      final sizedBox = tester.widget<SizedBox>(
        find.descendant(
          of: find.byType(PecButton),
          matching: find.byType(SizedBox),
        ).first,
      );

      expect(sizedBox.width, double.infinity);
    });

    testWidgets('outlined variant has transparent background', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: PecButton(
              label: 'OUTLINE',
              onPressed: () {},
              variant: PecButtonVariant.outlined,
            ),
          ),
        ),
      );

      final container = tester.widget<Container>(
        find.descendant(
          of: find.byType(PecButton),
          matching: find.byType(Container),
        ).first,
      );

      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, Colors.transparent);
    });

    testWidgets('shows prefix icon when provided', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: PecButton(
              label: 'ICON',
              onPressed: () {},
              prefixIcon: Icons.lock,
            ),
          ),
        ),
      );

      expect(find.byIcon(Icons.lock), findsOneWidget);
    });
  });
}
