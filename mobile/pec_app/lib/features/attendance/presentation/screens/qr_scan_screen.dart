import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
// import '../../data/datasources/attendance_remote_datasource.dart';
import '../providers/attendance_provider.dart';

class QrScanScreen extends ConsumerStatefulWidget {
  const QrScanScreen({super.key});
  @override
  ConsumerState<QrScanScreen> createState() => _QrScanScreenState();
}

class _QrScanScreenState extends ConsumerState<QrScanScreen> {
  MobileScannerController? _ctrl;
  bool _processing = false;
  String? _msg;
  bool _ok = false;

  @override
  void initState() {
    super.initState();
    _ctrl = MobileScannerController(detectionSpeed: DetectionSpeed.normal, facing: CameraFacing.back);
  }

  @override
  void dispose() { _ctrl?.dispose(); super.dispose(); }

  Future<void> _onDetect(BarcodeCapture c) async {
    if (_processing) return;
    final code = c.barcodes.firstOrNull?.rawValue;
    if (code == null || code.isEmpty) return;
    setState(() => _processing = true);
    await _ctrl?.stop();
    try {
      String sid;
      try { final d = jsonDecode(code) as Map<String,dynamic>; sid = d["sessionId"] as String? ?? code; } catch(_) { sid = code; }
      final user = ref.read(authNotifierProvider).user;
      if (user == null) throw Exception("Not authenticated");
      await ref.read(attendanceDataSourceProvider).markAttendance(sessionId: sid, studentId: user.id);
      ref.invalidate(attendanceSummaryProvider);
      ref.invalidate(attendanceHistoryProvider);
      setState(() { _ok = true; _msg = "Attendance marked!"; });
    } catch(e) {
      final m = e.toString().replaceFirst("Exception: ","");
      setState(() { _ok = false; _msg = m.contains("already") ? "Already marked for this session" : "Failed: $m"; });
    } finally { setState(() => _processing = false); }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text("SCAN QR CODE")),
    body: _msg != null ? _result() : _scanner(),
  );

  Widget _scanner() => Stack(children: [
    MobileScanner(controller: _ctrl!, onDetect: _onDetect),
    CustomPaint(size: MediaQuery.of(context).size, painter: _OverlayPainter()),
    if (_processing) const Center(child: CircularProgressIndicator(color: AppColors.yellow)),
    Positioned(bottom: AppDimensions.xxl, left: 0, right: 0,
      child: Center(child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
        color: Color.fromRGBO(0,0,0,0.7),
        child: Text("POINT AT FACULTY QR CODE",
          style: AppTextStyles.labelSmall.copyWith(color: AppColors.yellow, fontSize: 10)),
      ))),
  ]);

  Widget _result() => Center(child: Padding(
    padding: const EdgeInsets.all(32),
    child: Column(mainAxisSize: MainAxisSize.min, children: [
      Container(
        padding: const EdgeInsets.all(32),
        decoration: BoxDecoration(
          color: _ok ? AppColors.green : AppColors.red,
          border: Border.all(color: AppColors.black, width: 4),
          boxShadow: const [BoxShadow(offset: Offset(8,8), color: AppColors.black)],
        ),
        child: Icon(_ok ? Icons.check_circle_outline : Icons.error_outline, size: 64, color: AppColors.black),
      ),
      const SizedBox(height: 24),
      Text(_ok ? "SUCCESS!" : "ERROR",
        style: AppTextStyles.heading2.copyWith(color: _ok ? AppColors.green : AppColors.red)),
      const SizedBox(height: 8),
      Text(_msg!, style: AppTextStyles.bodyMedium, textAlign: TextAlign.center),
      const SizedBox(height: 32),
      Row(mainAxisAlignment: MainAxisAlignment.center, children: [
        if (!_ok) ...[
          _Btn("TRY AGAIN", AppColors.yellow, AppColors.black, () async { setState(() => _msg = null); await _ctrl?.start(); }),
          const SizedBox(width: 16),
        ],
        _Btn("DONE", AppColors.black, AppColors.white, () => Navigator.of(context).pop()),
      ]),
    ]),
  ));
}

class _Btn extends StatelessWidget {
  final String label; final Color bg, fg; final VoidCallback tap;
  const _Btn(this.label, this.bg, this.fg, this.tap);
  @override Widget build(BuildContext context) => GestureDetector(onTap: tap,
    child: Container(
      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 8),
      decoration: BoxDecoration(color: bg,
        border: Border.all(color: AppColors.black, width: 3),
        boxShadow: const [BoxShadow(offset: Offset(4,4), color: AppColors.black)]),
      child: Text(label, style: AppTextStyles.button.copyWith(color: fg)),
    ));
}

class _OverlayPainter extends CustomPainter {
  @override void paint(Canvas c, Size s) {
    final p = Paint()..color = const Color.fromRGBO(0,0,0,0.55);
    final sz = s.width * 0.7; final l = (s.width-sz)/2; final t = (s.height-sz)/2;
    c.drawRect(Rect.fromLTWH(0,0,s.width,t),p);
    c.drawRect(Rect.fromLTWH(0,t+sz,s.width,s.height-t-sz),p);
    c.drawRect(Rect.fromLTWH(0,t,l,sz),p);
    c.drawRect(Rect.fromLTWH(l+sz,t,s.width-l-sz,sz),p);
    final cp = Paint()..color=AppColors.yellow..strokeWidth=4..style=PaintingStyle.stroke..strokeCap=StrokeCap.round;
    const cl = 20.0;
    c.drawLine(Offset(l,t+cl),Offset(l,t),cp); c.drawLine(Offset(l,t),Offset(l+cl,t),cp);
    c.drawLine(Offset(l+sz-cl,t),Offset(l+sz,t),cp); c.drawLine(Offset(l+sz,t),Offset(l+sz,t+cl),cp);
    c.drawLine(Offset(l,t+sz-cl),Offset(l,t+sz),cp); c.drawLine(Offset(l,t+sz),Offset(l+cl,t+sz),cp);
    c.drawLine(Offset(l+sz-cl,t+sz),Offset(l+sz,t+sz),cp); c.drawLine(Offset(l+sz,t+sz-cl),Offset(l+sz,t+sz),cp);
  }
  @override bool shouldRepaint(covariant CustomPainter o) => false;
}
