import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';

class ClubListScreen extends StatelessWidget {
  const ClubListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('/clubs'.toUpperCase().replaceAll('/', '').replaceAll('-', ' '))),
      body: Center(
        child: Text('Phase 2+ - ClubListScreen',
            style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary)),
      ),
    );
  }
}
