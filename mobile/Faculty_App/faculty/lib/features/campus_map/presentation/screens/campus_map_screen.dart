import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';

// ── Screen ──────────────────────────────────────────────────────────────────

class CampusMapScreen extends StatefulWidget {
  const CampusMapScreen({super.key});

  @override
  State<CampusMapScreen> createState() => _CampusMapScreenState();
}

class _CampusMapScreenState extends State<CampusMapScreen> {
  static const Size _canvasSize = Size(1280, 720);

  final TransformationController _controller = TransformationController();
  _CampusBlock? _selectedBlock;
  bool _is3D = false;
  double _lastFitScale = -1;

  // ── campus data ─────────────────────────────────────────────────────────

  static const List<_CampusBlock> _blocks = [
    _CampusBlock(label: "Director's Residence", x: 335, y: 28,  w: 138, h: 55,  cat: _Cat.admin),
    _CampusBlock(label: 'Community Centre',     x: 925, y: 28,  w: 150, h: 58,  cat: _Cat.admin),
    _CampusBlock(label: 'Forbidden Forest',     x: 1104,y: 28,  w: 92,  h: 60,  cat: _Cat.sports),
    _CampusBlock(label: 'Vindhya Hostel',       x: 36,  y: 136, w: 100, h: 92,  cat: _Cat.hostel),
    _CampusBlock(label: 'Aravali Hostel',       x: 142, y: 136, w: 100, h: 92,  cat: _Cat.hostel),
    _CampusBlock(label: 'Guest House',          x: 335, y: 136, w: 138, h: 42,  cat: _Cat.admin),
    _CampusBlock(label: 'ECE & CSE Dept',       x: 335, y: 186, w: 138, h: 40,  cat: _Cat.academic),
    _CampusBlock(label: 'New Academic Block',   x: 505, y: 136, w: 255, h: 94,  cat: _Cat.academic),
    _CampusBlock(label: 'K.C. Hostel',          x: 906, y: 136, w: 172, h: 92,  cat: _Cat.hostel),
    _CampusBlock(label: 'Aero Workshops',       x: 1104,y: 136, w: 92,  h: 92,  cat: _Cat.academic),
    _CampusBlock(label: 'PEC Market',           x: 36,  y: 264, w: 100, h: 56,  cat: _Cat.food),
    _CampusBlock(label: 'Bamboo Garden',        x: 142, y: 264, w: 100, h: 56,  cat: _Cat.sports),
    _CampusBlock(label: 'Himalaya Hostel',      x: 36,  y: 326, w: 100, h: 84,  cat: _Cat.hostel),
    _CampusBlock(label: 'CCA',                  x: 142, y: 326, w: 100, h: 52,  cat: _Cat.admin),
    _CampusBlock(label: 'L-20',                 x: 336, y: 264, w: 58,  h: 28,  cat: _Cat.academic),
    _CampusBlock(label: 'L-21',                 x: 402, y: 264, w: 58,  h: 28,  cat: _Cat.academic),
    _CampusBlock(label: 'L-22',                 x: 336, y: 300, w: 58,  h: 28,  cat: _Cat.academic),
    _CampusBlock(label: 'L-23',                 x: 402, y: 300, w: 58,  h: 28,  cat: _Cat.academic),
    _CampusBlock(label: 'C.C.',                 x: 336, y: 336, w: 124, h: 44,  cat: _Cat.academic),
    _CampusBlock(label: 'Aero Dept',            x: 508, y: 284, w: 122, h: 58,  cat: _Cat.academic),
    _CampusBlock(label: 'C.C.D.',               x: 484, y: 358, w: 72,  h: 34,  cat: _Cat.food),
    _CampusBlock(label: 'L-26',                 x: 645, y: 274, w: 72,  h: 36,  cat: _Cat.academic),
    _CampusBlock(label: 'L-27',                 x: 645, y: 320, w: 72,  h: 36,  cat: _Cat.academic),
    _CampusBlock(label: 'IT 201',               x: 748, y: 274, w: 104, h: 36,  cat: _Cat.academic),
    _CampusBlock(label: 'Civil Dept',           x: 578, y: 360, w: 110, h: 48,  cat: _Cat.academic),
    _CampusBlock(label: 'Mech Dept',            x: 736, y: 360, w: 114, h: 48,  cat: _Cat.academic),
    _CampusBlock(label: 'Chemistry Lab',        x: 510, y: 446, w: 228, h: 42,  cat: _Cat.academic),
    _CampusBlock(label: 'Auto Lab',             x: 766, y: 446, w: 100, h: 42,  cat: _Cat.academic),
    _CampusBlock(label: 'W.S.',                 x: 766, y: 494, w: 100, h: 36,  cat: _Cat.academic),
    _CampusBlock(label: 'T-1',                  x: 510, y: 512, w: 46,  h: 28,  cat: _Cat.academic),
    _CampusBlock(label: 'T-2',                  x: 564, y: 512, w: 46,  h: 28,  cat: _Cat.academic),
    _CampusBlock(label: 'T-3',                  x: 618, y: 512, w: 46,  h: 28,  cat: _Cat.academic),
    _CampusBlock(label: 'T-4',                  x: 510, y: 546, w: 46,  h: 28,  cat: _Cat.academic),
    _CampusBlock(label: 'T-5',                  x: 564, y: 546, w: 46,  h: 28,  cat: _Cat.academic),
    _CampusBlock(label: 'T-6',                  x: 618, y: 546, w: 46,  h: 28,  cat: _Cat.academic),
    _CampusBlock(label: 'DH-1',                 x: 504, y: 604, w: 82,  h: 42,  cat: _Cat.food),
    _CampusBlock(label: 'DH-2',                 x: 600, y: 604, w: 82,  h: 42,  cat: _Cat.food),
    _CampusBlock(label: 'DH-3',                 x: 694, y: 604, w: 82,  h: 42,  cat: _Cat.food),
    _CampusBlock(label: 'DH-4',                 x: 790, y: 604, w: 82,  h: 42,  cat: _Cat.food),
    _CampusBlock(label: 'Athletic Ground',      x: 906, y: 264, w: 174, h: 254, cat: _Cat.sports, dense: true),
    _CampusBlock(label: 'PECOSA',               x: 906, y: 544, w: 174, h: 36,  cat: _Cat.admin),
    _CampusBlock(label: 'Parking',              x: 906, y: 590, w: 174, h: 36,  cat: _Cat.admin),
    _CampusBlock(label: 'Gym',                  x: 1110,y: 544, w: 82,  h: 72,  cat: _Cat.sports),
    _CampusBlock(label: 'Common Wealth Block',  x: 36,  y: 644, w: 128, h: 68,  cat: _Cat.admin),
    _CampusBlock(label: 'Football Ground',      x: 170, y: 644, w: 82,  h: 68,  cat: _Cat.sports),
    _CampusBlock(label: 'Admin Block',          x: 330, y: 644, w: 128, h: 68,  cat: _Cat.admin),
    _CampusBlock(label: 'Cricket Ground',       x: 516, y: 644, w: 272, h: 68,  cat: _Cat.sports),
    _CampusBlock(label: 'Centre of Excellence', x: 820, y: 648, w: 180, h: 52,  cat: _Cat.academic),
    _CampusBlock(label: 'Shiwalik Hostel',      x: 1110,y: 644, w: 136, h: 68,  cat: _Cat.hostel),
    _CampusBlock(label: 'Rotodynamics',         x: 1104,y: 336, w: 92,  h: 58,  cat: _Cat.academic),
    _CampusBlock(label: 'Meta Dept',            x: 152, y: 456, w: 86,  h: 48,  cat: _Cat.academic),
    _CampusBlock(label: 'SPIC Building',        x: 152, y: 514, w: 86,  h: 40,  cat: _Cat.academic),
    _CampusBlock(label: 'Library',              x: 335, y: 436, w: 130, h: 92,  cat: _Cat.academic),
    _CampusBlock(label: 'Auditorium',           x: 335, y: 560, w: 130, h: 54,  cat: _Cat.admin),
  ];

