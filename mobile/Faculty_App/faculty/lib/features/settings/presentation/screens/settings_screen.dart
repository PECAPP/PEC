import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:package_info_plus/package_info_plus.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/providers/theme_provider.dart';
import '../../../../shared/widgets/faculty_card.dart';
import '../../../../shared/widgets/faculty_top_nav_bar.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  String _version = '';

  @override
  void initState() {
    super.initState();
    PackageInfo.fromPlatform().then((info) {
      if (mounted) setState(() => _version = '${info.version} (${info.buildNumber})');
    });
  }

  @override
  Widget build(BuildContext context) {
    final themeMode = ref.watch(themeModeProvider);

    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: const FacultyTopNavBar(),
      body: ListView(
        padding: const EdgeInsets.all(AppDimensions.md),
        children: [
          _SectionLabel('APPEARANCE'),
          const SizedBox(height: AppDimensions.sm),
          FacultyCard(
            child: Column(
              children: [
                _SettingsRow(
                  icon: Icons.dark_mode_outlined,
                  label: 'Dark Mode',
                  trailing: Switch(
                    value: themeMode == ThemeMode.dark,
                    onChanged: (_) => ref.read(themeModeProvider.notifier).toggle(),
                    activeThumbColor: AppColors.gold,
                  ),
                ),
                Divider(color: AppColors.borderDark, height: 1),
                _SettingsRow(
                  icon: Icons.phone_android_outlined,
                  label: 'Use System Theme',
                  trailing: Switch(
                    value: themeMode == ThemeMode.system,
                    onChanged: (val) => ref.read(themeModeProvider.notifier)
                        .setTheme(val ? ThemeMode.system : ThemeMode.dark),
                    activeThumbColor: AppColors.gold,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppDimensions.lg),

          _SectionLabel('ABOUT'),
          const SizedBox(height: AppDimensions.sm),
          FacultyCard(
            child: Column(
              children: [
                _SettingsRow(
                  icon: Icons.info_outline,
                  label: 'App Version',
                  trailing: Text(_version.isNotEmpty ? _version : '—',
                      style: AppTextStyles.bodySmall),
                ),
                Divider(color: AppColors.borderDark, height: 1),
                _SettingsRow(
                  icon: Icons.school_outlined,
                  label: 'PEC Faculty App',
                  trailing: Text('Chandigarh', style: AppTextStyles.bodySmall),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  final String title;
  const _SectionLabel(this.title);

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(width: 3, height: 16, color: AppColors.gold),
        const SizedBox(width: 8),
        Text(title, style: AppTextStyles.labelSmall.copyWith(letterSpacing: 1.5)),
      ],
    );
  }
}

class _SettingsRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final Widget trailing;
  const _SettingsRow({required this.icon, required this.label, required this.trailing});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(icon, color: AppColors.gold, size: 20),
          const SizedBox(width: AppDimensions.md),
          Expanded(child: Text(label, style: AppTextStyles.bodyMedium)),
          trailing,
        ],
      ),
    );
  }
}
