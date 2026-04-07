import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/pec_card.dart';

class CampusMapScreen extends ConsumerStatefulWidget {
  const CampusMapScreen({super.key});

  @override
  ConsumerState<CampusMapScreen> createState() => _CampusMapScreenState();
}

class _CampusMapScreenState extends ConsumerState<CampusMapScreen> {
  static const Size _canvasSize = Size(1280, 720);

  final TransformationController _controller = TransformationController();
  CampusBlock? _selectedBlock;
  bool _is3D = false;
  double _lastFitScale = -1;

  final List<CampusBlock> _blocks = const [
    CampusBlock(
      label: 'Director\'s Residence',
      x: 335,
      y: 28,
      width: 138,
      height: 55,
      category: CampusCategory.admin,
    ),
    CampusBlock(
      label: 'Community Centre',
      x: 925,
      y: 28,
      width: 150,
      height: 58,
      category: CampusCategory.admin,
    ),
    CampusBlock(
      label: 'Forbidden Forest',
      x: 1104,
      y: 28,
      width: 92,
      height: 60,
      category: CampusCategory.sports,
    ),
    CampusBlock(
      label: 'Vindhya Hostel',
      x: 36,
      y: 136,
      width: 100,
      height: 92,
      category: CampusCategory.hostel,
    ),
    CampusBlock(
      label: 'Aravali Hostel',
      x: 142,
      y: 136,
      width: 100,
      height: 92,
      category: CampusCategory.hostel,
    ),
    CampusBlock(
      label: 'Guest House',
      x: 335,
      y: 136,
      width: 138,
      height: 42,
      category: CampusCategory.admin,
    ),
    CampusBlock(
      label: 'ECE & CSE Dept',
      x: 335,
      y: 186,
      width: 138,
      height: 40,
      category: CampusCategory.academic,
    ),
    CampusBlock(
      label: 'New Academic Block',
      x: 505,
      y: 136,
      width: 255,
      height: 94,
      category: CampusCategory.academic,
    ),
    CampusBlock(
      label: 'K.C. Hostel',
      x: 906,
      y: 136,
      width: 172,
      height: 92,
      category: CampusCategory.hostel,
    ),
    CampusBlock(
      label: 'Aero Workshops',
      x: 1104,
      y: 136,
      width: 92,
      height: 92,
      category: CampusCategory.academic,
    ),
    CampusBlock(
      label: 'PEC Market',
      x: 36,
      y: 264,
      width: 100,
      height: 56,
      category: CampusCategory.food,
    ),
    CampusBlock(
      label: 'Bamboo Garden',
      x: 142,
      y: 264,
      width: 100,
      height: 56,
      category: CampusCategory.sports,
    ),
    CampusBlock(
      label: 'Himalaya Hostel',
      x: 36,
      y: 326,
      width: 100,
      height: 84,
      category: CampusCategory.hostel,
    ),
    CampusBlock(
      label: 'CCA',
      x: 142,
      y: 326,
      width: 100,
      height: 52,
      category: CampusCategory.admin,
    ),
    CampusBlock(
      label: 'L-20',
      x: 336,
      y: 264,
      width: 58,
      height: 28,
      category: CampusCategory.academic,
    ),
    CampusBlock(
      label: 'L-21',
      x: 402,
      y: 264,
      width: 58,
      height: 28,
      category: CampusCategory.academic,
    ),
    CampusBlock(
      label: 'L-22',
      x: 336,
      y: 300,
      width: 58,
      height: 28,
      category: CampusCategory.academic,
    ),
    CampusBlock(
      label: 'L-23',
      x: 402,
      y: 300,
      width: 58,
      height: 28,
      category: CampusCategory.academic,
    ),
    CampusBlock(
      label: 'C.C.',
      x: 336,
      y: 336,
      width: 124,
      height: 44,
      category: CampusCategory.academic,
    ),
    CampusBlock(
      label: 'Aero Dept',
      x: 508,
      y: 284,
      width: 122,
      height: 58,
      category: CampusCategory.academic,
    ),
    CampusBlock(
      label: 'C.C.D.',
      x: 484,
      y: 358,
      width: 72,
      height: 34,
      category: CampusCategory.food,
    ),
    CampusBlock(
      label: 'L-26',
      x: 645,
      y: 274,
      width: 72,
      height: 36,
      category: CampusCategory.academic,
    ),
    CampusBlock(
      label: 'L-27',
      x: 645,
      y: 320,
      width: 72,
      height: 36,
      category: CampusCategory.academic,
    ),
    CampusBlock(
      label: 'IT 201',
      x: 748,
      y: 274,
      width: 104,
      height: 36,
      category: CampusCategory.academic,
    ),
    CampusBlock(
      label: 'Civil Dept',
      x: 578,
      y: 360,
      width: 110,
      height: 48,
      category: CampusCategory.academic,
    ),
    CampusBlock(
      label: 'Mech Dept',
      x: 736,
      y: 360,
      width: 114,
      height: 48,
      category: CampusCategory.academic,
    ),
    CampusBlock(
      label: 'Chemistry Lab',
      x: 510,
      y: 446,
      width: 228,
      height: 42,
      category: CampusCategory.academic,
    ),
    CampusBlock(
      label: 'Auto Lab',
      x: 766,
      y: 446,
      width: 100,
      height: 42,
      category: CampusCategory.academic,
    ),
    CampusBlock(
      label: 'W.S.',
      x: 766,
      y: 494,
      width: 100,
      height: 36,
      category: CampusCategory.academic,
    ),
    CampusBlock(
      label: 'T-1',
      x: 510,
      y: 512,
      width: 46,
      height: 28,
      category: CampusCategory.academic,
    ),
    CampusBlock(
      label: 'T-2',
      x: 564,
      y: 512,
      width: 46,
      height: 28,
      category: CampusCategory.academic,
    ),
    CampusBlock(
      label: 'T-3',
      x: 618,
      y: 512,
      width: 46,
      height: 28,
      category: CampusCategory.academic,
    ),
    CampusBlock(
      label: 'T-4',
      x: 510,
      y: 546,
      width: 46,
      height: 28,
      category: CampusCategory.academic,
    ),
    CampusBlock(
      label: 'T-5',
      x: 564,
      y: 546,
      width: 46,
      height: 28,
      category: CampusCategory.academic,
    ),
    CampusBlock(
      label: 'T-6',
      x: 618,
      y: 546,
      width: 46,
      height: 28,
      category: CampusCategory.academic,
    ),
    CampusBlock(
      label: 'DH-1',
      x: 504,
      y: 604,
      width: 82,
      height: 42,
      category: CampusCategory.food,
    ),
    CampusBlock(
      label: 'DH-2',
      x: 600,
      y: 604,
      width: 82,
      height: 42,
      category: CampusCategory.food,
    ),
    CampusBlock(
      label: 'DH-3',
      x: 694,
      y: 604,
      width: 82,
      height: 42,
      category: CampusCategory.food,
    ),
    CampusBlock(
      label: 'DH-4',
      x: 790,
      y: 604,
      width: 82,
      height: 42,
      category: CampusCategory.food,
    ),
    CampusBlock(
      label: 'Athletic Ground',
      x: 906,
      y: 264,
      width: 174,
      height: 254,
      category: CampusCategory.sports,
      denseLabel: true,
    ),
    CampusBlock(
      label: 'PECOSA',
      x: 906,
      y: 544,
      width: 174,
      height: 36,
      category: CampusCategory.admin,
    ),
    CampusBlock(
      label: 'Parking',
      x: 906,
      y: 590,
      width: 174,
      height: 36,
      category: CampusCategory.admin,
    ),
    CampusBlock(
      label: 'Gym',
      x: 1110,
      y: 544,
      width: 82,
      height: 72,
      category: CampusCategory.sports,
    ),
    CampusBlock(
      label: 'Common Wealth Block',
      x: 36,
      y: 644,
      width: 128,
      height: 68,
      category: CampusCategory.admin,
    ),
    CampusBlock(
      label: 'Football Ground',
      x: 170,
      y: 644,
      width: 82,
      height: 68,
      category: CampusCategory.sports,
    ),
    CampusBlock(
      label: 'Admin Block',
      x: 330,
      y: 644,
      width: 128,
      height: 68,
      category: CampusCategory.admin,
    ),
    CampusBlock(
      label: 'Cricket Ground',
      x: 516,
      y: 644,
      width: 272,
      height: 68,
      category: CampusCategory.sports,
    ),
    CampusBlock(
      label: 'Centre of Excellence',
      x: 820,
      y: 648,
      width: 180,
      height: 52,
      category: CampusCategory.academic,
    ),
    CampusBlock(
      label: 'Shiwalik Hostel',
      x: 1110,
      y: 644,
      width: 136,
      height: 68,
      category: CampusCategory.hostel,
    ),
    CampusBlock(
      label: 'Rotodynamics',
      x: 1104,
      y: 336,
      width: 92,
      height: 58,
      category: CampusCategory.academic,
    ),
    CampusBlock(
      label: 'Meta Dept',
      x: 152,
      y: 456,
      width: 86,
      height: 48,
      category: CampusCategory.academic,
    ),
    CampusBlock(
      label: 'SPIC Building',
      x: 152,
      y: 514,
      width: 86,
      height: 40,
      category: CampusCategory.academic,
    ),
    CampusBlock(
      label: 'Library',
      x: 335,
      y: 436,
      width: 130,
      height: 92,
      category: CampusCategory.academic,
    ),
    CampusBlock(
      label: 'Auditorium',
      x: 335,
      y: 560,
      width: 130,
      height: 54,
      category: CampusCategory.admin,
    ),
  ];

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF18120B),
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            final isWide = constraints.maxWidth >= 900;
            final mapHeight = math.max(520.0, constraints.maxHeight - 160);
            final panelWidth = math.min(constraints.maxWidth, 1280.0);
            final fitScale = math.min(
              panelWidth / _canvasSize.width,
              mapHeight / _canvasSize.height,
            );

            _syncFitScale(fitScale);

            return Padding(
              padding: EdgeInsets.fromLTRB(
                isWide ? 28 : 16,
                16,
                isWide ? 28 : 16,
                16,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _HeaderRow(
                    isWide: isWide,
                    is3D: _is3D,
                    onToggle3D: () => setState(() => _is3D = !_is3D),
                    onZoomOut: _zoomOut,
                    onZoomIn: _zoomIn,
                    zoomLabel: '${(_currentScale * 100).round()}%',
                  ),
                  const SizedBox(height: 10),
                  _LegendRow(isWide: isWide),
                  const SizedBox(height: 14),
                  Expanded(
                    child: Stack(
                      children: [
                        Center(
                          child: Container(
                            constraints: BoxConstraints(
                              maxWidth: math.min(constraints.maxWidth, 1280),
                              maxHeight: mapHeight,
                            ),
                            decoration: BoxDecoration(
                              color: const Color(0xFF1B1711),
                              border: Border.all(
                                color: const Color(0xFF352A1E),
                                width: 1.2,
                              ),
                              boxShadow: const [
                                BoxShadow(
                                  offset: Offset(0, 8),
                                  blurRadius: 20,
                                  color: Colors.black54,
                                ),
                              ],
                            ),
                            child: ClipRect(
                              child: InteractiveViewer(
                                transformationController: _controller,
                                minScale: math.max(_lastFitScale, 0.1),
                                maxScale: math.max(_lastFitScale * 4, 2.0),
                                boundaryMargin: const EdgeInsets.all(180),
                                onInteractionEnd: (_) => setState(() {}),
                                child: Builder(
                                  builder: (context) {
                                    final campusTransform = _is3D
                                        ? (Matrix4.identity()
                                          ..setEntry(3, 2, 0.0013)
                                          ..rotateX(0.18)
                                          ..rotateZ(-0.03))
                                        : Matrix4.identity();

                                    return Transform(
                                      alignment: Alignment.center,
                                      transform: campusTransform,
                                      child: SizedBox(
                                        width: _canvasSize.width,
                                        height: _canvasSize.height,
                                        child: Stack(
                                          children: [
                                            const _CampusGridBackground(),
                                            ..._buildRoads(),
                                            ..._blocks.map(
                                              (block) => _CampusBlockWidget(
                                                block: block,
                                                selected:
                                                    _selectedBlock?.label ==
                                                        block.label,
                                                onTap: () {
                                                  setState(() {
                                                    _selectedBlock =
                                                        _selectedBlock?.label ==
                                                                block.label
                                                            ? null
                                                            : block;
                                                  });
                                                },
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    );
                                  },
                                ),
                              ),
                            ),
                          ),
                        ),
                        if (_selectedBlock != null)
                          Positioned(
                            left: 16,
                            right: isWide ? null : 16,
                            bottom: 16,
                            child: ConstrainedBox(
                              constraints: BoxConstraints(
                                maxWidth: isWide ? 360 : double.infinity,
                              ),
                              child: _SelectedBlockCard(
                                block: _selectedBlock!,
                                onClose: () =>
                                    setState(() => _selectedBlock = null),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                  if (!isWide) ...[
                    const SizedBox(height: 12),
                    Text(
                      'Pinch to zoom and drag to explore the map.',
                      style: AppTextStyles.caption.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  double get _currentScale {
    final matrix = _controller.value;
    return matrix.getMaxScaleOnAxis();
  }

  double get _minZoomScale => math.max(_lastFitScale, 0.1);

  double get _maxZoomScale => math.max(_lastFitScale * 4, 2.0);

  void _zoomIn() =>
      _setScale((_currentScale + 0.2).clamp(_minZoomScale, _maxZoomScale));

  void _zoomOut() =>
      _setScale((_currentScale - 0.2).clamp(_minZoomScale, _maxZoomScale));

  void _setScale(double scale) {
    final center = Offset(_canvasSize.width / 2, _canvasSize.height / 2);
    final matrix = Matrix4.identity()
      ..translate(center.dx, center.dy)
      ..scale(scale)
      ..translate(-center.dx, -center.dy);
    _controller.value = matrix;
    setState(() {});
  }

  void _syncFitScale(double fitScale) {
    if ((fitScale - _lastFitScale).abs() < 0.01) return;
    _lastFitScale = fitScale;

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      final currentScale = _currentScale;
      if ((currentScale - fitScale).abs() < 0.01) return;
      _setScale(fitScale);
    });
  }

  List<Widget> _buildRoads() {
    return const [
      _RoadStrip(x: 0, y: 82, width: 1280, height: 18),
      _RoadStrip(x: 0, y: 232, width: 1280, height: 18),
      _RoadStrip(x: 0, y: 412, width: 1280, height: 18),
      _RoadStrip(x: 0, y: 596, width: 1280, height: 18),
      _RoadStrip(x: 290, y: 0, width: 18, height: 720),
      _RoadStrip(x: 864, y: 0, width: 18, height: 720),
      _RoadStrip(x: 1082, y: 0, width: 18, height: 720),
    ];
  }
}

class _HeaderRow extends StatelessWidget {
  final bool isWide;
  final bool is3D;
  final VoidCallback onToggle3D;
  final VoidCallback onZoomIn;
  final VoidCallback onZoomOut;
  final String zoomLabel;

  const _HeaderRow({
    required this.isWide,
    required this.is3D,
    required this.onToggle3D,
    required this.onZoomIn,
    required this.onZoomOut,
    required this.zoomLabel,
  });

  @override
  Widget build(BuildContext context) {
    final content = Row(
      children: [
        Container(
          width: 22,
          height: 22,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(color: AppColors.yellow, width: 2),
          ),
          child: const Icon(Icons.place_outlined,
              size: 12, color: AppColors.yellow),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Campus Map',
                style: AppTextStyles.heading2.copyWith(
                  color: AppColors.white,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                'Interactive campus layout',
                style: AppTextStyles.bodySmall.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(width: 12),
        _TopActionGroup(
          is3D: is3D,
          zoomLabel: zoomLabel,
          onToggle3D: onToggle3D,
          onZoomOut: onZoomOut,
          onZoomIn: onZoomIn,
        ),
      ],
    );

    if (isWide) return content;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        content,
        const SizedBox(height: 12),
        Align(
          alignment: Alignment.centerRight,
          child: _TopActionGroup(
            is3D: is3D,
            zoomLabel: zoomLabel,
            onToggle3D: onToggle3D,
            onZoomOut: onZoomOut,
            onZoomIn: onZoomIn,
            compact: true,
          ),
        ),
      ],
    );
  }
}

class _TopActionGroup extends StatelessWidget {
  final bool is3D;
  final String zoomLabel;
  final VoidCallback onToggle3D;
  final VoidCallback onZoomIn;
  final VoidCallback onZoomOut;
  final bool compact;

  const _TopActionGroup({
    required this.is3D,
    required this.zoomLabel,
    required this.onToggle3D,
    required this.onZoomIn,
    required this.onZoomOut,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    final iconSize = compact ? 14.0 : 16.0;
    final buttonHeight = compact ? 32.0 : 36.0;

    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF2A2216),
        border: Border.all(color: const Color(0xFF5A4A30)),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _ControlButton(
            label: '2D',
            active: !is3D,
            height: buttonHeight,
            onTap: () {
              if (is3D) onToggle3D();
            },
          ),
          _ControlButton(
            label: '3D',
            active: is3D,
            height: buttonHeight,
            onTap: () {
              if (!is3D) onToggle3D();
            },
          ),
          Container(
              width: 1,
              height: buttonHeight - 6,
              color: const Color(0xFF5A4A30)),
          _IconControl(
            icon: Icons.remove,
            size: iconSize,
            height: buttonHeight,
            onTap: onZoomOut,
          ),
          Container(
            width: compact ? 64 : 78,
            height: buttonHeight,
            alignment: Alignment.center,
            child: Text(
              zoomLabel,
              style: AppTextStyles.labelSmall.copyWith(
                color: AppColors.white,
                fontSize: compact ? 10 : 11,
              ),
            ),
          ),
          _IconControl(
            icon: Icons.add,
            size: iconSize,
            height: buttonHeight,
            onTap: onZoomIn,
          ),
        ],
      ),
    );
  }
}

class _ControlButton extends StatelessWidget {
  final String label;
  final bool active;
  final double height;
  final VoidCallback onTap;

  const _ControlButton({
    required this.label,
    required this.active,
    required this.height,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: height,
        padding: const EdgeInsets.symmetric(horizontal: 14),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: active ? AppColors.yellow : Colors.transparent,
        ),
        child: Text(
          label,
          style: AppTextStyles.labelSmall.copyWith(
            color: active ? AppColors.black : AppColors.white,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }
}

class _IconControl extends StatelessWidget {
  final IconData icon;
  final double size;
  final double height;
  final VoidCallback onTap;

  const _IconControl({
    required this.icon,
    required this.size,
    required this.height,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: SizedBox(
        width: height,
        height: height,
        child: Icon(icon, size: size, color: AppColors.white),
      ),
    );
  }
}

class _LegendRow extends StatelessWidget {
  final bool isWide;
  const _LegendRow({required this.isWide});

  @override
  Widget build(BuildContext context) {
    final entries = [
      _LegendEntry('Academic', AppColors.blue),
      _LegendEntry('Hostels', AppColors.green),
      _LegendEntry('Sports', AppColors.red),
      _LegendEntry('Food', AppColors.foodOrange),
      _LegendEntry('Admin', AppColors.adminPurple),
      _LegendEntry('Roads', const Color(0xFFE0E0E0)),
    ];

    return Wrap(
      spacing: 14,
      runSpacing: 8,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: entries,
    );
  }
}

class _LegendEntry extends StatelessWidget {
  final String label;
  final Color color;

  const _LegendEntry(this.label, this.color);

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 11,
          height: 11,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 6),
        Text(
          label,
          style: AppTextStyles.labelSmall.copyWith(
            color: AppColors.white,
            fontSize: 10,
          ),
        ),
      ],
    );
  }
}

class _CampusGridBackground extends StatelessWidget {
  const _CampusGridBackground();

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      painter: _GridPainter(),
      child: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFF17130E), Color(0xFF11100D)],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
      ),
    );
  }
}

class _GridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = const Color(0xFF26231D);
    const spacing = 18.0;
    for (double x = 0; x < size.width; x += spacing) {
      for (double y = 0; y < size.height; y += spacing) {
        canvas.drawCircle(Offset(x, y), 1.1, paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _RoadStrip extends StatelessWidget {
  final double x;
  final double y;
  final double width;
  final double height;

  const _RoadStrip({
    required this.x,
    required this.y,
    required this.width,
    required this.height,
  });

  @override
  Widget build(BuildContext context) {
    final horizontal = width > height;
    return Positioned(
      left: x,
      top: y,
      width: width,
      height: height,
      child: Container(
        decoration: BoxDecoration(
          color: const Color(0xFF6B6B6B),
          border: Border.all(color: const Color(0xFF8A8A8A), width: 1),
        ),
        child: Stack(
          children: [
            if (horizontal)
              Center(
                child: Container(
                  height: 4,
                  margin: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: const BoxDecoration(
                    border: Border(
                      top: BorderSide(color: Colors.white70, width: 2),
                      bottom: BorderSide(color: Colors.white70, width: 2),
                    ),
                  ),
                ),
              )
            else
              Center(
                child: Container(
                  width: 4,
                  margin: const EdgeInsets.symmetric(vertical: 12),
                  decoration: const BoxDecoration(
                    border: Border(
                      left: BorderSide(color: Colors.white70, width: 2),
                      right: BorderSide(color: Colors.white70, width: 2),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _CampusBlockWidget extends StatelessWidget {
  final CampusBlock block;
  final bool selected;
  final VoidCallback onTap;

  const _CampusBlockWidget({
    required this.block,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: block.x,
      top: block.y,
      width: block.width,
      height: block.height,
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          decoration: BoxDecoration(
            color: block.fillColor.withValues(alpha: selected ? 0.85 : 0.65),
            border: Border.all(
              color: selected ? AppColors.white : block.fillColor,
              width: selected ? 2.2 : 1.4,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.25),
                offset: const Offset(2, 2),
                blurRadius: 0,
              ),
            ],
          ),
          child: Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
              child: Text(
                block.label,
                textAlign: TextAlign.center,
                maxLines: block.denseLabel ? 2 : 3,
                overflow: TextOverflow.ellipsis,
                style: AppTextStyles.labelSmall.copyWith(
                  color: AppColors.white,
                  fontSize: block.fontSize,
                  fontWeight: FontWeight.w700,
                  height: 1.05,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _SelectedBlockCard extends StatelessWidget {
  final CampusBlock block;
  final VoidCallback onClose;

  const _SelectedBlockCard({required this.block, required this.onClose});

  @override
  Widget build(BuildContext context) {
    return PecCard(
      color: const Color(0xFFF2E7C8),
      child: Row(
        children: [
          Container(
            width: 14,
            height: 54,
            color: block.fillColor,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  block.label,
                  style: AppTextStyles.labelLarge.copyWith(
                    color: AppColors.black,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  block.categoryLabel,
                  style: AppTextStyles.caption.copyWith(
                    color: AppColors.black.withValues(alpha: 0.72),
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: onClose,
            icon: const Icon(Icons.close, color: AppColors.black),
          ),
        ],
      ),
    );
  }
}

enum CampusCategory { academic, hostel, sports, food, admin }

class CampusBlock {
  final String label;
  final double x;
  final double y;
  final double width;
  final double height;
  final CampusCategory category;
  final bool denseLabel;

  const CampusBlock({
    required this.label,
    required this.x,
    required this.y,
    required this.width,
    required this.height,
    required this.category,
    this.denseLabel = false,
  });

  Color get fillColor {
    switch (category) {
      case CampusCategory.academic:
        return AppColors.blue;
      case CampusCategory.hostel:
        return AppColors.green;
      case CampusCategory.sports:
        return AppColors.red;
      case CampusCategory.food:
        return AppColors.foodOrange;
      case CampusCategory.admin:
        return AppColors.adminPurple;
    }
  }

  String get categoryLabel {
    switch (category) {
      case CampusCategory.academic:
        return 'Academic zone';
      case CampusCategory.hostel:
        return 'Hostel zone';
      case CampusCategory.sports:
        return 'Sports zone';
      case CampusCategory.food:
        return 'Food / services';
      case CampusCategory.admin:
        return 'Admin / support';
    }
  }

  double get fontSize {
    if (width < 60 || height < 34) return 8.2;
    if (width < 90 || height < 42) return 9.0;
    return 10.2;
  }
}
