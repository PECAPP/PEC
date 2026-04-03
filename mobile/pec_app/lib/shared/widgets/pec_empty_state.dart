import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_dimensions.dart';
import '../../core/constants/app_text_styles.dart';
import 'pec_button.dart';

class PecEmptyState extends StatelessWidget {
  final String title;
  final String? subtitle;
  final IconData icon;
  final String? ctaLabel;
  final VoidCallback? onCta;

  const PecEmptyState({
    super.key,
    required this.title,
    this.subtitle,
    this.icon = Icons.inbox_outlined,
    this.ctaLabel,
    this.onCta,
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
                color: AppColors.yellow,
                border: Border.all(color: AppColors.black, width: AppDimensions.borderWidth),
                boxShadow: const [
                  BoxShadow(
                    offset: Offset(AppDimensions.shadowOffset, AppDimensions.shadowOffset),
                    color: AppColors.black,
                  ),
                ],
              ),
              child: Icon(icon, size: 48, color: AppColors.black),
            ),
            const SizedBox(height: AppDimensions.lg),
            Text(title,
                style: AppTextStyles.heading3,
                textAlign: TextAlign.center),
            if (subtitle != null) ...[
              const SizedBox(height: AppDimensions.sm),
              Text(subtitle!,
                  style: AppTextStyles.bodyMedium
                      .copyWith(color: AppColors.textSecondary),
                  textAlign: TextAlign.center),
            ],
            if (ctaLabel != null && onCta != null) ...[
              const SizedBox(height: AppDimensions.lg),
              PecButton(label: ctaLabel!, onPressed: onCta),
            ],
          ],
        ),
      ),
    );
  }
}
