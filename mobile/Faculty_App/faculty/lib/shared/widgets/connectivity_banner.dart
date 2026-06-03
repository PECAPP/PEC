import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';

final _connectivityStream = StreamProvider<List<ConnectivityResult>>((ref) {
  return Connectivity().onConnectivityChanged;
});

final isOnlineProvider = Provider<bool>((ref) {
  final result = ref.watch(_connectivityStream);
  return result.when(
    data: (r) => r.isNotEmpty && r.any((v) => v != ConnectivityResult.none),
    loading: () => true,
    error: (_, _) => true,
  );
});

class ConnectivityBanner extends ConsumerWidget {
  final Widget child;
  const ConnectivityBanner({super.key, required this.child});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isOnline = ref.watch(isOnlineProvider);
    return Column(
      children: [
        AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          height: isOnline ? 0 : (MediaQuery.of(context).padding.top + 28),
          color: AppColors.error,
          child: isOnline
              ? const SizedBox.shrink()
              : SafeArea(
                  bottom: false,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.wifi_off_rounded, color: AppColors.white, size: 14),
                      const SizedBox(width: 6),
                      Text(
                        'No internet connection',
                        style: AppTextStyles.labelSmall.copyWith(color: AppColors.white),
                      ),
                    ],
                  ),
                ),
        ),
        Expanded(child: child),
      ],
    );
  }
}
