import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../providers/connectivity_provider.dart';

/// Wraps [child] and shows a slim banner at the top when the device is offline.
/// Drop this anywhere in the widget tree — it is purely visual.
class ConnectivityBanner extends ConsumerStatefulWidget {
  final Widget child;
  const ConnectivityBanner({super.key, required this.child});

  @override
  ConsumerState<ConnectivityBanner> createState() => _ConnectivityBannerState();
}

class _ConnectivityBannerState extends ConsumerState<ConnectivityBanner>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double> _slide;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _slide = CurvedAnimation(parent: _ctrl, curve: Curves.easeOut);
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isOnline = ref.watch(isOnlineProvider);

    // Drive animation based on connectivity
    if (!isOnline) {
      _ctrl.forward();
    } else {
      _ctrl.reverse();
    }

    return Column(
      children: [
        SizeTransition(
          sizeFactor: _slide,
          axisAlignment: -1,
          child: const _OfflineBanner(),
        ),
        Expanded(child: widget.child),
      ],
    );
  }
}

class _OfflineBanner extends StatelessWidget {
  const _OfflineBanner();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      color: AppColors.red,
      padding: EdgeInsets.only(
        top: MediaQuery.of(context).padding.top,
        bottom: 6,
        left: 16,
        right: 16,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.wifi_off_rounded, color: AppColors.white, size: 16),
          const SizedBox(width: 8),
          Text(
            'No internet connection',
            style: AppTextStyles.labelSmall.copyWith(color: AppColors.white),
          ),
        ],
      ),
    );
  }
}