  // ── lifecycle ────────────────────────────────────────────────────────────

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  // ── helpers ──────────────────────────────────────────────────────────────

  double get _currentScale => _controller.value.getMaxScaleOnAxis();
  double get _minScale    => math.max(_lastFitScale, 0.1);
  double get _maxScale    => math.max(_lastFitScale * 4, 2.0);

  void _zoom(double delta) {
    final next = (_currentScale + delta).clamp(_minScale, _maxScale);
    final cx = _canvasSize.width / 2;
    final cy = _canvasSize.height / 2;
    _controller.value = Matrix4.identity()
      ..translate(cx, cy)
      ..scale(next)
      ..translate(-cx, -cy);
    setState(() {});
  }

  void _syncFitScale(double fit) {
    if ((fit - _lastFitScale).abs() < 0.01) return;
    _lastFitScale = fit;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      if ((_currentScale - fit).abs() < 0.01) return;
      final cx = _canvasSize.width / 2;
      final cy = _canvasSize.height / 2;
      _controller.value = Matrix4.identity()
        ..translate(cx, cy)
        ..scale(fit)
        ..translate(-cx, -cy);
      setState(() {});
    });
  }

  // ── build ─────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            final w = constraints.maxWidth;
            final h = constraints.maxHeight;

            // Fit-to-screen scale: map always fills available width
            final mapH = math.max(400.0, h - 156);
            final fit  = math.min(w / _canvasSize.width, mapH / _canvasSize.height);
            _syncFitScale(fit);

            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ── header ────────────────────────────────────────────────
                _Header(
                  is3D: _is3D,
                  zoomPct: '${(_currentScale * 100).round()}%',
                  onBack: () => Navigator.of(context).pop(),
                  onToggle3D: () => setState(() => _is3D = !_is3D),
                  onZoomIn:  () => _zoom(0.2),
                  onZoomOut: () => _zoom(-0.2),
                ),

                // ── legend ────────────────────────────────────────────────
                const _Legend(),

                // ── map viewport ──────────────────────────────────────────
                Expanded(
                  child: Stack(
                    children: [
                      Center(
                        child: Container(
                          constraints: BoxConstraints(
                            maxWidth: math.min(w, 1280),
                            maxHeight: mapH,
                          ),
                          decoration: BoxDecoration(
                            color: const Color(0xFF1A1713),
                            border: Border.all(color: AppColors.borderDark, width: 1.2),
                            boxShadow: const [
                              BoxShadow(offset: Offset(0, 8), blurRadius: 20, color: Colors.black54),
                            ],
                          ),
                          child: ClipRect(
                            child: InteractiveViewer(
                              transformationController: _controller,
                              minScale: _minScale,
                              maxScale: _maxScale,
                              boundaryMargin: const EdgeInsets.all(160),
                              onInteractionEnd: (_) => setState(() {}),
                              child: _MapCanvas(
                                blocks: _blocks,
                                selectedLabel: _selectedBlock?.label,
                                is3D: _is3D,
                                onTap: (b) => setState(() {
                                  _selectedBlock = _selectedBlock?.label == b.label ? null : b;
                                }),
                              ),
                            ),
                          ),
                        ),
                      ),

                      // ── detail card ───────────────────────────────────────
                      if (_selectedBlock != null)
                        Positioned(
                          left: 12,
                          right: 12,
                          bottom: 12,
                          child: _DetailCard(
                            block: _selectedBlock!,
                            onClose: () => setState(() => _selectedBlock = null),
                          ),
                        ),
                    ],
                  ),
                ),

                // ── hint ──────────────────────────────────────────────────
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
                  child: Text(
                    'Pinch to zoom · Drag to pan · Tap a block to inspect',
                    style: AppTextStyles.caption.copyWith(color: AppColors.textMuted),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

// ── Header ───────────────────────────────────────────────────────────────────

class _Header extends StatelessWidget {
  final bool is3D;
  final String zoomPct;
  final VoidCallback onBack;
  final VoidCallback onToggle3D;
  final VoidCallback onZoomIn;
  final VoidCallback onZoomOut;

  const _Header({
    required this.is3D,
    required this.zoomPct,
    required this.onBack,
    required this.onToggle3D,
    required this.onZoomIn,
    required this.onZoomOut,
  });

  @override
  Widget build(BuildContext context) {
    final isMobile = MediaQuery.of(context).size.width < 420;
    
    return Container(
      height: 56,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: AppColors.bgDark,
        border: Border(bottom: BorderSide(color: AppColors.borderDark)),
      ),
      child: Row(
        children: [
          // back
          _IconBtn(icon: Icons.arrow_back_ios_new_rounded, size: 18, onTap: onBack),
          const SizedBox(width: 8),

          // title icon
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: AppColors.goldSubtle,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.gold.withValues(alpha: 0.3)),
            ),
            child: const Icon(Icons.map_outlined, size: 18, color: AppColors.gold),
          ),
          const SizedBox(width: 10),
          
          // title text
          Expanded(
            child: SingleChildScrollView(
              scrollDirection: Axis.vertical,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'Campus Map',
                    style: AppTextStyles.labelLarge.copyWith(
                      color: AppColors.textPrimary,
                      fontWeight: FontWeight.w700,
                      fontSize: isMobile ? 13 : 14,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (!isMobile) ...[
                    const SizedBox(height: 2),
                    Text(
                      'Punjab Engineering College',
                      style: AppTextStyles.caption.copyWith(
                        color: AppColors.textMuted,
                        fontSize: 10,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ],
              ),
            ),
          ),

          // controls
          _ControlBar(
            is3D: is3D,
            zoomPct: zoomPct,
            onToggle3D: onToggle3D,
            onZoomIn: onZoomIn,
            onZoomOut: onZoomOut,
          ),
        ],
      ),
    );
  }
}

