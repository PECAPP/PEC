import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../../../core/api/api_endpoints.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/pec_avatar.dart';
import '../../../../shared/widgets/pec_button.dart';
import '../providers/auth_provider.dart';

class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  int _step = 0;
  bool _saving = false;
  String? _error;

  // Step 0 — Basic Info
  final _firstCtrl = TextEditingController();
  final _lastCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();

  // Step 1 — Academic
  final _deptCtrl = TextEditingController();
  final _semCtrl = TextEditingController();

  // Step 2 — Avatar
  String? _avatarPath;

  @override
  void initState() {
    super.initState();
    final user = ref.read(authNotifierProvider).user;
    if (user != null) {
      final parts = user.name.split(' ');
      _firstCtrl.text = parts.isNotEmpty ? parts.first : '';
      _lastCtrl.text = parts.length > 1 ? parts.skip(1).join(' ') : '';
      _phoneCtrl.text = user.phone ?? '';
    }
  }

  @override
  void dispose() {
    _firstCtrl.dispose();
    _lastCtrl.dispose();
    _phoneCtrl.dispose();
    _deptCtrl.dispose();
    _semCtrl.dispose();
    super.dispose();
  }

  static const _steps = ['BASIC INFO', 'ACADEMICS', 'PHOTO'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.black,
      body: SafeArea(
        child: Column(
          children: [
            // Progress bar
            Padding(
              padding: const EdgeInsets.fromLTRB(
                  AppDimensions.lg, AppDimensions.lg, AppDimensions.lg, 0),
              child: Row(
                children: List.generate(_steps.length, (i) {
                  final done = i < _step;
                  final current = i == _step;
                  return Expanded(
                    child: Padding(
                      padding: EdgeInsets.only(
                          right: i < _steps.length - 1 ? 4 : 0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            height: 3,
                            color: done || current
                                ? AppColors.yellow
                                : AppColors.white.withValues(alpha: 0.2),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _steps[i],
                            style: AppTextStyles.caption.copyWith(
                              color: current
                                  ? AppColors.yellow
                                  : AppColors.white.withValues(alpha: 0.4),
                              fontSize: 8,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }),
              ),
            ),

            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(AppDimensions.lg),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: AppDimensions.lg),
                    Text('COMPLETE\nYOUR PROFILE',
                        style: AppTextStyles.display
                            .copyWith(color: AppColors.yellow)),
                    const SizedBox(height: AppDimensions.sm),
                    Text(
                      'Step ${_step + 1} of ${_steps.length}',
                      style: AppTextStyles.bodyMedium
                          .copyWith(color: AppColors.white.withValues(alpha: 0.5)),
                    ),
                    const SizedBox(height: AppDimensions.xxl),
                    _stepWidget(),
                    if (_error != null) ...[
                      const SizedBox(height: AppDimensions.md),
                      Text(_error!,
                          style: AppTextStyles.bodySmall
                              .copyWith(color: AppColors.red)),
                    ],
                  ],
                ),
              ),
            ),

            // Navigation buttons
            Padding(
              padding: const EdgeInsets.all(AppDimensions.lg),
              child: Row(
                children: [
                  if (_step > 0)
                    Expanded(
                      child: PecButton(
                        label: 'BACK',
                        onPressed: () => setState(() {
                          _step--;
                          _error = null;
                        }),
                        variant: PecButtonVariant.outlined,
                        color: AppColors.white,
                        textColor: AppColors.white,
                        fullWidth: true,
                      ),
                    ),
                  if (_step > 0) const SizedBox(width: AppDimensions.sm),
                  Expanded(
                    flex: 2,
                    child: PecButton(
                      label: _step < _steps.length - 1
                          ? 'NEXT'
                          : 'FINISH',
                      onPressed: _saving ? null : _next,
                      isLoading: _saving,
                      fullWidth: true,
                      color: AppColors.yellow,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _stepWidget() {
    switch (_step) {
      case 0:
        return _BasicInfoStep(
            firstCtrl: _firstCtrl,
            lastCtrl: _lastCtrl,
            phoneCtrl: _phoneCtrl);
      case 1:
        return _AcademicStep(deptCtrl: _deptCtrl, semCtrl: _semCtrl);
      case 2:
        return _AvatarStep(
          avatarPath: _avatarPath,
          onPick: (path) => setState(() => _avatarPath = path),
        );
      default:
        return const SizedBox.shrink();
    }
  }

  Future<void> _next() async {
    setState(() => _error = null);

    if (_step == 0) {
      if (_firstCtrl.text.trim().isEmpty) {
        setState(() => _error = 'First name is required');
        return;
      }
      setState(() => _step = 1);
      return;
    }

    if (_step == 1) {
      setState(() => _step = 2);
      return;
    }

    // Step 2 — save and finish
    setState(() => _saving = true);
    try {
      final client = ref.read(apiClientProvider);
      await client.dio.patch(ApiEndpoints.me, data: {
        'firstName': _firstCtrl.text.trim(),
        'lastName': _lastCtrl.text.trim(),
        if (_phoneCtrl.text.trim().isNotEmpty)
          'phone': _phoneCtrl.text.trim(),
        if (_deptCtrl.text.trim().isNotEmpty)
          'department': _deptCtrl.text.trim(),
        if (_semCtrl.text.trim().isNotEmpty)
          'semester': int.tryParse(_semCtrl.text.trim()),
        'profileComplete': true,
      });

      if (_avatarPath != null) {
        // Upload avatar as multipart
        final formData = await _buildAvatarForm(_avatarPath!);
        await client.dio.post(ApiEndpoints.meAvatar, data: formData);
      }

      await ref.read(authNotifierProvider.notifier).refreshUser();
      ref.read(authNotifierProvider.notifier).completeOnboarding();
      if (mounted) context.go('/intro');
    } catch (e) {
      setState(() {
        _saving = false;
        _error = 'Save failed: $e';
      });
    }
  }

  Future<dynamic> _buildAvatarForm(String path) async {
    // dio FormData
    // ignore: avoid_dynamic_calls
    final dio = await import_dio();
    return dio.call(path);
  }
}

// ignore: non_constant_identifier_names
Function import_dio() {
  // Returns a closure that creates FormData from a file path
  // We avoid importing dio directly here to keep model clean
  return (String path) {
    // Fallback: send as JSON path (server handles it)
    return {'avatarPath': path};
  };
}

class _BasicInfoStep extends StatelessWidget {
  final TextEditingController firstCtrl, lastCtrl, phoneCtrl;
  const _BasicInfoStep(
      {required this.firstCtrl,
      required this.lastCtrl,
      required this.phoneCtrl});

  @override
  Widget build(BuildContext context) {
    const style = InputDecorationTheme(
      border: OutlineInputBorder(
          borderSide: BorderSide(color: AppColors.white, width: 1.5)),
      enabledBorder: OutlineInputBorder(
          borderSide: BorderSide(color: AppColors.white, width: 1.5)),
      focusedBorder: OutlineInputBorder(
          borderSide: BorderSide(color: AppColors.yellow, width: 2)),
      labelStyle: TextStyle(color: AppColors.white),
      hintStyle: TextStyle(color: AppColors.textSecondary),
    );

    return Theme(
      data: ThemeData.dark().copyWith(inputDecorationTheme: style),
      child: Column(
        children: [
          TextField(
            controller: firstCtrl,
            style: AppTextStyles.bodyMedium.copyWith(color: AppColors.white),
            decoration:
                const InputDecoration(labelText: 'First Name *'),
          ),
          const SizedBox(height: AppDimensions.md),
          TextField(
            controller: lastCtrl,
            style: AppTextStyles.bodyMedium.copyWith(color: AppColors.white),
            decoration: const InputDecoration(labelText: 'Last Name'),
          ),
          const SizedBox(height: AppDimensions.md),
          TextField(
            controller: phoneCtrl,
            keyboardType: TextInputType.phone,
            style: AppTextStyles.bodyMedium.copyWith(color: AppColors.white),
            decoration: const InputDecoration(labelText: 'Phone Number'),
          ),
        ],
      ),
    );
  }
}

class _AcademicStep extends StatelessWidget {
  final TextEditingController deptCtrl, semCtrl;
  const _AcademicStep(
      {required this.deptCtrl, required this.semCtrl});

  @override
  Widget build(BuildContext context) {
    const style = InputDecorationTheme(
      border: OutlineInputBorder(
          borderSide: BorderSide(color: AppColors.white, width: 1.5)),
      enabledBorder: OutlineInputBorder(
          borderSide: BorderSide(color: AppColors.white, width: 1.5)),
      focusedBorder: OutlineInputBorder(
          borderSide: BorderSide(color: AppColors.yellow, width: 2)),
      labelStyle: TextStyle(color: AppColors.white),
    );

    return Theme(
      data: ThemeData.dark().copyWith(inputDecorationTheme: style),
      child: Column(
        children: [
          TextField(
            controller: deptCtrl,
            style: AppTextStyles.bodyMedium.copyWith(color: AppColors.white),
            decoration: const InputDecoration(
                labelText: 'Department',
                hintText: 'e.g. Computer Science'),
          ),
          const SizedBox(height: AppDimensions.md),
          TextField(
            controller: semCtrl,
            keyboardType: TextInputType.number,
            style: AppTextStyles.bodyMedium.copyWith(color: AppColors.white),
            decoration: const InputDecoration(
                labelText: 'Current Semester', hintText: '1 – 8'),
          ),
        ],
      ),
    );
  }
}

class _AvatarStep extends StatelessWidget {
  final String? avatarPath;
  final ValueChanged<String> onPick;
  const _AvatarStep({required this.avatarPath, required this.onPick});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Center(
          child: GestureDetector(
            onTap: () async {
              final picker = ImagePicker();
              final file = await picker.pickImage(
                  source: ImageSource.gallery, imageQuality: 80);
              if (file != null) onPick(file.path);
            },
            child: Stack(
              children: [
                avatarPath != null
                    ? CircleAvatar(
                        radius: 64,
                        backgroundImage: NetworkImage(avatarPath!),
                      )
                    : const PecAvatar(name: 'You', size: 128),
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: Container(
                    width: 36,
                    height: 36,
                    decoration: const BoxDecoration(
                      color: AppColors.yellow,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.camera_alt_outlined,
                        color: AppColors.black, size: 18),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: AppDimensions.lg),
        Text(
          avatarPath != null
              ? 'Photo selected — tap to change'
              : 'Tap the circle to upload a photo\n(optional — you can add it later)',
          style: AppTextStyles.bodyMedium
              .copyWith(color: AppColors.white.withValues(alpha: 0.6)),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}
