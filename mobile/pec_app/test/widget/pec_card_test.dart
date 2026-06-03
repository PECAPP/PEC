import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:pec_app/shared/widgets/pec_card.dart';
import 'package:pec_app/core/constants/app_colors.dart';

void main() {
  group('PecCard', () {
    testWidgets('renders child widget', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: PecCard(
              child: Text('Hello PEC'),
            ),
          ),
        ),
      );

      expect(find.text('Hello PEC'), findsOneWidget);
    });

    testWidgets('has neo-brutal border and shadow', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: PecCard(child: SizedBox()),
          ),
        ),
      );

      final container = tester.widget<Container>(
        find.descendant(
          of: find.byType(PecCard),
          matching: find.byType(Container),
        ).first,
      );

      final decoration = container.decoration as BoxDecoration;
      expect(decoration.border, isNotNull);
      expect(decoration.boxShadow, isNotNull);
      expect(decoration.boxShadow!.isNotEmpty, isTrue);
    });

    testWidgets('fires onTap callback', (tester) async {
      bool tapped = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: PecCard(
              onTap: () => tapped = true,
              child: const Text('tap me'),
            ),
          ),
        ),
      );

      await tester.tap(find.byType(PecCard));
      expect(tapped, isTrue);
    });

    testWidgets('respects custom color and shadowColor', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: PecCard(
              color: AppColors.yellow,
              shadowColor: AppColors.red,
              child: SizedBox(),
            ),
          ),
        ),
      );

      final container = tester.widget<Container>(
        find.descendant(
          of: find.byType(PecCard),
          matching: find.byType(Container),
        ).first,
      );

      final decoration = container.decoration as BoxDecoration;
      expect(decoration.color, AppColors.yellow);
      expect(decoration.boxShadow!.first.color, AppColors.red);
    });
  });
}
