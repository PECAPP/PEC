import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/pec_avatar.dart';
import '../../../../shared/widgets/pec_badge.dart';
import '../../../../shared/widgets/pec_button.dart';
import '../../../../shared/widgets/pec_card.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authNotifierProvider).user;
    if (user == null) return const SizedBox.shrink();

    return Scaffold(
      appBar: AppBar(
        title: const Text('PROFILE'),
        actions: [
          TextButton(
            onPressed: () {},
            child: Text('EDIT',
                style: AppTextStyles.labelLarge
                    .copyWith(color: AppColors.yellow)),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppDimensions.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Avatar + name
            PecCard(
              color: AppColors.yellow,
              child: Row(
                children: [
                  PecAvatar(
                    name: user.name,
                    imageUrl: user.avatarUrl,
                    size: AppDimensions.avatarLg,
                  ),
                  const SizedBox(width: AppDimensions.md),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(user.name.isEmpty ? '(No name set)' : user.name,
                            style: AppTextStyles.heading3
                                .copyWith(color: AppColors.black)),
                        const SizedBox(height: AppDimensions.xs),
                        Text(user.email,
                            style: AppTextStyles.bodySmall
                                .copyWith(color: AppColors.black.withValues(alpha: 0.7))),
                        const SizedBox(height: AppDimensions.sm),
                        Wrap(
                          spacing: AppDimensions.xs,
                          children: user.roles
                              .map((r) => PecBadge(
                                    label: r.displayName,
                                    color: AppColors.black,
                                    textColor: AppColors.yellow,
                                  ))
                              .toList(),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppDimensions.lg),

            // Info rows
            _InfoSection(title: 'ACCOUNT', items: [
              _InfoRow(label: 'Email', value: user.email),
              _InfoRow(label: 'Phone', value: user.phone ?? '—'),
              _InfoRow(
                label: 'Profile',
                value: user.profileComplete ? 'Complete' : 'Incomplete',
              ),
            ]),
            const SizedBox(height: AppDimensions.lg),

            // Actions
            _InfoSection(title: 'SETTINGS', items: const []),
            const SizedBox(height: AppDimensions.sm),
            PecButton(
              label: 'MY RESUME',
              onPressed: () => context.push('/resume'),
              fullWidth: true,
              variant: PecButtonVariant.outlined,
              prefixIcon: Icons.description_outlined,
            ),
            const SizedBox(height: AppDimensions.sm),
            PecButton(
              label: 'MY PORTFOLIO',
              onPressed: () => context.push('/portfolio'),
              fullWidth: true,
              variant: PecButtonVariant.outlined,
              prefixIcon: Icons.work_outline,
            ),
            const SizedBox(height: AppDimensions.sm),
            PecButton(
              label: 'SETTINGS',
              onPressed: () => context.push('/settings'),
              fullWidth: true,
              variant: PecButtonVariant.outlined,
              prefixIcon: Icons.settings_outlined,
            ),
            const SizedBox(height: AppDimensions.lg),
            PecButton(
              label: 'SIGN OUT',
              onPressed: () async {
                await ref.read(authNotifierProvider.notifier).signOut();
              },
              fullWidth: true,
              color: AppColors.red,
              textColor: AppColors.white,
              prefixIcon: Icons.logout,
            ),
            const SizedBox(height: AppDimensions.xxl),
          ],
        ),
      ),
    );
  }
}

class _InfoSection extends StatelessWidget {
  final String title;
  final List<_InfoRow> items;
  const _InfoSection({required this.title, required this.items});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(children: [
          Container(width: 4, height: 20, color: AppColors.yellow),
          const SizedBox(width: AppDimensions.sm),
          Text(title, style: AppTextStyles.labelLarge),
        ]),
        const SizedBox(height: AppDimensions.sm),
        if (items.isNotEmpty)
          PecCard(
            child: Column(
              children: items
                  .map((row) => Padding(
                        padding: const EdgeInsets.only(bottom: AppDimensions.sm),
                        child: row,
                      ))
                  .toList(),
            ),
          ),
      ],
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;
  const _InfoRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text(label,
            style: AppTextStyles.labelSmall
                .copyWith(color: AppColors.textSecondary)),
        const Spacer(),
        Text(value, style: AppTextStyles.bodyMedium),
      ],
    );
  }
}
