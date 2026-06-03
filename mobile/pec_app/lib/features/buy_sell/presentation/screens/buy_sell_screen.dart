import 'package:flutter/material.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/pec_card.dart';

class BuySellScreen extends StatelessWidget {
  const BuySellScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('BUY AND SELL')),
      body: ListView(
        padding: const EdgeInsets.all(AppDimensions.md),
        children: [
          PecCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.storefront_outlined,
                    color: AppColors.yellow, size: 32),
                const SizedBox(height: AppDimensions.sm),
                Text(
                  'Buy and Sell',
                  style: AppTextStyles.heading3,
                ),
                const SizedBox(height: AppDimensions.xs),
                Text(
                  'Marketplace module is being prepared. You can browse and post items here soon.',
                  style: AppTextStyles.bodySmall
                      .copyWith(color: AppColors.textSecondary),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
