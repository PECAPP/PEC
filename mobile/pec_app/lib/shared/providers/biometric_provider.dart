import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';

import '../../core/auth/biometric_service.dart';

// ---------------------------------------------------------------------------
// Persisted preference — is biometric unlock enabled by the user?
// ---------------------------------------------------------------------------
class BiometricPreferenceNotifier extends Notifier<bool> {
  static const _key = 'biometric_enabled';

  @override
  bool build() {
    final box = Hive.box('settings');
    return box.get(_key, defaultValue: false) as bool;
  }

  Future<void> toggle() async {
    final box = Hive.box('settings');
    final newVal = !state;
    await box.put(_key, newVal);
    state = newVal;
  }

  Future<void> set(bool enabled) async {
    final box = Hive.box('settings');
    await box.put(_key, enabled);
    state = enabled;
  }
}

final biometricPreferenceProvider =
    NotifierProvider<BiometricPreferenceNotifier, bool>(
  BiometricPreferenceNotifier.new,
);

// ---------------------------------------------------------------------------
// Is the hardware capable? (one-shot FutureProvider)
// ---------------------------------------------------------------------------
final biometricAvailableProvider = FutureProvider<bool>((ref) async {
  return BiometricService.isAvailable();
});

// ---------------------------------------------------------------------------
// Lock state — true = the app is locked and needs biometric auth
// ---------------------------------------------------------------------------
class AppLockNotifier extends Notifier<bool> {
  @override
  bool build() => false; // starts unlocked; locked when app goes to background

  void lock() => state = true;
  void unlock() => state = false;

  /// Prompt the OS sheet and unlock if successful.
  Future<bool> tryUnlock() async {
    final ok = await BiometricService.authenticate();
    if (ok) state = false;
    return ok;
  }
}

final appLockProvider = NotifierProvider<AppLockNotifier, bool>(
  AppLockNotifier.new,
);
