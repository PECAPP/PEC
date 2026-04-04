import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../../../core/api/api_endpoints.dart';
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

  void _showEditSheet(BuildContext context, WidgetRef ref) {
    final user = ref.read(authNotifierProvider).user;
    if (user == null) return;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _EditProfileSheet(
        initialName: user.name,
        initialPhone: user.phone ?? '',
        onSave: (name, phone, avatarPath) async {
          final client = ref.read(apiClientProvider);
          final parts = name.trim().split(' ');
          await client.dio.patch(ApiEndpoints.me, data: {
            'firstName': parts.isNotEmpty ? parts.first : '',
            'lastName': parts.length > 1 ? parts.skip(1).join(' ') : '',
            if (phone.trim().isNotEmpty) 'phone': phone.trim(),
          });
          if (avatarPath != null) {
            await client.dio.post(ApiEndpoints.meAvatar,
                data: {'avatarPath': avatarPath});
          }
          await ref.read(authNotifierProvider.notifier).refreshUser();
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authNotifierProvider).user;
    if (user == null) return const SizedBox.shrink();

    return Scaffold(
      appBar: AppBar(
        title: const Text('PROFILE'),
        actions: [
          TextButton(
            onPressed: () => _showEditSheet(context, ref),
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

class _EditProfileSheet extends StatefulWidget {
  final String initialName;
  final String initialPhone;
  final Future<void> Function(String name, String phone, String? avatarPath)
      onSave;

  const _EditProfileSheet({
    required this.initialName,
    required this.initialPhone,
    required this.onSave,
  });

  @override
  State<_EditProfileSheet> createState() => _EditProfileSheetState();
}

class _EditProfileSheetState extends State<_EditProfileSheet> {
  late final TextEditingController _nameCtrl;
  late final TextEditingController _phoneCtrl;
  String? _avatarPath;
  bool _saving = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _nameCtrl = TextEditingController(text: widget.initialName);
    _phoneCtrl = TextEditingController(text: widget.initialPhone);
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _phoneCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickAvatar() async {
    final picker = ImagePicker();
    final file =
        await picker.pickImage(source: ImageSource.gallery, imageQuality: 80);
    if (file != null) setState(() => _avatarPath = file.path);
  }

  Future<void> _save() async {
    if (_nameCtrl.text.trim().isEmpty) {
      setState(() => _error = 'Name is required');
      return;
    }
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      await widget.onSave(
          _nameCtrl.text.trim(), _phoneCtrl.text.trim(), _avatarPath);
      if (mounted) Navigator.pop(context);
    } catch (e) {
      setState(() {
        _saving = false;
        _error = 'Save failed: $e';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottom = MediaQuery.of(context).viewInsets.bottom;
    const inputStyle = InputDecorationTheme(
      border: OutlineInputBorder(
          borderSide: BorderSide(color: AppColors.white, width: 1.5)),
      enabledBorder: OutlineInputBorder(
          borderSide: BorderSide(color: AppColors.white, width: 1.5)),
      focusedBorder: OutlineInputBorder(
          borderSide: BorderSide(color: AppColors.yellow, width: 2)),
      labelStyle: TextStyle(color: AppColors.white),
    );

    return Container(
      margin: const EdgeInsets.all(AppDimensions.md),
      padding: EdgeInsets.fromLTRB(AppDimensions.lg, AppDimensions.lg,
          AppDimensions.lg, AppDimensions.lg + bottom),
      decoration: BoxDecoration(
        color: AppColors.surface,
        border: Border.all(color: AppColors.black, width: 2),
        boxShadow: const [BoxShadow(offset: Offset(4, 4))],
      ),
      child: SingleChildScrollView(
        child: Theme(
          data: ThemeData.dark().copyWith(inputDecorationTheme: inputStyle),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('EDIT PROFILE', style: AppTextStyles.heading3),
              const SizedBox(height: AppDimensions.lg),

              // Avatar picker
              Center(
                child: GestureDetector(
                  onTap: _pickAvatar,
                  child: Stack(
                    children: [
                      _avatarPath != null
                          ? CircleAvatar(
                              radius: 48,
                              backgroundImage: NetworkImage(_avatarPath!),
                            )
                          : PecAvatar(name: _nameCtrl.text, size: 96),
                      Positioned(
                        bottom: 0,
                        right: 0,
                        child: Container(
                          width: 28,
                          height: 28,
                          decoration: const BoxDecoration(
                            color: AppColors.yellow,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.camera_alt_outlined,
                              color: AppColors.black, size: 14),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: AppDimensions.lg),

              TextField(
                controller: _nameCtrl,
                style:
                    AppTextStyles.bodyMedium.copyWith(color: AppColors.white),
                decoration: const InputDecoration(labelText: 'Full Name *'),
              ),
              const SizedBox(height: AppDimensions.md),
              TextField(
                controller: _phoneCtrl,
                keyboardType: TextInputType.phone,
                style:
                    AppTextStyles.bodyMedium.copyWith(color: AppColors.white),
                decoration: const InputDecoration(labelText: 'Phone Number'),
              ),

              if (_error != null) ...[
                const SizedBox(height: AppDimensions.sm),
                Text(_error!,
                    style: AppTextStyles.bodySmall
                        .copyWith(color: AppColors.red)),
              ],
              const SizedBox(height: AppDimensions.lg),
              PecButton(
                label: 'SAVE',
                onPressed: _saving ? null : _save,
                isLoading: _saving,
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
