import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../domain/entities/user_entity.dart';
import '../providers/auth_provider.dart';

class RoleSelectionScreen extends ConsumerWidget {
  const RoleSelectionScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authNotifierProvider).user;
    final roles = user?.roles ?? [];

    return Scaffold(
      backgroundColor: AppColors.black,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppDimensions.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: AppDimensions.xxl),
              Text('SELECT\nYOUR ROLE',
                  style: AppTextStyles.display.copyWith(color: AppColors.yellow)),
              const SizedBox(height: AppDimensions.md),
              Text('You have multiple roles. Choose how you want to log in today.',
                  style: AppTextStyles.bodyMedium
                      .copyWith(color: AppColors.white.withValues(alpha: 0.7))),
              const SizedBox(height: AppDimensions.xl),
              ...roles.map((role) => _RoleTile(role: role)),
            ],
          ),
        ),
      ),
    );
  }
}

class _RoleTile extends ConsumerWidget {
  final UserRole role;
  const _RoleTile({required this.role});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return GestureDetector(
      onTap: () => ref.read(authNotifierProvider.notifier).selectRole(),
      child: Container(
        margin: const EdgeInsets.only(bottom: AppDimensions.md),
        padding: const EdgeInsets.all(AppDimensions.lg),
        decoration: BoxDecoration(
          color: AppColors.yellow,
          border: Border.all(color: AppColors.black, width: AppDimensions.borderWidth),
          boxShadow: const [
            BoxShadow(
              offset: Offset(AppDimensions.shadowOffset, AppDimensions.shadowOffset),
              color: AppColors.white,
            ),
          ],
        ),
        child: Row(
          children: [
            Text(role.displayName,
                style: AppTextStyles.heading3.copyWith(color: AppColors.black)),
            const Spacer(),
            const Icon(Icons.arrow_forward, color: AppColors.black),
          ],
        ),
      ),
    );
  }
}
