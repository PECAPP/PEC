import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/pec_button.dart';
import '../../../../shared/widgets/pec_text_field.dart';
import '../providers/auth_provider.dart';

class ForgotPasswordScreen extends ConsumerStatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  ConsumerState<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends ConsumerState<ForgotPasswordScreen> {
  final _emailCtrl = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _loading = false;
  bool _sent = false;
  String? _error;

  @override
  void dispose() {
    _emailCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    setState(() { _loading = true; _error = null; });
    try {
      await ref.read(authRemoteDataSourceProvider).forgotPassword(_emailCtrl.text.trim());
      if (mounted) setState(() { _loading = false; _sent = true; });
    } catch (e) {
      if (mounted) setState(() { _loading = false; _error = e.toString(); });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.black,
      appBar: AppBar(
        backgroundColor: AppColors.black,
        foregroundColor: AppColors.white,
        title: Text('FORGOT PASSWORD',
            style: AppTextStyles.heading3.copyWith(color: AppColors.white)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.white),
          onPressed: () => context.pop(),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppDimensions.lg),
          child: _sent
              ? _SuccessView(email: _emailCtrl.text.trim())
              : Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Enter your registered email address. We\'ll send you a password reset link.',
                        style: AppTextStyles.bodyMedium
                            .copyWith(color: AppColors.white.withValues(alpha: 0.7)),
                      ),
                      const SizedBox(height: AppDimensions.xl),
                      PecTextField(
                        controller: _emailCtrl,
                        label: 'EMAIL',
                        keyboardType: TextInputType.emailAddress,
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
                      if (_error != null)
                        Text(_error!,
                            style: AppTextStyles.bodySmall
                                .copyWith(color: AppColors.red)),
                      const SizedBox(height: AppDimensions.lg),
                      PecButton(
                        label: 'SEND RESET LINK',
                        onPressed: _loading ? null : _submit,
                        isLoading: _loading,
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

class _SuccessView extends StatelessWidget {
  final String email;
  const _SuccessView({required this.email});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(AppDimensions.md),
          decoration: BoxDecoration(
            color: AppColors.green.withValues(alpha: 0.15),
            border: Border.all(color: AppColors.green, width: 2),
          ),
          child: Row(
            children: [
              const Icon(Icons.check_circle, color: AppColors.green),
              const SizedBox(width: AppDimensions.sm),
              Expanded(
                child: Text(
                  'Reset link sent to $email',
                  style: AppTextStyles.bodyMedium.copyWith(color: AppColors.green),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: AppDimensions.xl),
        PecButton(
          label: 'BACK TO LOGIN',
          onPressed: () => context.go('/login'),
          fullWidth: true,
          color: AppColors.yellow,
        ),
      ],
    );
  }
}
