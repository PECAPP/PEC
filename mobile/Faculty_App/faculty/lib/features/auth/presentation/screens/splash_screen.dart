import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../providers/auth_provider.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen>
    with TickerProviderStateMixin {
  // Logo ring rotation
  late final AnimationController _ringCtrl;
  // Logo scale + fade
  late final AnimationController _logoCtrl;
  late final Animation<double> _logoScale;
  late final Animation<double> _logoFade;
  // Text slide-up fade
  late final AnimationController _textCtrl;
  late final Animation<double> _textFade;
  late final Animation<Offset> _textSlide;
  // Tagline delayed fade
  late final AnimationController _tagCtrl;
  late final Animation<double> _tagFade;
  // Bottom bar fill
  late final AnimationController _barCtrl;
  late final Animation<double> _barFill;
  // Glow pulse
  late final AnimationController _glowCtrl;
  late final Animation<double> _glowPulse;

  bool _navigated = false;

  @override
  void initState() {
    super.initState();

    _ringCtrl = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 6),
    )..repeat();

    _logoCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    );
    _logoScale = CurvedAnimation(
      parent: _logoCtrl,
      curve: Curves.elasticOut,
    ).drive(Tween(begin: 0.25, end: 1.0));
    _logoFade = CurvedAnimation(
      parent: _logoCtrl,
      curve: Curves.easeIn,
    ).drive(Tween(begin: 0.0, end: 1.0));

    _textCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 700),
    );
    _textFade = CurvedAnimation(
      parent: _textCtrl,
      curve: Curves.easeOut,
    ).drive(Tween(begin: 0.0, end: 1.0));
    _textSlide = CurvedAnimation(
      parent: _textCtrl,
      curve: Curves.easeOut,
    ).drive(Tween(begin: const Offset(0, 0.35), end: Offset.zero));

    _tagCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _tagFade = CurvedAnimation(
      parent: _tagCtrl,
      curve: Curves.easeOut,
    ).drive(Tween(begin: 0.0, end: 1.0));

    _barCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2200),
    );
    _barFill = CurvedAnimation(
      parent: _barCtrl,
      curve: Curves.easeInOutCubic,
    ).drive(Tween(begin: 0.0, end: 1.0));

    _glowCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    )..repeat(reverse: true);
    _glowPulse = CurvedAnimation(
      parent: _glowCtrl,
      curve: Curves.easeInOut,
    ).drive(Tween(begin: 0.4, end: 1.0));

    _runSequence();
  }

  Future<void> _runSequence() async {
    try {
      await Future.delayed(const Duration(milliseconds: 100));
      if (!mounted) return;
      await _logoCtrl.forward().orCancel;

      await Future.delayed(const Duration(milliseconds: 500));
      if (!mounted) return;
      await _textCtrl.forward().orCancel;

      await Future.delayed(const Duration(milliseconds: 300));
      if (!mounted) return;
      await _tagCtrl.forward().orCancel;

      await Future.delayed(const Duration(milliseconds: 200));
      if (!mounted) return;

      // Wait for bar to complete then navigate.
      await _barCtrl.forward().orCancel;
      if (!mounted) return;

      await Future.delayed(const Duration(milliseconds: 300));
      if (!mounted) return;
      _navigate();
    } on TickerCanceled {
      // The splash screen was disposed before the sequence finished.
    }
  }

  void _navigate() {
    if (_navigated || !mounted) return;
    _navigated = true;

    final authState = ref.read(authNotifierProvider);
    if (authState.status == AuthStatus.authenticated) {
      context.go('/dashboard');
    } else {
      context.go('/login');
    }
  }

  @override
  void dispose() {
    _ringCtrl.dispose();
    _logoCtrl.dispose();
    _textCtrl.dispose();
    _tagCtrl.dispose();
    _barCtrl.dispose();
    _glowCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.sizeOf(context);

    return Scaffold(
      backgroundColor: AppColors.bgDark,
      body: Stack(
        children: [
          // ── Background radial glow ──
          AnimatedBuilder(
            animation: _glowPulse,
            builder: (_, __) => Positioned(
              top: size.height * 0.18,
              left: size.width * 0.5 - 180,
              child: Container(
                width: 360,
                height: 360,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [
                      AppColors.gold.withValues(alpha: 0.10 * _glowPulse.value),
                      AppColors.transparent,
                    ],
                  ),
                ),
              ),
            ),
          ),

          // ── Decorative dot grid (top-right) ──
          Positioned(
            top: 40,
            right: 20,
            child: _DotGrid(
              rows: 5,
              cols: 5,
              color: AppColors.gold.withValues(alpha: 0.08),
            ),
          ),

          // ── Decorative dot grid (bottom-left) ──
          Positioned(
            bottom: 80,
            left: 20,
            child: _DotGrid(
              rows: 4,
              cols: 4,
              color: AppColors.gold.withValues(alpha: 0.06),
            ),
          ),

          // ── Main content ──
          SafeArea(
            child: Column(
              children: [
                const Spacer(flex: 3),

                // ── Logo ──
                AnimatedBuilder(
                  animation: Listenable.merge([
                    _logoScale,
                    _logoFade,
                    _glowPulse,
                  ]),
                  builder: (_, __) => Opacity(
                    opacity: _logoFade.value,
                    child: Transform.scale(
                      scale: _logoScale.value,
                      child: _LogoMark(
                        ringCtrl: _ringCtrl,
                        glowPulse: _glowPulse,
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 36),

                // ── PEC Name ──
                FadeTransition(
                  opacity: _textFade,
                  child: SlideTransition(
                    position: _textSlide,
                    child: Column(
                      children: [
                        ShaderMask(
                          shaderCallback: (bounds) => const LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: [
                              AppColors.goldLight,
                              AppColors.gold,
                              AppColors.goldDark,
                            ],
                            stops: [0.0, 0.5, 1.0],
                          ).createShader(bounds),
                          child: Text(
                            'PEC',
                            style: AppTextStyles.display.copyWith(
                              fontSize: 52,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 8,
                              color: AppColors.white,
                            ),
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Punjab Engineering College',
                          style: AppTextStyles.heading3.copyWith(
                            color: AppColors.textPrimary,
                            fontWeight: FontWeight.w500,
                            letterSpacing: 0.5,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Chandigarh  ·  Est. 1963',
                          style: AppTextStyles.caption.copyWith(
                            color: AppColors.textMuted,
                            letterSpacing: 2,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 28),

                // ── Divider with Faculty Portal badge ──
                FadeTransition(
                  opacity: _tagFade,
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          SizedBox(
                            width: 48,
                            child: Divider(
                              color: AppColors.gold.withValues(alpha: 0.3),
                              thickness: 1,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 14,
                              vertical: 5,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.gold.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                color: AppColors.gold.withValues(alpha: 0.25),
                              ),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  Icons.school_rounded,
                                  size: 13,
                                  color: AppColors.gold,
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  'FACULTY PORTAL',
                                  style: AppTextStyles.labelSmall.copyWith(
                                    color: AppColors.gold,
                                    fontSize: 10,
                                    letterSpacing: 2,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 12),
                          SizedBox(
                            width: 48,
                            child: Divider(
                              color: AppColors.gold.withValues(alpha: 0.3),
                              thickness: 1,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const Spacer(flex: 4),

                // ── Bottom loading bar ──
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 48),
                  child: Column(
                    children: [
                      FadeTransition(
                        opacity: _tagFade,
                        child: Text(
                          'Initializing...',
                          style: AppTextStyles.caption.copyWith(
                            color: AppColors.textMuted.withValues(alpha: 0.6),
                            fontSize: 10,
                            letterSpacing: 1.5,
                          ),
                        ),
                      ),
                      const SizedBox(height: 10),
                      AnimatedBuilder(
                        animation: _barFill,
                        builder: (_, __) => ClipRRect(
                          borderRadius: BorderRadius.circular(4),
                          child: Container(
                            height: 2.5,
                            width: double.infinity,
                            color: AppColors.borderDark,
                            child: FractionallySizedBox(
                              alignment: Alignment.centerLeft,
                              widthFactor: _barFill.value,
                              child: Container(
                                decoration: BoxDecoration(
                                  gradient: const LinearGradient(
                                    colors: [
                                      AppColors.goldDark,
                                      AppColors.gold,
                                      AppColors.goldLight,
                                    ],
                                  ),
                                  borderRadius: BorderRadius.circular(4),
                                  boxShadow: [
                                    BoxShadow(
                                      color: AppColors.gold.withValues(
                                        alpha: 0.5,
                                      ),
                                      blurRadius: 6,
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 40),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ── Logo mark with spinning ring ──────────────────────────────────────────────

class _LogoMark extends StatelessWidget {
  final AnimationController ringCtrl;
  final Animation<double> glowPulse;

  const _LogoMark({required this.ringCtrl, required this.glowPulse});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 130,
      height: 130,
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Outer glow halo
          AnimatedBuilder(
            animation: glowPulse,
            builder: (_, __) => Container(
              width: 130,
              height: 130,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: AppColors.gold.withValues(
                      alpha: 0.18 * glowPulse.value,
                    ),
                    blurRadius: 40,
                    spreadRadius: 8,
                  ),
                ],
              ),
            ),
          ),

          // Rotating dashed ring
          AnimatedBuilder(
            animation: ringCtrl,
            builder: (_, __) => Transform.rotate(
              angle: ringCtrl.value * 2 * math.pi,
              child: CustomPaint(
                size: const Size(122, 122),
                painter: _DashedRingPainter(
                  color: AppColors.gold.withValues(alpha: 0.35),
                  dashCount: 18,
                  strokeWidth: 1.5,
                ),
              ),
            ),
          ),

          // Counter-rotating inner ring
          AnimatedBuilder(
            animation: ringCtrl,
            builder: (_, __) => Transform.rotate(
              angle: -ringCtrl.value * 2 * math.pi * 0.6,
              child: CustomPaint(
                size: const Size(104, 104),
                painter: _DashedRingPainter(
                  color: AppColors.goldLight.withValues(alpha: 0.18),
                  dashCount: 10,
                  strokeWidth: 1.0,
                ),
              ),
            ),
          ),

          // Center circle
          Container(
            width: 86,
            height: 86,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  AppColors.goldLight,
                  AppColors.gold,
                  AppColors.goldDark,
                ],
                stops: [0.0, 0.55, 1.0],
              ),
              boxShadow: [
                BoxShadow(
                  color: AppColors.gold.withValues(alpha: 0.3),
                  blurRadius: 20,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: const Icon(
              Icons.school_rounded,
              color: AppColors.bgDark,
              size: 40,
            ),
          ),
        ],
      ),
    );
  }
}

// ── Dashed ring painter ────────────────────────────────────────────────────────

class _DashedRingPainter extends CustomPainter {
  final Color color;
  final int dashCount;
  final double strokeWidth;

  _DashedRingPainter({
    required this.color,
    required this.dashCount,
    required this.strokeWidth,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round;

    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;
    final dashAngle = (2 * math.pi) / dashCount;
    final gapFraction = 0.4;

    for (int i = 0; i < dashCount; i++) {
      final startAngle = i * dashAngle;
      final sweepAngle = dashAngle * (1 - gapFraction);
      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius),
        startAngle,
        sweepAngle,
        false,
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(_DashedRingPainter old) =>
      old.color != color || old.dashCount != dashCount;
}

// ── Dot grid decoration ────────────────────────────────────────────────────────

class _DotGrid extends StatelessWidget {
  final int rows;
  final int cols;
  final Color color;

  const _DotGrid({required this.rows, required this.cols, required this.color});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: List.generate(
        rows,
        (r) => Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: Row(
            children: List.generate(
              cols,
              (c) => Padding(
                padding: const EdgeInsets.only(right: 8),
                child: Container(
                  width: 3,
                  height: 3,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: color,
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
