import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/constants/app_colors.dart';
import '../../core/constants/app_dimensions.dart';
import '../../core/constants/app_text_styles.dart';
import '../providers/biometric_provider.dart';
import 'pec_button.dart';

/// Listens to [AppLifecycleState] to lock the app when it is paused,
/// then shows a full-screen unlock prompt while [appLockProvider] is true.
///
/// Wrap this around the [child] in [MaterialApp.builder].
class BiometricLockOverlay extends ConsumerStatefulWidget {
  final Widget child;
  const BiometricLockOverlay({super.key, required this.child});

  @override
  ConsumerState<BiometricLockOverlay> createState() =>
      _BiometricLockOverlayState();
}

class _BiometricLockOverlayState extends ConsumerState<BiometricLockOverlay>
    with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    final bioEnabled = ref.read(biometricPreferenceProvider);
    if (!bioEnabled) return;

    if (state == AppLifecycleState.paused) {
      ref.read(appLockProvider.notifier).lock();
    } else if (state == AppLifecycleState.resumed) {
      final isLocked = ref.read(appLockProvider);
      if (isLocked) {
        ref.read(appLockProvider.notifier).tryUnlock();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isLocked = ref.watch(appLockProvider);
    final bioEnabled = ref.watch(biometricPreferenceProvider);

    if (!bioEnabled || !isLocked) return widget.child;

    return _LockScreen(
      onUnlock: () => ref.read(appLockProvider.notifier).tryUnlock(),
    );
  }
}

class _LockScreen extends StatelessWidget {
  final VoidCallback onUnlock;
  const _LockScreen({required this.onUnlock});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.black,
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(AppDimensions.xl),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    border: Border.all(color: AppColors.yellow, width: 2),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.fingerprint,
                    color: AppColors.yellow,
                    size: 44,
                  ),
                ),
                const SizedBox(height: AppDimensions.xl),
                Text(
                  'APP LOCKED',
                  style: AppTextStyles.heading2.copyWith(color: AppColors.white),
                ),
                const SizedBox(height: AppDimensions.sm),
                Text(
                  'Verify your identity to continue',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: AppColors.white.withValues(alpha: 0.6),
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppDimensions.xxl),
                PecButton(
                  label: 'UNLOCK',
                  onPressed: onUnlock,
                  prefixIcon: Icons.lock_open_outlined,
                  fullWidth: true,
                  color: AppColors.yellow,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
