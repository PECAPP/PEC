import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../providers/auth_provider.dart';
import '../providers/first_launch_provider.dart';

// ── Entry point ───────────────────────────────────────────────────────────────

class IntroOnboardingScreen extends ConsumerStatefulWidget {
  const IntroOnboardingScreen({super.key});

  @override
  ConsumerState<IntroOnboardingScreen> createState() =>
      _IntroOnboardingScreenState();
}

class _IntroOnboardingScreenState extends ConsumerState<IntroOnboardingScreen>
    with TickerProviderStateMixin {
  final _pageCtrl = PageController();
  int _page = 0;

  // Per-page enter animations
  late final List<AnimationController> _pageAnims;
  late final List<Animation<double>> _pageFades;
  late final List<Animation<Offset>> _pageSlides;

  // Button press scale
  late final AnimationController _btnCtrl;
  late final Animation<double> _btnScale;

  static const _pages = 3;

  @override
  void initState() {
    super.initState();

    _pageAnims = List.generate(
      _pages,
      (_) => AnimationController(
        vsync: this,
        duration: const Duration(milliseconds: 520),
      ),
    );

    _pageFades = _pageAnims
        .map((c) => CurvedAnimation(parent: c, curve: Curves.easeOut))
        .toList();

    _pageSlides = _pageAnims.map((c) {
      return Tween<Offset>(
        begin: const Offset(0, 0.06),
        end: Offset.zero,
      ).animate(CurvedAnimation(parent: c, curve: Curves.easeOutCubic));
    }).toList();

    _btnCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 100),
      lowerBound: 0.95,
      upperBound: 1.0,
      value: 1.0,
    );
    _btnScale = _btnCtrl;

    // Animate first page in
    _pageAnims[0].forward();
  }

  @override
  void dispose() {
    _pageCtrl.dispose();
    for (final c in _pageAnims) {
      c.dispose();
    }
    _btnCtrl.dispose();
    super.dispose();
  }

  void _goToPage(int next) {
    if (next >= _pages) {
      _finish();
      return;
    }
    _pageCtrl.animateToPage(
      next,
      duration: const Duration(milliseconds: 480),
      curve: Curves.easeInOutCubic,
    );
  }

  void _onPageChanged(int p) {
    setState(() => _page = p);
    _pageAnims[p].forward(from: 0);
  }

  Future<void> _finish() async {
    await markIntroSeen();
    if (!mounted) return;
    final status = ref.read(authNotifierProvider).status;
    if (status == AuthStatus.authenticated) {
      context.go('/dashboard');
    } else {
      context.go('/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final topPad = MediaQuery.of(context).padding.top;
    final bottomPad = MediaQuery.of(context).padding.bottom;
    final isLast = _page == _pages - 1;

    return Scaffold(
      backgroundColor: const Color(0xFF080808),
      body: Stack(
        children: [
          // ── Background grid lines ────────────────────────────────────────
          Positioned.fill(
            child: CustomPaint(painter: _GridPainter()),
          ),

          // ── Pages ────────────────────────────────────────────────────────
          PageView.builder(
            controller: _pageCtrl,
            onPageChanged: _onPageChanged,
            itemCount: _pages,
            itemBuilder: (_, i) => _IntroPage(
              page: i,
              fadeAnim: _pageFades[i],
              slideAnim: _pageSlides[i],
              size: size,
            ),
          ),

          // ── Skip button ──────────────────────────────────────────────────
          if (!isLast)
            Positioned(
              top: topPad + 16,
              right: 20,
              child: GestureDetector(
                onTap: _finish,
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.06),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                        color: Colors.white.withValues(alpha: 0.12),
                        width: 0.8),
                  ),
                  child: Text(
                    'SKIP',
                    style: AppTextStyles.labelSmall.copyWith(
                      color: Colors.white.withValues(alpha: 0.5),
                      fontSize: 11,
                      letterSpacing: 1.4,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
            ),

          // ── Bottom controls ───────────────────────────────────────────────
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: Container(
              padding: EdgeInsets.fromLTRB(28, 24, 28, bottomPad + 28),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    const Color(0xFF080808).withValues(alpha: 0.0),
                    const Color(0xFF080808).withValues(alpha: 0.92),
                    const Color(0xFF080808),
                  ],
                  stops: const [0.0, 0.3, 1.0],
                ),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Dots
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(_pages, (i) {
                      final active = i == _page;
                      return AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        curve: Curves.easeInOut,
                        margin: const EdgeInsets.symmetric(horizontal: 4),
                        width: active ? 28.0 : 7.0,
                        height: 7,
                        decoration: BoxDecoration(
                          color: active
                              ? AppColors.yellow
                              : Colors.white.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(4),
                        ),
                      );
                    }),
                  ),

                  const SizedBox(height: 28),

                  // CTA button
                  ScaleTransition(
                    scale: _btnScale,
                    child: GestureDetector(
                      onTapDown: (_) => _btnCtrl.reverse(),
                      onTapUp: (_) {
                        _btnCtrl.forward();
                        _goToPage(_page + 1);
                      },
                      onTapCancel: () => _btnCtrl.forward(),
                      child: Container(
                        width: double.infinity,
                        height: 56,
                        decoration: BoxDecoration(
                          color: AppColors.yellow,
                          borderRadius: BorderRadius.circular(6),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.yellow.withValues(alpha: 0.30),
                              blurRadius: 24,
                              offset: const Offset(0, 8),
                            ),
                          ],
                        ),
                        alignment: Alignment.center,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              isLast ? 'GET STARTED' : 'CONTINUE',
                              style: AppTextStyles.labelLarge.copyWith(
                                color: AppColors.black,
                                fontSize: 14,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 1.5,
                              ),
                            ),
                            const SizedBox(width: 10),
                            const Icon(Icons.arrow_forward_rounded,
                                size: 18, color: AppColors.black),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Individual page ───────────────────────────────────────────────────────────

class _IntroPage extends StatelessWidget {
  final int page;
  final Animation<double> fadeAnim;
  final Animation<Offset> slideAnim;
  final Size size;

  const _IntroPage({
    required this.page,
    required this.fadeAnim,
    required this.slideAnim,
    required this.size,
  });

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: fadeAnim,
      child: SlideTransition(
        position: slideAnim,
        child: Column(
          children: [
            // Illustration takes upper 55%
            SizedBox(
              height: size.height * 0.55,
              child: _Illustration(page: page, size: size),
            ),

            // Text content
            Expanded(
              child: Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 28.0),
                child: _PageText(page: page),
              ),
            ),

            // Space for bottom controls
            SizedBox(height: size.height * 0.22),
          ],
        ),
      ),
    );
  }
}

