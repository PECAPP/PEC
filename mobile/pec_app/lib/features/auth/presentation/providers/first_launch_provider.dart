import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';

const _kIntroSeen = 'introSeen';

/// True when the user has never seen the intro onboarding.
final isFirstLaunchProvider = Provider<bool>((ref) {
  final box = Hive.box('settings');
  return !(box.get(_kIntroSeen, defaultValue: false) as bool);
});

/// Call once after the user finishes / skips the intro.
Future<void> markIntroSeen() async {
  final box = Hive.box('settings');
  await box.put(_kIntroSeen, true);
}
