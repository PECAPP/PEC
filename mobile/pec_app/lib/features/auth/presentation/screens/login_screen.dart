import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/pec_button.dart';
import '../providers/auth_provider.dart';
import 'signing_in_splash_screen.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final email = _emailCtrl.text.trim();
    final password = _passwordCtrl.text.trim();
    if (email.isEmpty) return;

    await Navigator.of(context).push(
      PageRouteBuilder(
        opaque: true,
        fullscreenDialog: true,
        pageBuilder: (_, __, ___) => SigningInSplashScreen(
          email: email,
          password: password,
        ),
        transitionsBuilder: (_, anim, __, child) =>
            FadeTransition(opacity: anim, child: child),
        transitionDuration: const Duration(milliseconds: 280),
      ),
    );
  }

  Future<void> _useTestAccount() async {
    await ref.read(authNotifierProvider.notifier).continueAsStudentFromSignUp(
          email: _emailCtrl.text.trim().isEmpty ? null : _emailCtrl.text.trim(),
        );
    if (!mounted) return;
    context.go('/dashboard');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.black,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppDimensions.md),
          child: Column(
            children: [
              const SizedBox(height: AppDimensions.xxl),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(AppDimensions.lg),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: AppColors.yellow.withValues(alpha: 0.2)),
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      AppColors.yellow.withValues(alpha: 0.1),
                      const Color(0xFF171717),
                    ],
                  ),
                ),
                child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Text(
                    'SIGN IN',
                    style: AppTextStyles.display.copyWith(
                      color: AppColors.white,
                      fontSize: 48,
                    ),
                  ),
                ),
                const SizedBox(height: AppDimensions.md),
                Container(
                  width: 72,
                  height: 6,
                  color: AppColors.yellow,
                ),
                const SizedBox(height: AppDimensions.xl),
                Center(
                  child: Text(
                    'Authenticate via the central university gateway.',
                    style: AppTextStyles.bodyMedium
                        .copyWith(color: AppColors.white.withValues(alpha: 0.78)),
                  ),
                ),
                const SizedBox(height: AppDimensions.md),
                Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: AppColors.yellow.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: AppColors.yellow.withValues(alpha: 0.16)),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: GestureDetector(
                          onTap: _submit,
                          child: Container(
                            height: 40,
                            decoration: BoxDecoration(
                              color: AppColors.yellow,
                              borderRadius: BorderRadius.circular(5),
                            ),
                            child: Center(
                              child: Text(
                                'SIGN IN',
                                style: AppTextStyles.labelLarge.copyWith(
                                  color: AppColors.black,
                                  letterSpacing: 1,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                      Expanded(
                        child: GestureDetector(
                          onTap: () => context.go('/intro'),
                          child: SizedBox(
                            height: 40,
                            child: Center(
                              child: Text(
                                'REGISTER',
                                style: AppTextStyles.labelLarge.copyWith(
                                  color: AppColors.white.withValues(alpha: 0.7),
                                  letterSpacing: 1,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: AppDimensions.xl),
                Text(
                  'EMAIL ACCESS',
                  style: AppTextStyles.labelSmall
                      .copyWith(color: AppColors.white.withValues(alpha: 0.5), letterSpacing: 1.5),
                ),
                const SizedBox(height: AppDimensions.sm),
                _InputShell(
                  child: Row(
                    children: [
                      Icon(Icons.email_outlined,
                          color: AppColors.white.withValues(alpha: 0.55), size: 20),
                      const SizedBox(width: AppDimensions.sm),
                      Expanded(
                        child: TextField(
                          controller: _emailCtrl,
                          keyboardType: TextInputType.emailAddress,
                          style: AppTextStyles.bodyMedium.copyWith(color: AppColors.white),
                          decoration: InputDecoration(
                            hintText: 'arjun@pec.edu',
                            hintStyle: AppTextStyles.bodyMedium
                                .copyWith(color: AppColors.white.withValues(alpha: 0.4)),
                            border: InputBorder.none,
                            isCollapsed: true,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: AppDimensions.md),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'PASSWORD',
                      style: AppTextStyles.labelSmall.copyWith(
                        color: AppColors.white.withValues(alpha: 0.5),
                        letterSpacing: 1.5,
                      ),
                    ),
                    TextButton(
                      onPressed: () => context.push('/forgot-password'),
                      child: Text(
                        'Forgot password?',
                        style: AppTextStyles.labelLarge.copyWith(color: AppColors.yellow),
                      ),
                    ),
                  ],
                ),
                _InputShell(
                  child: Row(
                    children: [
                      Icon(Icons.lock_outline,
                          color: AppColors.white.withValues(alpha: 0.55), size: 20),
                      const SizedBox(width: AppDimensions.sm),
                      Expanded(
                        child: TextField(
                          controller: _passwordCtrl,
                          obscureText: _obscurePassword,
                          onSubmitted: (_) => _submit(),
                          style: AppTextStyles.bodyMedium.copyWith(color: AppColors.white),
                          decoration: InputDecoration(
                            hintText: '••••••••',
                            hintStyle: AppTextStyles.bodyMedium
                                .copyWith(color: AppColors.white.withValues(alpha: 0.4)),
                            border: InputBorder.none,
                            isCollapsed: true,
                          ),
                        ),
                      ),
                      IconButton(
                        onPressed: () =>
                            setState(() => _obscurePassword = !_obscurePassword),
                        icon: Icon(
                          _obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                          color: AppColors.white.withValues(alpha: 0.55),
                        ),
                      )
                    ],
                  ),
                ),
                const SizedBox(height: AppDimensions.lg),
                PecButton(
                  label: 'SIGN IN',
                  onPressed: _submit,
                  fullWidth: true,
                  color: AppColors.yellow,
                ),
                const SizedBox(height: AppDimensions.lg),
                Row(
                  children: [
                    Expanded(
                      child: Divider(color: AppColors.white.withValues(alpha: 0.2), thickness: 1),
                    ),
                    Container(
                      margin: const EdgeInsets.symmetric(horizontal: AppDimensions.sm),
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      color: AppColors.black.withValues(alpha: 0.35),
                      child: Text(
                        'AUTHORIZED ACCESS',
                        style: AppTextStyles.labelSmall.copyWith(
                          color: AppColors.white.withValues(alpha: 0.5),
                          fontSize: 10,
                          letterSpacing: 2,
                        ),
                      ),
                    ),
                    Expanded(
                      child: Divider(color: AppColors.white.withValues(alpha: 0.2), thickness: 1),
                    ),
                  ],
                ),
                const SizedBox(height: AppDimensions.lg),
                Container(
                  width: double.infinity,
                  height: 52,
                  decoration: BoxDecoration(
                    color: AppColors.black.withValues(alpha: 0.25),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(
                        color: AppColors.yellow.withValues(alpha: 0.28),
                        width: 1,
                        strokeAlign: BorderSide.strokeAlignOutside),
                  ),
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
                      borderRadius: BorderRadius.circular(6),
                      onTap: _useTestAccount,
                      child: Center(
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.shield_outlined,
                                color: AppColors.yellow.withValues(alpha: 0.9), size: 18),
                            const SizedBox(width: AppDimensions.sm),
                            Text(
                              'USE TEST ACCOUNTS',
                              style: AppTextStyles.labelLarge
                                  .copyWith(color: AppColors.white, letterSpacing: 1),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
              const SizedBox(height: AppDimensions.xxl),
            ],
          ),
        ),
      ),
    );
  }
}

class _InputShell extends StatelessWidget {
  final Widget child;
  const _InputShell({required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      height: 54,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: AppColors.black.withValues(alpha: 0.2),
        border: Border.all(color: AppColors.yellow.withValues(alpha: 0.2)),
        borderRadius: BorderRadius.circular(6),
      ),
      child: child,
    );
  }
}