// ── Illustrations ─────────────────────────────────────────────────────────────

class _Illustration extends StatelessWidget {
  final int page;
  final Size size;
  const _Illustration({required this.page, required this.size});

  @override
  Widget build(BuildContext context) {
    return switch (page) {
      0 => _Page0Illustration(size: size),
      1 => _Page1Illustration(size: size),
      _ => _Page2Illustration(size: size),
    };
  }
}

// Page 0 — PEC crest + glowing ring
class _Page0Illustration extends StatelessWidget {
  final Size size;
  const _Page0Illustration({required this.size});

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.center,
      children: [
        // Outer glow ring
        CustomPaint(
          size: Size(size.width * 0.75, size.width * 0.75),
          painter: _RingPainter(rings: 3),
        ),
        // Logo box
        Container(
          width: 110,
          height: 110,
          decoration: BoxDecoration(
            color: const Color(0xFF111111),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
                color: AppColors.yellow.withValues(alpha: 0.55), width: 1.5),
            boxShadow: [
              BoxShadow(
                color: AppColors.yellow.withValues(alpha: 0.18),
                blurRadius: 40,
                spreadRadius: 4,
              ),
            ],
          ),
          padding: const EdgeInsets.all(16),
          child: Image.asset(
            'assets/images/PECLogo.png',
            fit: BoxFit.contain,
          ),
        ),
        // Corner accent squares
        Positioned(
          top: size.height * 0.08,
          left: size.width * 0.08,
          child: _AccentSquare(size: 18, opacity: 0.35),
        ),
        Positioned(
          top: size.height * 0.12,
          right: size.width * 0.12,
          child: _AccentSquare(size: 12, opacity: 0.25),
        ),
        Positioned(
          bottom: size.height * 0.06,
          left: size.width * 0.14,
          child: _AccentSquare(size: 10, opacity: 0.20),
        ),
        Positioned(
          bottom: size.height * 0.10,
          right: size.width * 0.09,
          child: _AccentSquare(size: 16, opacity: 0.30),
        ),
      ],
    );
  }
}

// Page 1 — Academic feature icon grid
class _Page1Illustration extends StatelessWidget {
  final Size size;
  const _Page1Illustration({required this.size});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(32, 32, 32, 0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            children: [
              _AcademicIcon(icon: Icons.book_outlined, label: 'Courses'),
              const SizedBox(width: 12),
              _AcademicIcon(icon: Icons.schedule_outlined, label: 'Timetable', highlight: true),
              const SizedBox(width: 12),
              _AcademicIcon(icon: Icons.fact_check_outlined, label: 'Attendance'),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _AcademicIcon(icon: Icons.assignment_outlined, label: 'Exams'),
              const SizedBox(width: 12),
              _AcademicIcon(icon: Icons.bar_chart_rounded, label: 'Score Sheet'),
              const SizedBox(width: 12),
              _AcademicIcon(icon: Icons.folder_open_outlined, label: 'Materials', highlight: true),
            ],
          ),
        ],
      ),
    );
  }
}

