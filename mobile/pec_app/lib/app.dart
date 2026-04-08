import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';
import 'shared/providers/theme_provider.dart';
import 'shared/widgets/biometric_lock_overlay.dart';
import 'shared/widgets/connectivity_banner.dart';

class PecApp extends ConsumerWidget {
  const PecApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);
    final themeMode = ref.watch(themeModeProvider);

    return MaterialApp.router(
      title: 'PEC Campus ERP',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      themeMode: themeMode,
      routerConfig: router,
      builder: (context, child) {
        final inner = child ?? const SizedBox.shrink();
        return BiometricLockOverlay(
          child: ConnectivityBanner(child: inner),
        );
      },
    );
  }
}