// ── Controls bar ─────────────────────────────────────────────────────────────

class _ControlBar extends StatelessWidget {
  final bool is3D;
  final String zoomPct;
  final VoidCallback onToggle3D;
  final VoidCallback onZoomIn;
  final VoidCallback onZoomOut;

  const _ControlBar({
    required this.is3D,
    required this.zoomPct,
    required this.onToggle3D,
    required this.onZoomIn,
    required this.onZoomOut,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 34,
      decoration: BoxDecoration(
        color: AppColors.cardDark,
        border: Border.all(color: AppColors.borderDark),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _ModeBtn(label: '2D', active: !is3D, onTap: () { if (is3D) onToggle3D(); }),
          _ModeBtn(label: '3D', active: is3D,  onTap: () { if (!is3D) onToggle3D(); }),
          Container(width: 1, height: 22, color: AppColors.borderDark),
          _IconBtn(icon: Icons.remove, size: 14, onTap: onZoomOut, boxSize: 34),
          SizedBox(
            width: 52,
            child: Text(
              zoomPct,
              textAlign: TextAlign.center,
              style: AppTextStyles.caption.copyWith(
                color: AppColors.textPrimary,
                fontSize: 10,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          _IconBtn(icon: Icons.add, size: 14, onTap: onZoomIn, boxSize: 34),
        ],
      ),
    );
  }
}

class _ModeBtn extends StatelessWidget {
  final String label;
  final bool active;
  final VoidCallback onTap;

  const _ModeBtn({required this.label, required this.active, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 34,
        height: 34,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: active ? AppColors.gold : Colors.transparent,
          borderRadius: BorderRadius.circular(5),
        ),
        child: Text(
          label,
          style: AppTextStyles.caption.copyWith(
            color: active ? AppColors.bgDark : AppColors.textSecondary,
            fontWeight: FontWeight.w800,
            fontSize: 11,
          ),
        ),
      ),
    );
  }
}