// Page 2 — Campus life icon grid
class _Page2Illustration extends StatelessWidget {
  final Size size;
  const _Page2Illustration({required this.size});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(32, 32, 32, 0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            children: [
              _AcademicIcon(icon: Icons.groups_outlined, label: 'Clubs', highlight: true),
              const SizedBox(width: 12),
              _AcademicIcon(icon: Icons.restaurant_menu_outlined, label: 'Canteen'),
              const SizedBox(width: 12),
              _AcademicIcon(icon: Icons.storefront_outlined, label: 'Buy & Sell'),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _AcademicIcon(icon: Icons.apartment_outlined, label: 'Hostel'),
              const SizedBox(width: 12),
              _AcademicIcon(icon: Icons.map_outlined, label: 'Campus Map', highlight: true),
              const SizedBox(width: 12),
              _AcademicIcon(icon: Icons.notifications_outlined, label: 'Notices'),
            ],
          ),
        ],
      ),
    );
  }
}

// ── Page text ─────────────────────────────────────────────────────────────────

class _PageText extends StatelessWidget {
  final int page;
  const _PageText({required this.page});

  static const _data = [
    (
      'CENTURY EXPERIENCE\nIN YOUR HAND',
      'Punjab Engineering College brings over a century of excellence into your hand with one unified campus app.',
    ),
    (
      'ACADEMICS\nSIMPLIFIED',
      'Courses, timetables, attendance, exams, score sheets and study materials — all in one place.',
    ),
    (
      'YOUR CAMPUS,\nANYTIME',
      'Clubs, canteen, buy & sell marketplace, hostel issues, campus map and real-time notices.',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final (heading, body) = _data[page];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Yellow accent line
        Container(
          width: 36,
          height: 3,
          decoration: BoxDecoration(
            color: AppColors.yellow,
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        const SizedBox(height: 16),

        Text(
          heading,
          style: AppTextStyles.heading1.copyWith(
            color: AppColors.white,
            fontSize: 32,
            height: 1.05,
            fontWeight: FontWeight.w800,
          ),
        ),

        const SizedBox(height: 14),

        Text(
          body,
          style: AppTextStyles.bodyMedium.copyWith(
            color: Colors.white.withValues(alpha: 0.52),
            fontSize: 15,
            height: 1.6,
          ),
        ),
      ],
    );
  }
}

// ── Shared sub-widgets ────────────────────────────────────────────────────────

class _AcademicIcon extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool highlight;

  const _AcademicIcon({
    required this.icon,
    required this.label,
    this.highlight = false,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
        decoration: BoxDecoration(
          color: highlight
              ? AppColors.yellow.withValues(alpha: 0.10)
              : const Color(0xFF111111),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: highlight
                ? AppColors.yellow.withValues(alpha: 0.35)
                : Colors.white.withValues(alpha: 0.07),
            width: 0.8,
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 26,
              color: highlight
                  ? AppColors.yellow
                  : Colors.white.withValues(alpha: 0.65),
            ),
            const SizedBox(height: 8),
            Text(
              label,
              textAlign: TextAlign.center,
              style: AppTextStyles.labelSmall.copyWith(
                color: highlight
                    ? AppColors.yellow.withValues(alpha: 0.9)
                    : Colors.white.withValues(alpha: 0.55),
                fontSize: 10,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.4,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AccentSquare extends StatelessWidget {
  final double size;
  final double opacity;
  const _AccentSquare({required this.size, required this.opacity});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        border: Border.all(
            color: AppColors.yellow.withValues(alpha: opacity), width: 1.2),
        borderRadius: BorderRadius.circular(3),
      ),
    );
  }
}

// ── Custom painters ───────────────────────────────────────────────────────────

class _RingPainter extends CustomPainter {
  final int rings;
  const _RingPainter({required this.rings});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final maxR = size.width / 2;

    for (int i = 0; i < rings; i++) {
      final t = (i + 1) / rings;
      final paint = Paint()
        ..color =
            AppColors.yellow.withValues(alpha: 0.06 + 0.04 * (rings - i))
        ..style = PaintingStyle.stroke
        ..strokeWidth = 0.8;
      canvas.drawCircle(center, maxR * t, paint);
    }
  }

  @override
  bool shouldRepaint(_RingPainter old) => false;
}

class _GridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withValues(alpha: 0.025)
      ..strokeWidth = 0.5;

    const step = 40.0;
    for (double x = 0; x < size.width; x += step) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }
    for (double y = 0; y < size.height; y += step) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }

    // Diagonal accent lines top-left
    final accentPaint = Paint()
      ..color = AppColors.yellow.withValues(alpha: 0.04)
      ..strokeWidth = 0.8;

    for (int i = 0; i < 6; i++) {
      final offset = i * 60.0;
      canvas.drawLine(
        Offset(0, offset),
        Offset(offset, 0),
        accentPaint,
      );
    }

    // Bottom-right diagonals
    for (int i = 0; i < 6; i++) {
      final offset = i * 60.0;
      canvas.drawLine(
        Offset(size.width, size.height - offset),
        Offset(size.width - offset, size.height),
        accentPaint,
      );
    }
  }

  @override
  bool shouldRepaint(_GridPainter old) => false;
}
