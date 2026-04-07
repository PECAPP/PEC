import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:pec_app/core/constants/app_colors.dart';
import 'package:pec_app/core/constants/app_dimensions.dart';
import 'package:pec_app/core/constants/app_text_styles.dart';
import 'package:pec_app/features/auth/presentation/providers/auth_provider.dart';

class LoadingSplashScreen extends ConsumerStatefulWidget {
  final String? email;

  const LoadingSplashScreen({
    Key? key,
    this.email,
  }) : super(key: key);

  @override
  ConsumerState<LoadingSplashScreen> createState() => _LoadingSplashScreenState();
}

class _LoadingSplashScreenState extends ConsumerState<LoadingSplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _progressController;
  late Animation<double> _progressAnimation;
  bool _hasCompleted = false;

  @override
  void initState() {
    super.initState();
    _progressController = AnimationController(
      duration: const Duration(seconds: 3),
      vsync: this,
    );

    _progressAnimation = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _progressController, curve: Curves.easeInOut),
    );

    _progressController.forward();
    _performAuthentication();
  }

  @override
  void dispose() {
    _progressController.dispose();
    super.dispose();
  }

  Future<void> _performAuthentication() async {
    try {
      await ref.read(authNotifierProvider.notifier).continueAsStudentFromSignUp(
            email: widget.email,
          );

      if (!mounted) return;

      await _progressController.forward().orCancel;

      if (!mounted) return;

      setState(() {
        _hasCompleted = true;
      });

      await Future.delayed(const Duration(milliseconds: 250));

      if (!mounted) return;
      context.go('/dashboard');
    } catch (e) {
      if (!mounted) return;
      context.pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.black,
      body: Center(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(AppDimensions.xxl),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Loading Text
                Text(
                  'Loading',
                  style: AppTextStyles.display.copyWith(
                    color: AppColors.white,
                  ),
                ),
                const SizedBox(height: AppDimensions.md),
                
                // Animated dots
                SizedBox(
                  height: AppDimensions.lg,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(
                      3,
                      (index) => AnimatedBuilder(
                        animation: _progressAnimation,
                        builder: (context, child) {
                          final value = _progressAnimation.value;
                          final delay = index * 0.15;
                          final opacity = (((value - delay) % 1.0).clamp(0.0, 1.0)).toDouble();
                          
                          return Opacity(
                            opacity: opacity,
                            child: Padding(
                              padding: const EdgeInsets.symmetric(
                                horizontal: AppDimensions.xs,
                              ),
                              child: Container(
                                width: 12,
                                height: 12,
                                decoration: BoxDecoration(
                                  color: AppColors.yellow,
                                  shape: BoxShape.circle,
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  ),
                ),
                
                const SizedBox(height: AppDimensions.xxl),
                const SizedBox(height: AppDimensions.lg),
                
                // Progress Bar Container
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(AppDimensions.md),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(AppDimensions.radiusMd),
                    border: Border.all(
                      color: AppColors.yellow.withValues(alpha: 0.3),
                      width: AppDimensions.borderWidth,
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Percentage Text
                      AnimatedBuilder(
                        animation: _progressAnimation,
                        builder: (context, child) {
                          final percentage = (_progressAnimation.value * 100).toInt();
                          return Text(
                            '$percentage%',
                            style: AppTextStyles.heading2.copyWith(
                              color: AppColors.yellow,
                              fontWeight: FontWeight.bold,
                            ),
                          );
                        },
                      ),
                      const SizedBox(height: AppDimensions.sm),
                      
                      // Progress Bar
                      AnimatedBuilder(
                        animation: _progressAnimation,
                        builder: (context, child) {
                          return ClipRRect(
                            borderRadius: BorderRadius.circular(4),
                            child: LinearProgressIndicator(
                              value: _progressAnimation.value,
                              minHeight: 8,
                              backgroundColor: AppColors.bgSurfaceDark,
                              valueColor: AlwaysStoppedAnimation<Color>(
                                AppColors.yellow,
                              ),
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                ),
                
                const SizedBox(height: AppDimensions.xxl),
                
                // Status Text
                Text(
                  _hasCompleted ? 'Taking you in...' : 'Initializing your account...',
                  textAlign: TextAlign.center,
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: AppColors.white.withValues(alpha: 0.7),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
