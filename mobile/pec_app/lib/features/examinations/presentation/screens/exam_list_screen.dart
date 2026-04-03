import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';

class ExamListScreen extends StatelessWidget {
  const ExamListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('/examinations'.toUpperCase().replaceAll('/', '').replaceAll('-', ' '))),
      body: Center(
        child: Text('Phase 2+ - ExamListScreen',
            style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary)),
      ),
    );
  }
}
