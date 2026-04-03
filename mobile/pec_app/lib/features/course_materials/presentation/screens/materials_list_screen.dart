import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';

class MaterialsListScreen extends StatelessWidget {
  final String? courseId;
  const MaterialsListScreen({super.key, this.courseId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('COURSE MATERIALS')),
      body: Center(
        child: Text('Materials for ${courseId ?? 'all'} - Phase 2',
            style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary)),
      ),
    );
  }
}
