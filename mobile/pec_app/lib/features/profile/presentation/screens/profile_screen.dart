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
import '../../../auth/presentation/providers/auth_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  void _shareProfile(BuildContext context, String name, String role, String campus) {
    final text = 'Name: $name\nRole: $role\nCampus: $campus';
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Profile ready to share:\n$text')),
    );
  }

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

    final role = user.primaryRole.displayName;
    final campus = (user.department ?? '').trim().isNotEmpty
        ? user.department!.trim()
        : 'Institutional Campus';
    final displayName = user.name.trim().isNotEmpty ? user.name.trim() : 'User';

    return Scaffold(
      appBar: AppBar(
        title: const Text('PROFILE'),
      ),
      body: _ProfileModernLayout(
        name: displayName,
        role: role,
        campus: campus,
        email: user.email,
        phone: user.phone ?? 'N/A',
        avatarUrl: user.avatarUrl,
        onEdit: () => _showEditSheet(context, ref),
        onShare: () => _shareProfile(context, displayName, role, campus),
        onDownloadCv: () => context.push('/resume'),
        onLogout: () async {
          await ref.read(authNotifierProvider.notifier).signOut();
        },
      ),
    );
  }
}

class _ProfileModernLayout extends StatelessWidget {
  final String name;
  final String role;
  final String campus;
  final String email;
  final String phone;
  final String? avatarUrl;
  final VoidCallback onEdit;
  final VoidCallback onShare;
  final VoidCallback onDownloadCv;
  final Future<void> Function() onLogout;

  const _ProfileModernLayout({
    required this.name,
    required this.role,
    required this.campus,
    required this.email,
    required this.phone,
    required this.avatarUrl,
    required this.onEdit,
    required this.onShare,
    required this.onDownloadCv,
    required this.onLogout,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFF17120A),
            Color(0xFF231B0D),
            Color(0xFF151109),
          ],
        ),
      ),
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(AppDimensions.md),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 1280),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _TopIdentityBar(
                  role: role,
                  campus: campus,
                  avatarUrl: avatarUrl,
                  onEdit: onEdit,
                  onShare: onShare,
                ),
                const SizedBox(height: AppDimensions.lg),
                const Divider(color: Color(0x33FACC15), height: 1),
                const SizedBox(height: AppDimensions.lg),
                LayoutBuilder(
                  builder: (context, constraints) {
                    final wide = constraints.maxWidth >= 980;

                    if (wide) {
                      return Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          SizedBox(
                            width: 360,
                            child: _ContactCard(email: email, phone: phone),
                          ),
                          const SizedBox(width: AppDimensions.lg),
                          Expanded(
                            child: _ProfileMainColumn(
                              onDownloadCv: onDownloadCv,
                              onLogout: onLogout,
                            ),
                          ),
                        ],
                      );
                    }

                    return Column(
                      children: [
                        _ContactCard(email: email, phone: phone),
                        const SizedBox(height: AppDimensions.lg),
                        _ProfileMainColumn(
                          onDownloadCv: onDownloadCv,
                          onLogout: onLogout,
                        ),
                      ],
                    );
                  },
                ),
                const SizedBox(height: AppDimensions.xl),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _TopIdentityBar extends StatelessWidget {
  final String role;
  final String campus;
  final String? avatarUrl;
  final VoidCallback onEdit;
  final VoidCallback onShare;

  const _TopIdentityBar({
    required this.role,
    required this.campus,
    required this.avatarUrl,
    required this.onEdit,
    required this.onShare,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final compact = constraints.maxWidth < 760;

        return Column(
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Container(
                  width: compact ? 92 : 132,
                  height: compact ? 92 : 132,
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: AppColors.yellow.withValues(alpha: 0.4)),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: Container(
                      color: AppColors.yellow,
                      child: avatarUrl != null && avatarUrl!.isNotEmpty
                          ? Image.network(avatarUrl!, fit: BoxFit.cover)
                          : const Icon(Icons.person, color: AppColors.black, size: 52),
                    ),
                  ),
                ),
                const SizedBox(width: AppDimensions.lg),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: const Color(0xFF2A2418),
                          borderRadius: BorderRadius.circular(5),
                          border: Border.all(color: AppColors.yellow.withValues(alpha: 0.25)),
                        ),
                        child: Text(
                          '• $role',
                          style: AppTextStyles.labelLarge.copyWith(
                            color: AppColors.yellow,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                      const SizedBox(height: AppDimensions.sm),
                      Row(
                        children: [
                          Icon(Icons.location_on_outlined,
                              color: AppColors.yellow.withValues(alpha: 0.9), size: 19),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              campus,
                              style: AppTextStyles.bodyLarge
                                  .copyWith(color: AppColors.white.withValues(alpha: 0.7)),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: AppDimensions.md),
                if (!compact)
                  Row(
                    children: [
                      _ActionBtn(label: 'Edit Profile', filled: false, onTap: onEdit),
                      const SizedBox(width: AppDimensions.sm),
                      _ActionBtn(label: 'Share Profile', filled: true, onTap: onShare),
                    ],
                  ),
              ],
            ),
            if (compact) ...[
              const SizedBox(height: AppDimensions.md),
              Row(
                children: [
                  Expanded(
                    child: _ActionBtn(label: 'Edit Profile', filled: false, onTap: onEdit),
                  ),
                  const SizedBox(width: AppDimensions.sm),
                  Expanded(
                    child: _ActionBtn(label: 'Share Profile', filled: true, onTap: onShare),
                  ),
                ],
              ),
            ],
          ],
        );
      },
    );
  }
}

