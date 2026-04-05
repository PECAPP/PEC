import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../providers/auth_provider.dart';

class WelcomeSplashScreen extends ConsumerStatefulWidget {
  const WelcomeSplashScreen({super.key});

  @override
  ConsumerState<WelcomeSplashScreen> createState() =>
      _WelcomeSplashScreenState();
}

class _WelcomeSplashScreenState extends ConsumerState<WelcomeSplashScreen>
    with TickerProviderStateMixin {
  // ── Controllers ────────────────────────────────────────────────────────────
  late final AnimationController _mainCtrl;
  late final AnimationController _exitCtrl;
  late final AnimationController _particleCtrl;

  // ── Logo ───────────────────────────────────────────────────────────────────
  late final Animation<double> _logoScale;
  late final Animation<double> _logoFade;
  late final Animation<double> _logoBorderExpand;

  // ── Yellow accent bar ──────────────────────────────────────────────────────
  late final Animation<double> _accentBarWidth;

  // ── Text reveals ──────────────────────────────────────────────────────────
  late final Animation<double> _line1Fade;
  late final Animation<Offset> _line1Slide;
  late final Animation<double> _line2Fade;
  late final Animation<Offset> _line2Slide;
  late final Animation<double> _line3Fade;

  // ── Progress bar ──────────────────────────────────────────────────────────
  late final Animation<double> _progress;
  late final Animation<double> _progressFade;

  // ── Floating squares ──────────────────────────────────────────────────────
  late final Animation<double> _sq1Fade;
  late final Animation<Offset> _sq1Slide;
  late final Animation<double> _sq2Fade;
  late final Animation<Offset> _sq2Slide;
  late final Animation<double> _sq3Fade;

  // ── Exit ──────────────────────────────────────────────────────────────────
  late final Animation<double> _exitFade;

  static const _totalMs = 3400;

  @override
  void initState() {
    super.initState();

    _mainCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: _totalMs),
    );

    _exitCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );

    _particleCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 8000),
    )..repeat();

    // ── Logo ─────────────────────────────────────────────────────────────
    _logoScale = Tween<double>(begin: 0.5, end: 1.0).animate(
      CurvedAnimation(
        parent: _mainCtrl,
        curve: const Interval(0.0, 0.22, curve: Curves.elasticOut),
      ),
    );
    _logoFade = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _mainCtrl,
        curve: const Interval(0.0, 0.12, curve: Curves.easeIn),
      ),
    );
    _logoBorderExpand = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _mainCtrl,
        curve: const Interval(0.05, 0.25, curve: Curves.easeOut),
      ),
    );

    // ── Accent bar ────────────────────────────────────────────────────────
    _accentBarWidth = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _mainCtrl,
        curve: const Interval(0.20, 0.38, curve: Curves.easeOut),
      ),
    );

    // ── Line 1 ─  "WELCOME TO"  ───────────────────────────────────────────
    _line1Fade = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _mainCtrl,
        curve: const Interval(0.28, 0.42, curve: Curves.easeOut),
      ),
    );
    _line1Slide = Tween<Offset>(
      begin: const Offset(0, 0.4),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _mainCtrl,
        curve: const Interval(0.28, 0.42, curve: Curves.easeOut),
      ),
    );

    // ── Line 2 — "PEC ERP" ────────────────────────────────────────────────
    _line2Fade = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _mainCtrl,
        curve: const Interval(0.34, 0.50, curve: Curves.easeOut),
      ),
    );
    _line2Slide = Tween<Offset>(
      begin: const Offset(0, 0.4),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _mainCtrl,
        curve: const Interval(0.34, 0.50, curve: Curves.easeOut),
      ),
    );

    // ── Line 3 — username ─────────────────────────────────────────────────
    _line3Fade = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _mainCtrl,
        curve: const Interval(0.50, 0.64, curve: Curves.easeOut),
      ),
    );

    // ── Progress bar ──────────────────────────────────────────────────────
    _progressFade = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _mainCtrl,
        curve: const Interval(0.55, 0.65, curve: Curves.easeIn),
      ),
    );
    _progress = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _mainCtrl,
        curve: const Interval(0.60, 0.95, curve: Curves.easeInOut),
      ),
    );

    // ── Floating squares ─────────────────────────────────────────────────
    _sq1Fade = Tween<double>(begin: 0.0, end: 0.35).animate(
      CurvedAnimation(
        parent: _mainCtrl,
        curve: const Interval(0.06, 0.20, curve: Curves.easeIn),
      ),
    );
    _sq1Slide = Tween<Offset>(
      begin: const Offset(0.3, 0.3),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _mainCtrl,
        curve: const Interval(0.06, 0.20, curve: Curves.easeOut),
      ),
    );

    _sq2Fade = Tween<double>(begin: 0.0, end: 0.25).animate(
      CurvedAnimation(
        parent: _mainCtrl,
        curve: const Interval(0.10, 0.24, curve: Curves.easeIn),
      ),
    );
    _sq2Slide = Tween<Offset>(
      begin: const Offset(-0.3, -0.3),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _mainCtrl,
        curve: const Interval(0.10, 0.24, curve: Curves.easeOut),
      ),
    );

    _sq3Fade = Tween<double>(begin: 0.0, end: 0.18).animate(
      CurvedAnimation(
        parent: _mainCtrl,
        curve: const Interval(0.14, 0.30, curve: Curves.easeIn),
      ),
    );

    // ── Exit ──────────────────────────────────────────────────────────────
    _exitFade = Tween<double>(begin: 1.0, end: 0.0).animate(
      CurvedAnimation(parent: _exitCtrl, curve: Curves.easeIn),
    );

    // Start the animation immediately. Navigation happens once BOTH the
    // animation is done AND auth state has resolved (handles app-open case
    // where Hive/token loading may take a moment).
    _mainCtrl.forward().then((_) async {
      if (!mounted) return;
      // Wait until auth is no longer unknown (Hive restore finished)
      while (mounted &&
          ref.read(authNotifierProvider).status == AuthStatus.unknown) {
        await Future.delayed(const Duration(milliseconds: 50));
      }
      if (!mounted) return;
      final status = ref.read(authNotifierProvider).status;
      await Future.delayed(const Duration(milliseconds: 300));
      if (!mounted) return;
      await _exitCtrl.forward();
      if (!mounted) return;
      if (status == AuthStatus.authenticated) {
        context.go('/dashboard');
      } else {
        context.go('/login');
      }
    });
  }

  @override
  void dispose() {
    _mainCtrl.dispose();
    _exitCtrl.dispose();
    _particleCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authNotifierProvider).user;
    final firstName = (user?.name.trim().isEmpty ?? true)
        ? 'Student'
        : user!.name.trim().split(' ').first.toUpperCase();
    final role = user?.primaryRole.displayName.toUpperCase() ?? 'STUDENT';

    return FadeTransition(
      opacity: _exitFade,
      child: Scaffold(
        backgroundColor: AppColors.black,
        body: Stack(
          children: [
            // ── Background grid ────────────────────────────────────────
            Positioned.fill(child: _GridBackground()),

            // ── Floating decorative squares ────────────────────────────
            Positioned(
              top: 80,
              right: 32,
              child: SlideTransition(
                position: _sq1Slide,
                child: FadeTransition(
                  opacity: _sq1Fade,
                  child: _FloatingSquare(size: 120, color: AppColors.yellow),
                ),
              ),
            ),
            Positioned(
              top: 160,
              right: 100,
              child: SlideTransition(
                position: _sq2Slide,
                child: FadeTransition(
                  opacity: _sq2Fade,
                  child: _FloatingSquare(size: 56, color: AppColors.white),
                ),
              ),
            ),
            Positioned(
              bottom: 120,
              left: 24,
              child: FadeTransition(
                opacity: _sq3Fade,
                child: _FloatingSquare(size: 80, color: AppColors.yellow),
              ),
            ),
            Positioned(
              bottom: 220,
              left: 90,
              child: FadeTransition(
                opacity: _sq3Fade,
                child: _FloatingSquare(size: 32, color: AppColors.white),
              ),
            ),

            // ── Rotating corner marks ───────────────────────────────────
            Positioned(
              top: 48,
              left: 24,
              child: FadeTransition(
                opacity: _logoFade,
                child: AnimatedBuilder(
                  animation: _particleCtrl,
                  builder: (_, __) => Transform.rotate(
                    angle: _particleCtrl.value * 2 * math.pi,
                    child: const _CornerMark(),
                  ),
                ),
              ),
            ),
            Positioned(
              bottom: 80,
              right: 24,
              child: FadeTransition(
                opacity: _logoFade,
                child: AnimatedBuilder(
                  animation: _particleCtrl,
                  builder: (_, __) => Transform.rotate(
                    angle: -_particleCtrl.value * 2 * math.pi,
                    child: const _CornerMark(),
                  ),
                ),
              ),
            ),

            // ── Main content ───────────────────────────────────────────
            SafeArea(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 32),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Spacer(flex: 2),

                    // ── Logo box ─────────────────────────────────────
                    AnimatedBuilder(
                      animation: Listenable.merge([_logoScale, _logoFade, _logoBorderExpand]),
                      builder: (_, __) {
                        return FadeTransition(
                          opacity: _logoFade,
                          child: Transform.scale(
                            scale: _logoScale.value,
                            alignment: Alignment.centerLeft,
                            child: _LogoBox(borderProgress: _logoBorderExpand.value),
                          ),
                        );
                      },
                    ),

                    const SizedBox(height: 36),

                    // ── Accent bar sweep ─────────────────────────────
                    AnimatedBuilder(
                      animation: _accentBarWidth,
                      builder: (_, __) => FractionallySizedBox(
                        widthFactor: _accentBarWidth.value,
                        alignment: Alignment.centerLeft,
                        child: Container(
                          height: 4,
                          color: AppColors.yellow,
                        ),
                      ),
                    ),

                    const SizedBox(height: 28),

                    // ── Line 1 ───────────────────────────────────────
                    ClipRect(
                      child: SlideTransition(
                        position: _line1Slide,
                        child: FadeTransition(
                          opacity: _line1Fade,
                          child: Text(
                            'WELCOME TO',
                            style: AppTextStyles.heading3.copyWith(
                              color: AppColors.white.withValues(alpha: 0.55),
                              fontSize: 16,
                              letterSpacing: 6,
                            ),
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 6),

                    // ── Line 2 ───────────────────────────────────────
                    ClipRect(
                      child: SlideTransition(
                        position: _line2Slide,
                        child: FadeTransition(
                          opacity: _line2Fade,
                          child: Text(
                            'PEC ERP',
                            style: AppTextStyles.display.copyWith(
                              color: AppColors.yellow,
                              fontSize: 52,
                              letterSpacing: -1,
                            ),
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 20),

                    // ── Line 3 — name + role ─────────────────────────
                    FadeTransition(
                      opacity: _line3Fade,
                      child: Row(
                        children: [
                          Container(
                            width: 3,
                            height: 40,
                            color: AppColors.yellow,
                          ),
                          const SizedBox(width: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                firstName,
                                style: AppTextStyles.heading2.copyWith(
                                  color: AppColors.white,
                                  fontSize: 20,
                                ),
                              ),
                              Text(
                                role,
                                style: AppTextStyles.labelSmall.copyWith(
                                  color: AppColors.yellow,
                                  fontSize: 10,
                                  letterSpacing: 3,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    const Spacer(flex: 3),

                    // ── Progress bar ──────────────────────────────────
                    FadeTransition(
                      opacity: _progressFade,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          AnimatedBuilder(
                            animation: _progress,
                            builder: (_, __) => Text(
                              'LOADING DASHBOARD — ${(_progress.value * 100).toInt()}%',
                              style: AppTextStyles.labelSmall.copyWith(
                                color: AppColors.white.withValues(alpha: 0.35),
                                fontSize: 9,
                                letterSpacing: 2,
                              ),
                            ),
                          ),
                          const SizedBox(height: 8),
                          Container(
                            height: 3,
                            width: double.infinity,
                            color: AppColors.white.withValues(alpha: 0.08),
                            child: AnimatedBuilder(
                              animation: _progress,
                              builder: (_, __) => FractionallySizedBox(
                                widthFactor: _progress.value,
                                alignment: Alignment.centerLeft,
                                child: Container(color: AppColors.yellow),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 40),

                    // ── Footer ────────────────────────────────────────
                    FadeTransition(
                      opacity: _line3Fade,
                      child: Text(
                        'PUNJAB ENGINEERING COLLEGE (DEEMED TO BE UNIVERSITY)',
                        style: AppTextStyles.labelSmall.copyWith(
                          color: AppColors.white.withValues(alpha: 0.20),
                          fontSize: 8,
                          letterSpacing: 1.5,
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Logo box with animated border ────────────────────────────────────────────

class _LogoBox extends StatelessWidget {
  final double borderProgress;
  const _LogoBox({required this.borderProgress});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Shadow block
        Positioned(
          left: 6 * borderProgress,
          top: 6 * borderProgress,
          child: Container(
            width: 96,
            height: 96,
            color: AppColors.yellow.withValues(alpha: 0.4 * borderProgress),
          ),
        ),
        // Main box
        Container(
          width: 96,
          height: 96,
          decoration: BoxDecoration(
            color: AppColors.white,
            border: Border.all(
              color: AppColors.yellow,
              width: 3 * borderProgress,
            ),
          ),
          child: Padding(
            padding: const EdgeInsets.all(8),
            child: Image.asset(
              'assets/images/PECLogo.png',
              fit: BoxFit.contain,
            ),
          ),
        ),
      ],
    );
  }
}

// ─── Subtle background grid ────────────────────────────────────────────────────

class _GridBackground extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return CustomPaint(painter: _GridPainter());
  }
}

class _GridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFFFFFFFF).withValues(alpha: 0.025)
      ..strokeWidth = 1;
    const step = 40.0;
    for (double x = 0; x < size.width; x += step) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }
    for (double y = 0; y < size.height; y += step) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(_GridPainter old) => false;
}

// ─── Floating decorative square ────────────────────────────────────────────────

class _FloatingSquare extends StatelessWidget {
  final double size;
  final Color color;
  const _FloatingSquare({required this.size, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        border: Border.all(color: color, width: 2),
      ),
    );
  }
}

// ─── Rotating corner mark ─────────────────────────────────────────────────────

class _CornerMark extends StatelessWidget {
  const _CornerMark();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 20,
      height: 20,
      child: CustomPaint(painter: _CrossPainter()),
    );
  }
}

class _CrossPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppColors.yellow.withValues(alpha: 0.6)
      ..strokeWidth = 1.5
      ..strokeCap = StrokeCap.square;
    canvas.drawLine(
        Offset(size.width / 2, 0), Offset(size.width / 2, size.height), paint);
    canvas.drawLine(
        Offset(0, size.height / 2), Offset(size.width, size.height / 2), paint);
  }

  @override
  bool shouldRepaint(_CrossPainter old) => false;
}