class _IconBtn extends StatelessWidget {
  final IconData icon;
  final double size;
  final VoidCallback onTap;
  final double boxSize;

  const _IconBtn({
    required this.icon,
    required this.size,
    required this.onTap,
    this.boxSize = 44,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: SizedBox(
        width: boxSize,
        height: boxSize,
        child: Icon(icon, size: size, color: AppColors.textSecondary),
      ),
    );
  }
}

// ── Legend ───────────────────────────────────────────────────────────────────

class _Legend extends StatelessWidget {
  const _Legend();

  static const _items = [
    ('Academic', Color(0xFF3B82F6)),
    ('Hostels',  Color(0xFF4ADE80)),
    ('Sports',   Color(0xFFEF4444)),
    ('Food',     Color(0xFFF97316)),
    ('Admin',    Color(0xFFA855F7)),
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Wrap(
        spacing: 14,
        runSpacing: 6,
        children: _items.map((e) {
          return Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(color: e.$2, shape: BoxShape.circle),
              ),
              const SizedBox(width: 5),
              Text(
                e.$1,
                style: AppTextStyles.caption.copyWith(
                  color: AppColors.textSecondary,
                  fontSize: 10,
                ),
              ),
            ],
          );
        }).toList(),
      ),
    );
  }
}

// ── Map canvas ────────────────────────────────────────────────────────────────

