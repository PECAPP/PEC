import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:qr_flutter/qr_flutter.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/faculty_card.dart';
import '../../../faculty_dashboard/presentation/providers/dashboard_provider.dart';

class QrGenerateScreen extends ConsumerStatefulWidget {
  const QrGenerateScreen({super.key});

  @override
  ConsumerState<QrGenerateScreen> createState() => _QrGenerateScreenState();
}

class _QrGenerateScreenState extends ConsumerState<QrGenerateScreen> {
  bool _active = false;
  String _qrData = '';
  int _attendanceCount = 0;
  int _secondsRemaining = 0;
  Timer? _rotateTimer;
  Timer? _countdownTimer;
  int _durationMinutes = 5;

  @override
  void dispose() {
    _rotateTimer?.cancel();
    _countdownTimer?.cancel();
    super.dispose();
  }

  void _startSession() {
    setState(() {
      _active = true;
      _secondsRemaining = _durationMinutes * 60;
      _attendanceCount = 0;
    });
    _rotateQR();
    _rotateTimer = Timer.periodic(const Duration(seconds: 10), (_) => _rotateQR());
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (_secondsRemaining <= 0) {
        _endSession();
      } else {
        setState(() => _secondsRemaining--);
      }
    });
  }

  void _rotateQR() {
    final uniqueId = Random().nextInt(999999).toString().padLeft(6, '0');
    final ts = DateTime.now().millisecondsSinceEpoch;
    setState(() => _qrData = '$uniqueId:$ts');
  }

  void _endSession() {
    _rotateTimer?.cancel();
    _countdownTimer?.cancel();
    setState(() => _active = false);
  }

  String _formatTime(int totalSecs) {
    final m = (totalSecs ~/ 60).toString().padLeft(2, '0');
    final s = (totalSecs % 60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  @override
  Widget build(BuildContext context) {
    final selected = ref.watch(dashboardProvider).selectedCourse;

    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: AppBar(
        backgroundColor: AppColors.bgDark,
        title: Text('QR Attendance', style: AppTextStyles.heading3),
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppDimensions.lg),
          child: Column(
            children: [
              if (selected != null)
                Text('${selected.code} - ${selected.name}',
                    style: AppTextStyles.labelLarge, textAlign: TextAlign.center),
              const SizedBox(height: AppDimensions.lg),

              // QR Code
              FacultyCard(
                padding: const EdgeInsets.all(AppDimensions.lg),
                child: _active
                    ? Column(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: AppColors.white,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: QrImageView(
                              data: _qrData,
                              version: QrVersions.auto,
                              size: 220,
                              backgroundColor: AppColors.white,
                            ),
                          ),
                          const SizedBox(height: 16),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Container(
                                width: 8,
                                height: 8,
                                decoration: const BoxDecoration(
                                  color: AppColors.success,
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Text('Session Active',
                                  style: AppTextStyles.labelMedium.copyWith(color: AppColors.success)),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text(
                            _formatTime(_secondsRemaining),
                            style: AppTextStyles.display.copyWith(fontSize: 40, color: AppColors.gold),
                          ),
                          const SizedBox(height: 8),
                          Text('$_attendanceCount students marked',
                              style: AppTextStyles.bodySmall),
                          const SizedBox(height: 4),
                          Text('QR rotates every 10s',
                              style: AppTextStyles.caption.copyWith(fontSize: 10)),
                        ],
                      )
                    : Column(
                        children: [
                          Icon(Icons.qr_code_2, size: 80, color: AppColors.textMuted),
                          const SizedBox(height: 16),
                          Text('Start a session to generate QR',
                              style: AppTextStyles.bodySmall),
                        ],
                      ),
              ),
              const SizedBox(height: AppDimensions.lg),

              // Duration selector
              if (!_active)
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('Duration: ', style: AppTextStyles.labelMedium),
                    for (final mins in [3, 5, 10, 15])
                      Padding(
                        padding: const EdgeInsets.only(left: 6),
                        child: ChoiceChip(
                          label: Text('${mins}m'),
                          selected: _durationMinutes == mins,
                          onSelected: (_) => setState(() => _durationMinutes = mins),
                          selectedColor: AppColors.gold,
                          labelStyle: TextStyle(
                            color: _durationMinutes == mins ? AppColors.bgDark : AppColors.textSecondary,
                            fontWeight: FontWeight.w600,
                            fontSize: 12,
                          ),
                          side: BorderSide(color: AppColors.borderDark),
                        ),
                      ),
                  ],
                ),
              const SizedBox(height: AppDimensions.lg),

              // Start / End button
              SizedBox(
                width: double.infinity,
                height: 52,
                child: _active
                    ? OutlinedButton(
                        onPressed: _endSession,
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: AppColors.error),
                          foregroundColor: AppColors.error,
                        ),
                        child: const Text('END SESSION'),
                      )
                    : ElevatedButton(
                        onPressed: _startSession,
                        child: const Text('START QR SESSION'),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
