import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_dimensions.dart';
import '../../core/constants/app_text_styles.dart';
import 'pec_button.dart';

class PecErrorState extends StatelessWidget {
  final String message;
  final VoidCallback? onRetry;

  const PecErrorState({
    super.key,
    this.message = 'Something went wrong.',
    this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppDimensions.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(AppDimensions.lg),
              decoration: BoxDecoration(
                color: AppColors.red,
                border: Border.all(color: AppColors.black, width: AppDimensions.borderWidth),
                boxShadow: const [
                  BoxShadow(
                    offset: Offset(AppDimensions.shadowOffset, AppDimensions.shadowOffset),
                    color: AppColors.black,
                  ),
                ],
              ),
              child: const Icon(Icons.error_outline, size: 48, color: AppColors.white),
            ),
            const SizedBox(height: AppDimensions.lg),
            Text('Oops!', style: AppTextStyles.heading3),
            const SizedBox(height: AppDimensions.sm),
            Text(message,
                style: AppTextStyles.bodyMedium
                    .copyWith(color: AppColors.textSecondary),
                textAlign: TextAlign.center),
            if (onRetry != null) ...[
              const SizedBox(height: AppDimensions.lg),
              PecButton(
                label: 'TRY AGAIN',
                onPressed: onRetry,
                color: AppColors.red,
                textColor: AppColors.white,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
