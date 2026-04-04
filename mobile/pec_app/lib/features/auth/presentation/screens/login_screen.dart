import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/pec_button.dart';
import '../../../../shared/widgets/pec_text_field.dart';
import '../providers/auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _obscurePassword = true;
  bool _loading = false;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    setState(() => _loading = true);
    await ref.read(authNotifierProvider.notifier).signIn(
          email: _emailCtrl.text.trim(),
          password: _passwordCtrl.text,
        );
    if (mounted) setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    final error = ref.watch(authNotifierProvider).error;

    return Scaffold(
      backgroundColor: AppColors.black,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppDimensions.lg),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: AppDimensions.xxl),

                // Logo / title
                Container(
                  padding: const EdgeInsets.all(AppDimensions.xs),
                  decoration: BoxDecoration(
                    color: Colors.transparent,
                    border: Border.all(color: AppColors.black, width: AppDimensions.borderWidth),
                  ),
                  child: Image.asset(
                    'assets/images/PECLogo.png',
                    height: 72,
                    fit: BoxFit.contain,
                  ),
                ),
                const SizedBox(height: AppDimensions.lg),
                Text(
                  'SIGN IN',
                  style: AppTextStyles.display.copyWith(color: AppColors.white),
                ),
                const SizedBox(height: AppDimensions.sm),
                Text(
                  'Punjab Engineering College — Campus ERP',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: AppColors.white.withValues(alpha: 0.6),
                  ),
                ),
                const SizedBox(height: AppDimensions.xxl),

                // Email
                PecTextField(
                  controller: _emailCtrl,
                  label: 'EMAIL',
                  keyboardType: TextInputType.emailAddress,
                  textInputAction: TextInputAction.next,
                  dark: true,
                  validator: (v) {
                    if (v == null || v.isEmpty) return 'Email is required';
                    if (!RegExp(r'^[^@]+@[^@]+\.[^@]+').hasMatch(v)) {
                      return 'Enter a valid email';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: AppDimensions.md),

                // Password
                PecTextField(
                  controller: _passwordCtrl,
                  label: 'PASSWORD',
                  obscureText: _obscurePassword,
                  textInputAction: TextInputAction.done,
                  onSubmitted: (_) => _submit(),
                  dark: true,
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscurePassword ? Icons.visibility_off : Icons.visibility,
                      color: AppColors.white.withValues(alpha: 0.6),
                    ),
                    onPressed: () =>
                        setState(() => _obscurePassword = !_obscurePassword),
                  ),
                  validator: (v) {
                    if (v == null || v.isEmpty) return 'Password is required';
                    return null;
                  },
                ),
                const SizedBox(height: AppDimensions.sm),

                // Forgot password
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: () => context.push('/forgot-password'),
                    child: Text(
                      'Forgot password?',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.yellow,
                        decoration: TextDecoration.underline,
                        decorationColor: AppColors.yellow,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: AppDimensions.md),

                // Error
                if (error != null) ...[
                  Container(
                    padding: const EdgeInsets.all(AppDimensions.md),
                    decoration: BoxDecoration(
                      color: AppColors.red.withValues(alpha: 0.15),
                      border: Border.all(color: AppColors.red, width: 2),
                    ),
                    child: Text(
                      error,
                      style: AppTextStyles.bodySmall.copyWith(color: AppColors.red),
                    ),
                  ),
                  const SizedBox(height: AppDimensions.md),
                ],

                // Submit button
                PecButton(
                  label: 'SIGN IN',
                  onPressed: _loading ? null : _submit,
                  isLoading: _loading,
                  fullWidth: true,
                  color: AppColors.yellow,
                ),
                const SizedBox(height: AppDimensions.md),
                Center(
                  child: TextButton(
                    onPressed: _loading
                        ? null
                        : () async {
                            await ref
                                .read(authNotifierProvider.notifier)
                                .continueAsStudentFromSignUp(
                                  email: _emailCtrl.text.trim(),
                                );
                            if (context.mounted) {
                              context.go('/dashboard');
                            }
                          },
                    child: Text(
                      'SIGN UP',
                      style: AppTextStyles.bodyMedium.copyWith(
                        color: AppColors.yellow,
                        decoration: TextDecoration.underline,
                        decorationColor: AppColors.yellow,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
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