class _MapCanvas extends StatelessWidget {
  final List<_CampusBlock> blocks;
  final String? selectedLabel;
  final bool is3D;
  final void Function(_CampusBlock) onTap;

  const _MapCanvas({
    required this.blocks,
    required this.selectedLabel,
    required this.is3D,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final perspective = is3D
        ? (Matrix4.identity()
          ..setEntry(3, 2, 0.0013)
          ..rotateX(0.18)
          ..rotateZ(-0.03))
        : Matrix4.identity();

    return Transform(
      alignment: Alignment.center,
      transform: perspective,
      child: SizedBox(
        width: 1280,
        height: 720,
        child: Stack(
          children: [
            // dot-grid background
            const _GridBg(),

            // roads
            ..._roads.map((r) => _Road(x: r[0], y: r[1], w: r[2], h: r[3])),

            // buildings
            ...blocks.map((b) => _Block(
              block: b,
              selected: selectedLabel == b.label,
              onTap: () => onTap(b),
            )),
          ],
        ),
      ),
    );
  }

  static const _roads = [
    [0.0,   82.0,  1280.0, 18.0],
    [0.0,   232.0, 1280.0, 18.0],
    [0.0,   412.0, 1280.0, 18.0],
    [0.0,   596.0, 1280.0, 18.0],
    [290.0, 0.0,   18.0,   720.0],
    [864.0, 0.0,   18.0,   720.0],
    [1082.0,0.0,   18.0,   720.0],
  ];
}

// ── Dot-grid background ───────────────────────────────────────────────────────

class _GridBg extends StatelessWidget {
  const _GridBg();

  @override
  Widget build(BuildContext context) {
    return SizedBox.expand(
      child: CustomPaint(
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
      ),
    );
  }
}

class _GridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final p = Paint()..color = const Color(0xFF26231D);
    const step = 18.0;
    for (double x = 0; x < size.width; x += step) {
      for (double y = 0; y < size.height; y += step) {
        canvas.drawCircle(Offset(x, y), 1.1, p);
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter old) => false;
}

// ── Road strip ────────────────────────────────────────────────────────────────

class _Road extends StatelessWidget {
  final double x, y, w, h;
  const _Road({required this.x, required this.y, required this.w, required this.h});

  @override
  Widget build(BuildContext context) {
    final horiz = w > h;
    return Positioned(
      left: x, top: y, width: w, height: h,
      child: Container(
        decoration: BoxDecoration(
          color: const Color(0xFF6B6B6B),
          border: Border.all(color: const Color(0xFF8A8A8A), width: 0.8),
        ),
        child: Center(
          child: horiz
              ? Container(
                  height: 4,
                  margin: const EdgeInsets.symmetric(horizontal: 10),
                  decoration: const BoxDecoration(
                    border: Border(
                      top:    BorderSide(color: Colors.white60, width: 1.5),
                      bottom: BorderSide(color: Colors.white60, width: 1.5),
                    ),
                  ),
                )
              : Container(
                  width: 4,
                  margin: const EdgeInsets.symmetric(vertical: 10),
                  decoration: const BoxDecoration(
                    border: Border(
                      left:  BorderSide(color: Colors.white60, width: 1.5),
                      right: BorderSide(color: Colors.white60, width: 1.5),
                    ),
                  ),
                ),
        ),
      ),
    );
  }
}

// ── Building block ────────────────────────────────────────────────────────────

class _Block extends StatelessWidget {
  final _CampusBlock block;
  final bool selected;
  final VoidCallback onTap;

