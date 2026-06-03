import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../providers/auth_provider.dart';

class SigningInSplashScreen extends ConsumerStatefulWidget {
  final String email;
  final String password;

  const SigningInSplashScreen({
    super.key,
    required this.email,
    required this.password,
  });

  @override
  ConsumerState<SigningInSplashScreen> createState() =>
      _SigningInSplashScreenState();
}

class _SigningInSplashScreenState extends ConsumerState<SigningInSplashScreen>
    with TickerProviderStateMixin {
  // ── Animation controllers ──────────────────────────────────────────────────
  late final AnimationController _ringCtrl;   // rotating outer ring
  late final AnimationController _pulseCtrl;  // logo pulse
  late final AnimationController _scanCtrl;   // vertical scan line
  late final AnimationController _progressCtrl; // bottom bar
  late final AnimationController _fadeCtrl;   // initial fade-in
  late final AnimationController _exitCtrl;   // exit fade-out

  // ── Animations ─────────────────────────────────────────────────────────────
  late final Animation<double> _ring1Rotate;
  late final Animation<double> _ring2Rotate;
  late final Animation<double> _pulse;
  late final Animation<double> _scanY;
  late final Animation<double> _progressWidth;
  late final Animation<double> _fadeIn;
  late final Animation<double> _exitFade;

  // ── State ──────────────────────────────────────────────────────────────────
  int _statusIndex = 0;
  bool _authDone = false;
  bool _authError = false;
  String _errorMsg = '';

  static const _statusMessages = [
    'Authenticating...',
    'Verifying credentials...',
    'Establishing secure link...',
    'Loading your profile...',
  ];

  @override
  void initState() {
    super.initState();
    _setupAnimations();
    _kickOff();
  }

  void _setupAnimations() {
    // Rotating rings
    _ringCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 3000),
    )..repeat();

    _ring1Rotate = Tween<double>(begin: 0, end: 2 * math.pi)
        .animate(_ringCtrl);
    _ring2Rotate = Tween<double>(begin: 2 * math.pi, end: 0)
        .animate(_ringCtrl);

    // Logo pulse
    _pulseCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1600),
    )..repeat(reverse: true);

    _pulse = Tween<double>(begin: 1.0, end: 1.06).animate(
      CurvedAnimation(parent: _pulseCtrl, curve: Curves.easeInOut),
    );

    // Vertical scan
    _scanCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    )..repeat();

    _scanY = Tween<double>(begin: -1.0, end: 1.0).animate(
      CurvedAnimation(parent: _scanCtrl, curve: Curves.easeInOut),
    );

    // Progress bar — fills over 3.5 s then pauses
    _progressCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 3500),
    );
    _progressWidth = CurvedAnimation(
      parent: _progressCtrl,
      curve: Curves.easeInOut,
    );
    _progressCtrl.forward();

    // Entrance fade
    _fadeCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 350),
    );
    _fadeIn = CurvedAnimation(parent: _fadeCtrl, curve: Curves.easeOut);
    _fadeCtrl.forward();

    // Exit fade
    _exitCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );
    _exitFade = Tween<double>(begin: 1.0, end: 0.0).animate(
      CurvedAnimation(parent: _exitCtrl, curve: Curves.easeIn),
    );

    // Cycle status text every 900 ms
    _cycleStatus();
  }

  void _cycleStatus() async {
    while (mounted && !_authDone) {
      await Future.delayed(const Duration(milliseconds: 900));
      if (mounted && !_authDone) {
        setState(() {
          _statusIndex =
              (_statusIndex + 1) % (_statusMessages.length - 1);
        });
      }
    }
  }

  Future<void> _kickOff() async {
    try {
      // Skip remote auth for now and proceed with a local student session.
      await ref
          .read(authNotifierProvider.notifier)
          .continueAsStudentFromSignUp(email: widget.email);

      if (!mounted) return;
      setState(() {
        _authDone = true;
        _statusIndex = _statusMessages.length - 1; // "Loading your profile..."
      });

      // Let the last status show for a beat, fill progress to 100 %
      _progressCtrl.animateTo(1.0,
          duration: const Duration(milliseconds: 400), curve: Curves.easeOut);

      await Future.delayed(const Duration(milliseconds: 700));
      if (!mounted) return;

      await _exitCtrl.forward();
      if (mounted) context.go('/welcome');
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _authError = true;
        _errorMsg = e.toString().replaceFirst('Exception: ', '');
      });
      await Future.delayed(const Duration(milliseconds: 1400));
      if (mounted) Navigator.of(context).pop();
    }
  }

  @override
  void dispose() {
    _ringCtrl.dispose();
    _pulseCtrl.dispose();
    _scanCtrl.dispose();
    _progressCtrl.dispose();
    _fadeCtrl.dispose();
    _exitCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final botPad = MediaQuery.of(context).padding.bottom;

    return FadeTransition(
      opacity: _exitFade,
      child: FadeTransition(
        opacity: _fadeIn,
        child: Scaffold(
          backgroundColor: const Color(0xFF060606),
          body: Stack(
            children: [
              // ── Background grid ──────────────────────────────────────────
              Positioned.fill(child: CustomPaint(painter: _GridPainter())),

              // ── Scan line ────────────────────────────────────────────────
              AnimatedBuilder(
                animation: _scanY,
                builder: (_, __) {
                  return Positioned(
                    left: 0,
                    right: 0,
                    top: size.height / 2 + _scanY.value * size.height * 0.38,
                    child: Container(
                      height: 1.5,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            Colors.transparent,
                            AppColors.yellow.withValues(alpha: 0.0),
                            AppColors.yellow.withValues(alpha: 0.35),
                            AppColors.yellow.withValues(alpha: 0.0),
                            Colors.transparent,
                          ],
                        ),
                      ),
                    ),
                  );
                },
              ),

              // ── Central illustration ─────────────────────────────────────
              Center(
                child: SizedBox(
                  width: size.width * 0.72,
                  height: size.width * 0.72,
                  child: AnimatedBuilder(
                    animation: Listenable.merge(
                        [_ringCtrl, _pulseCtrl, _scanCtrl]),
                    builder: (_, __) {
                      return CustomPaint(
                        painter: _OrbitPainter(
                          ring1Angle: _ring1Rotate.value,
                          ring2Angle: _ring2Rotate.value,
                          scanY: _scanY.value,
                          authDone: _authDone,
                          authError: _authError,
                        ),
                        child: Center(
                          child: ScaleTransition(
                            scale: _pulse,
                            child: _LogoBox(),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ),

              // ── Status text ───────────────────────────────────────────────
              Positioned(
                left: 0,
                right: 0,
                bottom: size.height * 0.22,
                child: Column(
                  children: [
                    // PEC label
                    Text(
                      'PEC',
                      style: AppTextStyles.display.copyWith(
                        color: AppColors.white,
                        fontSize: 36,
                        letterSpacing: 6,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 6),
                    AnimatedSwitcher(
                      duration: const Duration(milliseconds: 380),
                      transitionBuilder: (child, anim) => FadeTransition(
                        opacity: anim,
                        child: SlideTransition(
                          position: Tween<Offset>(
                            begin: const Offset(0, 0.3),
                            end: Offset.zero,
                          ).animate(anim),
                          child: child,
                        ),
                      ),
                      child: Text(
                        _authError
                            ? _errorMsg.isNotEmpty
                                ? _errorMsg
                                : 'Authentication failed'
                            : _statusMessages[_statusIndex],
                        key: ValueKey(_authError
                            ? 'error'
                            : _statusMessages[_statusIndex]),
                        textAlign: TextAlign.center,
                        style: AppTextStyles.bodySmall.copyWith(
                          color: _authError
                              ? AppColors.red.withValues(alpha: 0.85)
                              : AppColors.white.withValues(alpha: 0.45),
                          fontSize: 13,
                          letterSpacing: 0.4,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // ── Progress bar ──────────────────────────────────────────────
              Positioned(
                left: 32,
                right: 32,
                bottom: botPad + 48,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Track
                    Container(
                      height: 2,
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.08),
                        borderRadius: BorderRadius.circular(1),
                      ),
                      child: AnimatedBuilder(
                        animation: _progressWidth,
                        builder: (_, __) {
                          return FractionallySizedBox(
                            alignment: Alignment.centerLeft,
                            widthFactor: _progressWidth.value,
                            child: Container(
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(1),
                                gradient: LinearGradient(
                                  colors: [
                                    AppColors.yellow.withValues(alpha: 0.6),
                                    AppColors.yellow,
                                  ],
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 10),
                    AnimatedBuilder(
                      animation: _progressWidth,
                      builder: (_, __) {
                        return Text(
                          '${(_progressWidth.value * 100).toInt()}%',
                          style: AppTextStyles.labelSmall.copyWith(
                            color: AppColors.white.withValues(alpha: 0.25),
                            fontSize: 10,
                            letterSpacing: 1,
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Logo box ──────────────────────────────────────────────────────────────────

class _LogoBox extends StatelessWidget {
  const _LogoBox();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 90,
      height: 90,
      decoration: BoxDecoration(
        color: const Color(0xFF111111),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: AppColors.yellow.withValues(alpha: 0.50),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.yellow.withValues(alpha: 0.20),
            blurRadius: 36,
            spreadRadius: 4,
          ),
        ],
      ),
      padding: const EdgeInsets.all(14),
      child: Image.asset('assets/images/PECLogo.png', fit: BoxFit.contain),
    );
  }
}

// ── Custom painters ───────────────────────────────────────────────────────────

class _OrbitPainter extends CustomPainter {
  final double ring1Angle;
  final double ring2Angle;
  final double scanY;
  final bool authDone;
  final bool authError;

  const _OrbitPainter({
    required this.ring1Angle,
    required this.ring2Angle,
    required this.scanY,
    required this.authDone,
    required this.authError,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);

    // ── Faint concentric base rings ──────────────────────────────────────
    for (int i = 1; i <= 4; i++) {
      final r = size.width * 0.12 * i;
      final paint = Paint()
        ..color = AppColors.yellow.withValues(alpha: 0.03 + 0.01 * (4 - i))
        ..style = PaintingStyle.stroke
        ..strokeWidth = 0.6;
      canvas.drawCircle(center, r, paint);
    }

    // ── Rotating dashed ring 1 ───────────────────────────────────────────
    _drawDashedArc(
      canvas: canvas,
      center: center,
      radius: size.width * 0.42,
      angle: ring1Angle,
      color: authError
          ? AppColors.red.withValues(alpha: 0.6)
          : authDone
              ? AppColors.green.withValues(alpha: 0.7)
              : AppColors.yellow.withValues(alpha: 0.55),
      strokeWidth: 1.2,
      dashCount: 20,
      gapRatio: 0.45,
    );

    // ── Rotating dashed ring 2 (counter) ─────────────────────────────────
    _drawDashedArc(
      canvas: canvas,
      center: center,
      radius: size.width * 0.33,
      angle: ring2Angle,
      color: authError
          ? AppColors.red.withValues(alpha: 0.35)
          : authDone
              ? AppColors.green.withValues(alpha: 0.40)
              : AppColors.yellow.withValues(alpha: 0.28),
      strokeWidth: 0.8,
      dashCount: 14,
      gapRatio: 0.5,
    );

    // ── Orbit dot on ring 1 ───────────────────────────────────────────────
    final dotX = center.dx + size.width * 0.42 * math.cos(ring1Angle);
    final dotY = center.dy + size.width * 0.42 * math.sin(ring1Angle);
    final dotPaint = Paint()
      ..color = authDone ? AppColors.green : AppColors.yellow
      ..style = PaintingStyle.fill;
    canvas.drawCircle(Offset(dotX, dotY), 4, dotPaint);

    // Glow on dot
    final glowPaint = Paint()
      ..color = (authDone ? AppColors.green : AppColors.yellow)
          .withValues(alpha: 0.25)
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 6);
    canvas.drawCircle(Offset(dotX, dotY), 8, glowPaint);
  }

  void _drawDashedArc({
    required Canvas canvas,
    required Offset center,
    required double radius,
    required double angle,
    required Color color,
    required double strokeWidth,
    required int dashCount,
    required double gapRatio,
  }) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round;

    final dashAngle = (2 * math.pi / dashCount) * (1 - gapRatio);
    final gapAngle = (2 * math.pi / dashCount) * gapRatio;

    for (int i = 0; i < dashCount; i++) {
      final start = angle + i * (dashAngle + gapAngle);
      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius),
        start,
        dashAngle,
        false,
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(_OrbitPainter old) =>
      old.ring1Angle != ring1Angle ||
      old.ring2Angle != ring2Angle ||
      old.authDone != authDone ||
      old.authError != authError;
}

class _GridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withValues(alpha: 0.022)
      ..strokeWidth = 0.5;

    const step = 44.0;
    for (double x = 0; x < size.width; x += step) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }
    for (double y = 0; y < size.height; y += step) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }

    // Corner accent brackets — top-left
    final accent = Paint()
      ..color = AppColors.yellow.withValues(alpha: 0.18)
      ..strokeWidth = 1.5
      ..strokeCap = StrokeCap.round;

    const bl = 22.0; // bracket length
    // Top-left
    canvas.drawLine(const Offset(24, 24), const Offset(24 + bl, 24), accent);
    canvas.drawLine(const Offset(24, 24), const Offset(24, 24 + bl), accent);
    // Top-right
    canvas.drawLine(
        Offset(size.width - 24, 24), Offset(size.width - 24 - bl, 24), accent);
    canvas.drawLine(
        Offset(size.width - 24, 24), Offset(size.width - 24, 24 + bl), accent);
    // Bottom-left
    canvas.drawLine(
        Offset(24, size.height - 24), Offset(24 + bl, size.height - 24), accent);
    canvas.drawLine(
        Offset(24, size.height - 24), Offset(24, size.height - 24 - bl), accent);
    // Bottom-right
    canvas.drawLine(
        Offset(size.width - 24, size.height - 24),
        Offset(size.width - 24 - bl, size.height - 24),
        accent);
    canvas.drawLine(
        Offset(size.width - 24, size.height - 24),
        Offset(size.width - 24, size.height - 24 - bl),
        accent);
  }

  @override
  bool shouldRepaint(_GridPainter old) => false;
}
