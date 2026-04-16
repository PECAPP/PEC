import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../providers/auth_provider.dart';
import 'signing_in_splash_screen.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen>
    with SingleTickerProviderStateMixin {
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _obscure = true;
  late final AnimationController _fadeCtrl;
  late final Animation<double> _fadeAnim;

  @override
  void initState() {
    super.initState();
    _fadeCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    )..forward();
    _fadeAnim = CurvedAnimation(parent: _fadeCtrl, curve: Curves.easeOut);
  }

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    _fadeCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final email = _emailCtrl.text.trim();
    final password = _passwordCtrl.text.trim();
    if (email.isEmpty || password.isEmpty) return;

    await Navigator.of(context).push(
      PageRouteBuilder(
        opaque: true,
        fullscreenDialog: true,
        pageBuilder: (_, _, _) => SigningInSplashScreen(
          email: email,
          password: password,
        ),
        transitionsBuilder: (_, anim, _, child) =>
            FadeTransition(opacity: anim, child: child),
        transitionDuration: const Duration(milliseconds: 300),
      ),
    );
  }

  Future<void> _useTestAccount() async {
    await ref.read(authNotifierProvider.notifier).signInWithTestAccount();
    if (mounted) context.go('/dashboard');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      body: SafeArea(
        child: FadeTransition(
          opacity: _fadeAnim,
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(AppDimensions.lg),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 420),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // ── Logo / Branding ──
                    Center(
                      child: Container(
                        width: 72,
                        height: 72,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: [AppColors.gold, AppColors.goldDark],
                          ),
                        ),
                        child: const Icon(Icons.school_rounded, color: AppColors.bgDark, size: 36),
                      ),
                    ),
                    const SizedBox(height: AppDimensions.lg),

                    // ── Title ──
                    Center(
                      child: Text('Faculty Portal', style: AppTextStyles.heading1),
                    ),
                    const SizedBox(height: AppDimensions.sm),
                    Center(
                      child: Text(
                        'Punjab Engineering College, Chandigarh',
                        style: AppTextStyles.bodySmall.copyWith(color: AppColors.textMuted),
                      ),
                    ),
                    const SizedBox(height: AppDimensions.xxl),

                    // ── Email ──
                    Text(
                      'EMAIL',
                      style: AppTextStyles.labelSmall.copyWith(
                        color: AppColors.textMuted,
                        letterSpacing: 1.5,
                      ),
                    ),
                    const SizedBox(height: AppDimensions.sm),
                    _InputField(
                      controller: _emailCtrl,
                      hint: 'professor@pec.edu.in',
                      icon: Icons.email_outlined,
                      keyboardType: TextInputType.emailAddress,
                    ),
                    const SizedBox(height: AppDimensions.md),

                    // ── Password ──
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'PASSWORD',
                          style: AppTextStyles.labelSmall.copyWith(
                            color: AppColors.textMuted,
                            letterSpacing: 1.5,
                          ),
                        ),
                        GestureDetector(
                          onTap: () => context.push('/forgot-password'),
                          child: Text(
                            'Forgot?',
                            style: AppTextStyles.labelMedium.copyWith(color: AppColors.gold),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppDimensions.sm),
                    _InputField(
                      controller: _passwordCtrl,
                      hint: '••••••••',
                      icon: Icons.lock_outline,
                      obscure: _obscure,
                      onSubmitted: (_) => _submit(),
                      suffix: IconButton(
                        onPressed: () => setState(() => _obscure = !_obscure),
                        icon: Icon(
                          _obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                          color: AppColors.textMuted,
                          size: 20,
                        ),
                      ),
                    ),
                    const SizedBox(height: AppDimensions.xl),

                    // ── Sign In Button ──
                    SizedBox(
                      width: double.infinity,
                      height: 52,
                      child: ElevatedButton(
                        onPressed: _submit,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.gold,
                          foregroundColor: AppColors.bgDark,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(AppDimensions.borderRadiusMd),
                          ),
                        ),
                        child: Text('SIGN IN', style: AppTextStyles.button.copyWith(
                          color: AppColors.bgDark,
                          letterSpacing: 1,
                          fontWeight: FontWeight.w700,
                        )),
                      ),
                    ),
                    const SizedBox(height: AppDimensions.lg),

                    // ── Divider ──
                    Row(
                      children: [
                        Expanded(child: Divider(color: AppColors.borderDark)),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: Text(
                            'FACULTY ACCESS ONLY',
                            style: AppTextStyles.labelSmall.copyWith(
                              color: AppColors.textMuted,
                              fontSize: 9,
                              letterSpacing: 2,
                            ),
                          ),
                        ),
                        Expanded(child: Divider(color: AppColors.borderDark)),
                      ],
                    ),
                    const SizedBox(height: AppDimensions.lg),

                    // ── Test Account ──
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: OutlinedButton.icon(
                        onPressed: () async {
                          _emailCtrl.text = 'faculty@pec.edu.in';
                          _passwordCtrl.text = 'password';
                          await _useTestAccount();
                        },
                        icon: Icon(Icons.shield_outlined, size: 18, color: AppColors.gold),
                        label: Text('USE TEST ACCOUNT',
                            style: AppTextStyles.labelMedium.copyWith(color: AppColors.textPrimary)),
                        style: OutlinedButton.styleFrom(
                          side: BorderSide(color: AppColors.gold.withValues(alpha: 0.3)),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(AppDimensions.borderRadiusMd),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _InputField extends StatefulWidget {
  final TextEditingController controller;
  final String hint;
  final IconData icon;
  final bool obscure;
  final TextInputType? keyboardType;
  final ValueChanged<String>? onSubmitted;
  final Widget? suffix;

  const _InputField({
    required this.controller,
    required this.hint,
    required this.icon,
    this.obscure = false,
    this.keyboardType,
    this.onSubmitted,
    this.suffix,
  });

  @override
  State<_InputField> createState() => _InputFieldState();
}

class _InputFieldState extends State<_InputField> {
  late final FocusNode _focusNode;
  bool _isFocused = false;

  @override
  void initState() {
    super.initState();
    _focusNode = FocusNode()
      ..addListener(() {
        if (mounted) {
          setState(() => _isFocused = _focusNode.hasFocus);
        }
      });
  }

  @override
  void dispose() {
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 220),
      curve: Curves.easeOutCubic,
      decoration: BoxDecoration(
        color: _isFocused
            ? AppColors.cardHoverDark.withValues(alpha: 0.95)
            : AppColors.surfaceDark,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: _isFocused
              ? AppColors.gold.withValues(alpha: 0.55)
              : AppColors.borderDark,
          width: _isFocused ? 1.3 : 1,
        ),
        boxShadow: _isFocused
            ? [
                BoxShadow(
                  color: AppColors.gold.withValues(alpha: 0.12),
                  blurRadius: 16,
                  spreadRadius: 0.5,
                  offset: const Offset(0, 4),
                ),
              ]
            : const [],
      ),
      child: Row(
        children: [
          Padding(
            padding: const EdgeInsets.only(left: 14),
            child: AnimatedScale(
              scale: _isFocused ? 1.05 : 1,
              duration: const Duration(milliseconds: 180),
              curve: Curves.easeOut,
              child: Icon(
                widget.icon,
                color: _isFocused ? AppColors.gold : AppColors.textMuted,
                size: 20,
              ),
            ),
          ),
          Expanded(
            child: TextField(
              controller: widget.controller,
              focusNode: _focusNode,
              obscureText: widget.obscure,
              keyboardType: widget.keyboardType,
              onSubmitted: widget.onSubmitted,
              style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textPrimary),
              decoration: InputDecoration(
                hintText: widget.hint,
                hintStyle: AppTextStyles.bodyMedium.copyWith(color: AppColors.textMuted),
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 16),
              ),
            ),
          ),
          if (widget.suffix != null) widget.suffix!,
        ],
      ),
    );
  }
}
