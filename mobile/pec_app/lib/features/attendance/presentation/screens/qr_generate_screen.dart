import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';

class QrGenerateScreen extends StatelessWidget {
  const QrGenerateScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('/attendance/generate'.toUpperCase().replaceAll('/', '').replaceAll('-', ' '))),
      body: Center(
        child: Text('Phase 2+ - QrGenerateScreen',
            style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary)),
      ),
    );
  }
}