  const _Block({required this.block, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final col = block.color;
    return Positioned(
      left: block.x, top: block.y, width: block.w, height: block.h,
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 140),
          decoration: BoxDecoration(
            color: col.withValues(alpha: selected ? 0.88 : 0.64),
            border: Border.all(
              color: selected ? AppColors.gold : col,
              width: selected ? 2.0 : 1.2,
            ),
            boxShadow: [
              BoxShadow(
                color: selected
                    ? AppColors.gold.withValues(alpha: 0.35)
                    : Colors.black.withValues(alpha: 0.22),
                offset: const Offset(2, 2),
                blurRadius: selected ? 6 : 0,
              ),
            ],
          ),
          child: Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 3),
              child: Text(
                block.label,
                textAlign: TextAlign.center,
                maxLines: block.dense ? 2 : 3,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontFamily: 'DMSans',
                  fontSize: block.fontSize,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
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

// ── Detail card ───────────────────────────────────────────────────────────────

class _DetailCard extends StatelessWidget {
  final _CampusBlock block;
  final VoidCallback onClose;

  const _DetailCard({required this.block, required this.onClose});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.cardDark,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.borderDark),
        boxShadow: const [
          BoxShadow(color: Colors.black54, blurRadius: 16, offset: Offset(0, 6)),
        ],
      ),
      child: Row(
        children: [
          // colour accent bar
          Container(
            width: 5,
            height: 60,
            decoration: BoxDecoration(
              color: block.color,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(10),
                bottomLeft: Radius.circular(10),
              ),
            ),
          ),

          // icon
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: block.color.withValues(alpha: 0.16),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(block.catIcon, size: 18, color: block.color),
            ),
          ),

          // text
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 12),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    block.label,
                    style: AppTextStyles.labelLarge.copyWith(
                      color: AppColors.textPrimary,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 3),
                  Row(
                    children: [
                      Container(
                        width: 6,
                        height: 6,
                        decoration: BoxDecoration(
                          color: block.color,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 5),
                      Text(
                        block.catLabel,
                        style: AppTextStyles.caption.copyWith(
                          color: AppColors.textMuted,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // close
          GestureDetector(
            onTap: onClose,
            behavior: HitTestBehavior.opaque,
            child: const SizedBox(
              width: 44,
              height: 60,
              child: Icon(Icons.close_rounded, size: 18, color: AppColors.textMuted),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Data model ────────────────────────────────────────────────────────────────

enum _Cat { academic, hostel, sports, food, admin }

class _CampusBlock {
  final String label;
  final double x, y, w, h;
  final _Cat cat;
  final bool dense;

  const _CampusBlock({
    required this.label,
    required this.x,
    required this.y,
    required this.w,
    required this.h,
    required this.cat,
    this.dense = false,
  });

  Color get color {
    switch (cat) {
      case _Cat.academic: return const Color(0xFF3B82F6);
      case _Cat.hostel:   return const Color(0xFF4ADE80);
      case _Cat.sports:   return const Color(0xFFEF4444);
      case _Cat.food:     return const Color(0xFFF97316);
      case _Cat.admin:    return const Color(0xFFA855F7);
    }
  }

  IconData get catIcon {
    switch (cat) {
      case _Cat.academic: return Icons.school_outlined;
      case _Cat.hostel:   return Icons.hotel_outlined;
      case _Cat.sports:   return Icons.sports_outlined;
      case _Cat.food:     return Icons.restaurant_outlined;
      case _Cat.admin:    return Icons.business_outlined;
    }
  }

  String get catLabel {
    switch (cat) {
      case _Cat.academic: return 'Academic zone';
      case _Cat.hostel:   return 'Hostel zone';
      case _Cat.sports:   return 'Sports zone';
      case _Cat.food:     return 'Food & services';
      case _Cat.admin:    return 'Admin & support';
    }
  }

  double get fontSize {
    if (w < 60 || h < 34) return 8.0;
    if (w < 90 || h < 42) return 8.8;
    return 10.0;
  }
}
