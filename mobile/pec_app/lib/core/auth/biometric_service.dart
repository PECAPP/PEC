import 'package:local_auth/local_auth.dart';

/// Thin wrapper around [LocalAuthentication].
/// Handles capability checks and the authenticate call.
class BiometricService {
  BiometricService._();

  static final LocalAuthentication _auth = LocalAuthentication();

  /// Returns true if the device supports biometric / device-credential auth
  /// AND at least one credential is enrolled.
  static Future<bool> isAvailable() async {
    try {
      final canCheck = await _auth.canCheckBiometrics;
      final isSupported = await _auth.isDeviceSupported();
      if (!canCheck && !isSupported) return false;
      final enrolled = await _auth.getAvailableBiometrics();
      return enrolled.isNotEmpty;
    } catch (_) {
      return false;
    }
  }

  /// Prompts the OS biometric sheet.
  /// Returns true on success, false on failure / cancellation.
  static Future<bool> authenticate({
    String reason = 'Confirm your identity to unlock PEC Campus',
  }) async {
    try {
      return await _auth.authenticate(
        localizedReason: reason,
        options: const AuthenticationOptions(
          biometricOnly: false, // allow PIN/pattern fallback
          stickyAuth: true,
        ),
      );
    } catch (_) {
      return false;
    }
  }
}
