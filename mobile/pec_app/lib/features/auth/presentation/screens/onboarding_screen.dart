import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/pec_button.dart';
import '../providers/auth_provider.dart';

class OnboardingScreen extends ConsumerWidget {
  const OnboardingScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: AppColors.black,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppDimensions.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: AppDimensions.xxl),
              Text('COMPLETE\nYOUR\nPROFILE',
                  style: AppTextStyles.display.copyWith(color: AppColors.yellow)),
              const SizedBox(height: AppDimensions.md),
              Text(
                'Please complete your profile to get started with the PEC Campus ERP.',
                style: AppTextStyles.bodyMedium
                    .copyWith(color: AppColors.white.withValues(alpha: 0.7)),
              ),
              const Spacer(),
              PecButton(
                label: 'CONTINUE TO APP',
                onPressed: () =>
                    ref.read(authNotifierProvider.notifier).completeOnboarding(),
                fullWidth: true,
                color: AppColors.yellow,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