class _ActionBtn extends StatelessWidget {
  final String label;
  final bool filled;
  final VoidCallback onTap;
  const _ActionBtn({required this.label, required this.filled, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(6),
      child: Container(
        height: 42,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        decoration: BoxDecoration(
          color: filled ? AppColors.yellow : const Color(0xFF161616),
          borderRadius: BorderRadius.circular(6),
          border: Border.all(color: AppColors.yellow.withValues(alpha: 0.35)),
        ),
        child: Center(
          child: Text(
            label,
            style: AppTextStyles.labelLarge.copyWith(
              color: filled ? AppColors.black : AppColors.yellow,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ),
    );
  }
}

class _ContactCard extends StatelessWidget {
  final String email;
  final String phone;
  const _ContactCard({required this.email, required this.phone});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppDimensions.lg),
      decoration: BoxDecoration(
        color: const Color(0xFF1F1B14),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: AppColors.yellow.withValues(alpha: 0.18)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Contact Information', style: AppTextStyles.heading3.copyWith(color: AppColors.white)),
          const SizedBox(height: AppDimensions.sm),
          const Divider(color: Color(0x33FACC15), height: 1),
          const SizedBox(height: AppDimensions.md),
          _IconTextLine(icon: Icons.email_outlined, label: 'Email', value: email),
          const SizedBox(height: AppDimensions.md),
          _IconTextLine(icon: Icons.phone_outlined, label: 'Phone', value: phone),
          const SizedBox(height: AppDimensions.lg),
          Text('Professional Links', style: AppTextStyles.heading3.copyWith(color: AppColors.white, fontSize: 28 / 2)),
          const SizedBox(height: AppDimensions.sm),
          const Divider(color: Color(0x33FACC15), height: 1),
          const SizedBox(height: AppDimensions.md),
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: const Color(0xFF161616),
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: AppColors.yellow.withValues(alpha: 0.24)),
            ),
            child: Icon(Icons.qr_code_2, size: 18, color: AppColors.white.withValues(alpha: 0.75)),
          ),
          const SizedBox(height: 120),
        ],
      ),
    );
  }
}

class _IconTextLine extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const _IconTextLine({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 18, color: AppColors.white.withValues(alpha: 0.62)),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: AppTextStyles.bodySmall.copyWith(color: AppColors.white.withValues(alpha: 0.7))),
              const SizedBox(height: 2),
              Text(value.isEmpty ? 'N/A' : value,
                  style: AppTextStyles.labelLarge.copyWith(color: AppColors.white, fontWeight: FontWeight.w700)),
            ],
          ),
        ),
      ],
    );
  }
}

class _ProfileMainColumn extends StatefulWidget {
  final VoidCallback onDownloadCv;
  final Future<void> Function() onLogout;

  const _ProfileMainColumn({required this.onDownloadCv, required this.onLogout});

  @override
  State<_ProfileMainColumn> createState() => _ProfileMainColumnState();
}

class _ProfileMainColumnState extends State<_ProfileMainColumn> {
  int _tabIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _MetricGrid(),
        const SizedBox(height: AppDimensions.md),
        _TabsBar(
          selectedIndex: _tabIndex,
          onTabSelected: (i) => setState(() => _tabIndex = i),
        ),
        const SizedBox(height: AppDimensions.lg),
        _ProfileTabContent(
          tabIndex: _tabIndex,
          onDownloadCv: widget.onDownloadCv,
        ),
        const SizedBox(height: AppDimensions.md),
        SizedBox(
          width: 190,
          child: PecButton(
            label: 'LOG OUT',
            onPressed: () async => widget.onLogout(),
            color: AppColors.red,
            textColor: AppColors.white,
            prefixIcon: Icons.logout,
            fullWidth: true,
          ),
        ),
      ],
    );
  }
}

