import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:package_info_plus/package_info_plus.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/providers/theme_provider.dart';
import '../../../../shared/widgets/pec_card.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  String _version = '';
  String _buildNumber = '';

  @override
  void initState() {
    super.initState();
    PackageInfo.fromPlatform().then((info) {
      if (mounted) {
        setState(() {
          _version = info.version;
          _buildNumber = info.buildNumber;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final themeMode = ref.watch(themeModeProvider);

    return Scaffold(
      backgroundColor: AppColors.black,
      appBar: AppBar(
        backgroundColor: AppColors.black,
        title: Text('SETTINGS', style: AppTextStyles.heading3),
      ),
      body: ListView(
        padding: const EdgeInsets.all(AppDimensions.md),
        children: [
          // Appearance
          _SectionHeader(title: 'APPEARANCE'),
          const SizedBox(height: AppDimensions.sm),
          PecCard(
            child: Column(
              children: [
                _SettingsRow(
                  icon: Icons.dark_mode_outlined,
                  label: 'Dark Mode',
                  trailing: Switch(
                    value: themeMode == ThemeMode.dark,
                    onChanged: (_) =>
                        ref.read(themeModeProvider.notifier).toggle(),
                    activeColor: AppColors.yellow,
                  ),
                ),
                _Divider(),
                _SettingsRow(
                  icon: Icons.phone_android_outlined,
                  label: 'Use System Theme',
                  trailing: Switch(
                    value: themeMode == ThemeMode.system,
                    onChanged: (val) => ref
                        .read(themeModeProvider.notifier)
                        .setTheme(val ? ThemeMode.system : ThemeMode.dark),
                    activeColor: AppColors.yellow,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppDimensions.lg),

          // Notifications
          _SectionHeader(title: 'NOTIFICATIONS'),
          const SizedBox(height: AppDimensions.sm),
          PecCard(
            child: Column(
              children: [
                _SettingsRow(
                  icon: Icons.notifications_outlined,
                  label: 'Push Notifications',
                  trailing: _ComingSoonBadge(),
                ),
                _Divider(),
                _SettingsRow(
                  icon: Icons.campaign_outlined,
                  label: 'Notice Board Alerts',
                  trailing: _ComingSoonBadge(),
                ),
                _Divider(),
                _SettingsRow(
                  icon: Icons.chat_bubble_outline,
                  label: 'Chat Notifications',
                  trailing: _ComingSoonBadge(),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppDimensions.lg),

          // Security
          _SectionHeader(title: 'SECURITY'),
          const SizedBox(height: AppDimensions.sm),
          PecCard(
            child: _SettingsRow(
              icon: Icons.fingerprint,
              label: 'Biometric Unlock',
              trailing: _ComingSoonBadge(),
            ),
          ),
          const SizedBox(height: AppDimensions.lg),

          // About
          _SectionHeader(title: 'ABOUT'),
          const SizedBox(height: AppDimensions.sm),
          PecCard(
            child: Column(
              children: [
                _SettingsRow(
                  icon: Icons.info_outline,
                  label: 'App Version',
                  trailing: Text(
                    _version.isNotEmpty
                        ? '$_version ($_buildNumber)'
                        : '—',
                    style: AppTextStyles.bodySmall
                        .copyWith(color: AppColors.textSecondary),
                  ),
                ),
                _Divider(),
                _SettingsRow(
                  icon: Icons.school_outlined,
                  label: 'Punjab Engineering College',
                  trailing: Text(
                    'Chandigarh',
                    style: AppTextStyles.bodySmall
                        .copyWith(color: AppColors.textSecondary),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppDimensions.xxl),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(width: 4, height: 20, color: AppColors.yellow),
        const SizedBox(width: AppDimensions.sm),
        Text(title, style: AppTextStyles.labelLarge),
      ],
    );
  }
}

class _SettingsRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final Widget trailing;
  const _SettingsRow(
      {required this.icon, required this.label, required this.trailing});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, color: AppColors.yellow, size: 20),
        const SizedBox(width: AppDimensions.md),
        Expanded(
            child: Text(label, style: AppTextStyles.bodyMedium)),
        trailing,
      ],
    );
  }
}

class _Divider extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppDimensions.sm),
      child: Divider(
          height: 1,
          color: AppColors.white.withValues(alpha: 0.1)),
    );
  }
}

class _ComingSoonBadge extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: AppColors.yellow.withValues(alpha: 0.15),
        border: Border.all(color: AppColors.yellow, width: 1),
      ),
      child: Text('SOON',
          style: AppTextStyles.caption.copyWith(color: AppColors.yellow)),
    );
  }
}
