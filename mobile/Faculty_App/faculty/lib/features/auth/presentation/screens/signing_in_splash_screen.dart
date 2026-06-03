import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../providers/auth_provider.dart';

/// Full-screen splash shown while the sign-in API call is in-flight.
/// Pops back on error, navigates to /dashboard on success.
class SigningInSplashScreen extends ConsumerStatefulWidget {
  final String email;
  final String password;
  const SigningInSplashScreen({super.key, required this.email, required this.password});

  @override
  ConsumerState<SigningInSplashScreen> createState() => _SigningInSplashScreenState();
}

class _SigningInSplashScreenState extends ConsumerState<SigningInSplashScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _pulse;
  String? _error;

  @override
  void initState() {
    super.initState();
    _pulse = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);
    _doSignIn();
  }

  @override
  void dispose() {
    _pulse.dispose();
    super.dispose();
  }

  Future<void> _doSignIn() async {
    try {
      await ref.read(authNotifierProvider.notifier).signIn(
        email: widget.email,
        password: widget.password,
      );
      if (!mounted) return;
      context.go('/dashboard');
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = e.toString());
      await Future.delayed(const Duration(seconds: 2));
      if (mounted) Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            AnimatedBuilder(
              animation: _pulse,
              builder: (_, _) => Opacity(
                opacity: 0.5 + _pulse.value * 0.5,
                child: Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: AppColors.gold, width: 2),
                  ),
                  child: Icon(
                    _error != null ? Icons.error_outline : Icons.school_outlined,
                    color: _error != null ? AppColors.error : AppColors.gold,
                    size: 36,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 32),
            Text(
              _error != null ? 'Sign In Failed' : 'Authenticating...',
              style: AppTextStyles.heading3.copyWith(
                color: _error != null ? AppColors.error : AppColors.textPrimary,
              ),
            ),
            if (_error != null) ...[
              const SizedBox(height: 12),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 48),
                child: Text(
                  _error!,
                  style: AppTextStyles.bodySmall.copyWith(color: AppColors.error),
                  textAlign: TextAlign.center,
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ] else ...[
              const SizedBox(height: 16),
              SizedBox(
                width: 24,
                height: 24,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation(AppColors.gold),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