class _MetricGrid extends StatelessWidget {
  final List<(String, String)> data = const [
    ('CGPA', 'N/A'),
    ('Attend.', 'N/A'),
    ('Perf.', 'N/A'),
    ('Rank', 'N/A'),
  ];

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final count = constraints.maxWidth < 640 ? 2 : 4;
        return GridView.builder(
          itemCount: data.length,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: count,
            mainAxisSpacing: AppDimensions.sm,
            crossAxisSpacing: AppDimensions.sm,
            childAspectRatio: 2.15,
          ),
          itemBuilder: (_, i) => Container(
            decoration: BoxDecoration(
              color: const Color(0xFF1F1B14),
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: AppColors.yellow.withValues(alpha: 0.16)),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(data[i].$1,
                    style: AppTextStyles.labelSmall.copyWith(color: AppColors.white.withValues(alpha: 0.55))),
                const SizedBox(height: 4),
                Text(data[i].$2,
                    style: AppTextStyles.heading1.copyWith(color: AppColors.white, fontSize: 52 / 2)),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _TabsBar extends StatelessWidget {
  final int selectedIndex;
  final ValueChanged<int> onTabSelected;

  const _TabsBar({
    required this.selectedIndex,
    required this.onTabSelected,
  });

  @override
  Widget build(BuildContext context) {
    final tabs = ['Overview', 'Academic', 'Projects', 'Achievements'];
    return Wrap(
      spacing: 24,
      runSpacing: 8,
      children: tabs
          .asMap()
          .entries
          .map(
            (e) => InkWell(
              onTap: () => onTabSelected(e.key),
              child: Text(
                e.value,
                style: AppTextStyles.labelLarge.copyWith(
                  color: e.key == selectedIndex
                      ? AppColors.white
                      : AppColors.white.withValues(alpha: 0.5),
                  decoration:
                      e.key == selectedIndex ? TextDecoration.underline : TextDecoration.none,
                  decorationColor: AppColors.white,
                  decorationThickness: 2,
                ),
              ),
            ),
          )
          .toList(),
    );
  }
}

class _ProfileTabContent extends StatelessWidget {
  final int tabIndex;
  final VoidCallback onDownloadCv;

  const _ProfileTabContent({
    required this.tabIndex,
    required this.onDownloadCv,
  });

  @override
  Widget build(BuildContext context) {
    switch (tabIndex) {
      case 0:
        return Column(
          children: [
            _TechnicalExpertiseCard(),
            const SizedBox(height: AppDimensions.lg),
            _CvCard(onDownload: onDownloadCv),
          ],
        );
      case 1:
        return const _AcademicSection();
      case 2:
        return const _ProjectsSection();
      case 3:
        return const _AchievementsSection();
      default:
        return const SizedBox.shrink();
    }
  }
}

class _AcademicSection extends StatelessWidget {
  const _AcademicSection();

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Academic Overview',
          style: AppTextStyles.heading1.copyWith(color: AppColors.white, fontSize: 48 / 2),
        ),
        const SizedBox(height: AppDimensions.md),
        LayoutBuilder(
          builder: (context, constraints) {
            final count = constraints.maxWidth < 760 ? 2 : 4;
            final cards = const [
              ('Current Semester', 'N/A'),
              ('Credits Earned', 'N/A'),
              ('Backlogs', '0'),
              ('Attendance', 'N/A'),
            ];
            return GridView.builder(
              itemCount: cards.length,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: count,
                mainAxisSpacing: AppDimensions.sm,
                crossAxisSpacing: AppDimensions.sm,
                childAspectRatio: 2.2,
              ),
              itemBuilder: (_, i) => Container(
                padding: const EdgeInsets.all(AppDimensions.md),
                decoration: BoxDecoration(
                  color: const Color(0xFF1F1B14),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: AppColors.yellow.withValues(alpha: 0.16)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      cards[i].$1,
                      style: AppTextStyles.bodySmall
                          .copyWith(color: AppColors.white.withValues(alpha: 0.62)),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      cards[i].$2,
                      style: AppTextStyles.heading3.copyWith(color: AppColors.white),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ],
    );
  }
}

class _ProjectsSection extends StatelessWidget {
  const _ProjectsSection();

  @override
  Widget build(BuildContext context) {
    final projects = const [
      ('PEC ERP Mobile App', 'Flutter · UI/UX · API Integration'),
      ('Campus Event Tracker', 'Dart · Firebase · Notifications'),
      ('Department Resource Portal', 'Full Stack · Internal Tooling'),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Projects',
          style: AppTextStyles.heading1.copyWith(color: AppColors.white, fontSize: 48 / 2),
        ),
        const SizedBox(height: AppDimensions.md),
        ...projects.map(
          (p) => Container(
            width: double.infinity,
            margin: const EdgeInsets.only(bottom: AppDimensions.sm),
            padding: const EdgeInsets.all(AppDimensions.md),
            decoration: BoxDecoration(
              color: const Color(0xFF1F1B14),
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: AppColors.yellow.withValues(alpha: 0.16)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  p.$1,
                  style: AppTextStyles.heading3.copyWith(color: AppColors.white),
                ),
                const SizedBox(height: 4),
                Text(
                  p.$2,
                  style: AppTextStyles.bodyMedium
                      .copyWith(color: AppColors.white.withValues(alpha: 0.68)),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _AchievementsSection extends StatelessWidget {
  const _AchievementsSection();

  @override
  Widget build(BuildContext context) {
    final achievements = const [
      'Top 10% in semester exams',
      'Winner - Department Hackathon',
      'Campus ambassador for technical club',
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Achievements',
          style: AppTextStyles.heading1.copyWith(color: AppColors.white, fontSize: 48 / 2),
        ),
        const SizedBox(height: AppDimensions.md),
        ...achievements.map(
          (a) => Container(
            width: double.infinity,
            margin: const EdgeInsets.only(bottom: AppDimensions.sm),
            padding: const EdgeInsets.all(AppDimensions.md),
            decoration: BoxDecoration(
              color: const Color(0xFF1F1B14),
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: AppColors.yellow.withValues(alpha: 0.16)),
            ),
            child: Row(
              children: [
                Icon(Icons.workspace_premium_outlined,
                    color: AppColors.yellow.withValues(alpha: 0.95), size: 20),
                const SizedBox(width: AppDimensions.sm),
                Expanded(
                  child: Text(
                    a,
                    style: AppTextStyles.bodyLarge.copyWith(color: AppColors.white),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _TechnicalExpertiseCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                'Technical Expertise',
                style: AppTextStyles.heading1.copyWith(color: AppColors.white, fontSize: 52 / 2),
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFF201D16),
                borderRadius: BorderRadius.circular(5),
                border: Border.all(color: AppColors.yellow.withValues(alpha: 0.22)),
              ),
              child: Text('VERIFIED',
                  style: AppTextStyles.labelSmall.copyWith(
                    color: AppColors.white.withValues(alpha: 0.9),
                    fontSize: 11,
                  )),
            ),
          ],
        ),
        const SizedBox(height: AppDimensions.md),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 28, horizontal: 18),
          decoration: BoxDecoration(
            color: const Color(0xFF1F1B14),
            borderRadius: BorderRadius.circular(6),
            border: Border.all(color: AppColors.yellow.withValues(alpha: 0.16)),
          ),
          child: Text(
            'No expertise metrics recorded.',
            textAlign: TextAlign.center,
            style: AppTextStyles.bodyLarge.copyWith(color: AppColors.white.withValues(alpha: 0.62)),
          ),
        ),
      ],
    );
  }
}

class _CvCard extends StatelessWidget {
  final VoidCallback onDownload;
  const _CvCard({required this.onDownload});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppDimensions.lg),
      decoration: BoxDecoration(
        color: const Color(0xFF1F1B14),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: AppColors.yellow.withValues(alpha: 0.16)),
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final compact = constraints.maxWidth < 700;
          if (compact) {
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Academic Profile Document',
                    style: AppTextStyles.heading3.copyWith(color: AppColors.white)),
                const SizedBox(height: 4),
                Text('Download the verified academic and professional summary.',
                    style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.white.withValues(alpha: 0.62))),
                const SizedBox(height: AppDimensions.md),
                SizedBox(
                  width: double.infinity,
                  child: _DownloadBtn(onTap: onDownload),
                ),
              ],
            );
          }

          return Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Academic Profile Document',
                        style: AppTextStyles.heading3.copyWith(color: AppColors.white)),
                    const SizedBox(height: 4),
                    Text('Download the verified academic and professional summary of your profile.',
                        style: AppTextStyles.bodySmall.copyWith(
                            color: AppColors.white.withValues(alpha: 0.62))),
                  ],
                ),
              ),
              const SizedBox(width: AppDimensions.md),
              _DownloadBtn(onTap: onDownload),
            ],
          );
        },
      ),
    );
  }
}

class _DownloadBtn extends StatelessWidget {
  final VoidCallback onTap;
  const _DownloadBtn({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(6),
      child: Container(
        height: 46,
        padding: const EdgeInsets.symmetric(horizontal: 22),
        decoration: BoxDecoration(
          color: AppColors.yellow,
          borderRadius: BorderRadius.circular(6),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.download_rounded, color: AppColors.black, size: 18),
            const SizedBox(width: 10),
            Text(
              'DOWNLOAD CV',
              style: AppTextStyles.labelLarge.copyWith(
                color: AppColors.black,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
      ),
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
