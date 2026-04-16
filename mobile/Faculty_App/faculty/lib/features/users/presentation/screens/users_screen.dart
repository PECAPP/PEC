import 'package:flutter/material.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/faculty_top_nav_bar.dart';

class UsersScreen extends StatefulWidget {
  const UsersScreen({super.key});

  @override
  State<UsersScreen> createState() => _UsersScreenState();
}

class _UsersScreenState extends State<UsersScreen> {
  static const _roles = ['All Roles', 'Student', 'Faculty', 'Admin'];

  final TextEditingController _searchCtrl = TextEditingController();
  String _selectedRole = _roles.first;

  final List<_UserRecord> _users = const [
    _UserRecord(name: 'Amara Hammes', email: 'amara_hammes2@pec.edu', role: 'Student', status: 'Active'),
    _UserRecord(name: 'Arjun Sharma', email: 'arjun@pec.edu', role: 'Student', status: 'Active'),
    _UserRecord(name: 'Dominick Rosenbaum', email: 'dominick_rosenbaum@pec.edu', role: 'Student', status: 'Active'),
    _UserRecord(name: 'Elvira Hirthe', email: 'elvira.hirthe@pec.edu', role: 'Student', status: 'Active'),
    _UserRecord(name: 'Kabir Mehta', email: 'kabir.mehta@pec.edu', role: 'Student', status: 'Active'),
    _UserRecord(name: 'Neha Bansal', email: 'neha.bansal@pec.edu', role: 'Student', status: 'Active'),
    _UserRecord(name: 'Riya Sethi', email: 'riya.sethi@pec.edu', role: 'Student', status: 'Active'),
    _UserRecord(name: 'Samar Verma', email: 'samar.verma@pec.edu', role: 'Student', status: 'Active'),
    _UserRecord(name: 'Isha Kapoor', email: 'isha.kapoor@pec.edu', role: 'Student', status: 'Active'),
    _UserRecord(name: 'Devansh Rao', email: 'devansh.rao@pec.edu', role: 'Student', status: 'Active'),
    _UserRecord(name: 'Yashika Gupta', email: 'yashika.gupta@pec.edu', role: 'Student', status: 'Active'),
    _UserRecord(name: 'Pranav Singh', email: 'pranav.singh@pec.edu', role: 'Student', status: 'Active'),
    _UserRecord(name: 'Tara Malhotra', email: 'tara.malhotra@pec.edu', role: 'Student', status: 'Active'),
    _UserRecord(name: 'Amanpreet Kaur', email: 'amanpreet.kaur@pec.edu', role: 'Student', status: 'Active'),
    _UserRecord(name: 'Nikhil Arora', email: 'nikhil.arora@pec.edu', role: 'Student', status: 'Active'),
    _UserRecord(name: 'Dr. Amit Kumar', email: 'faculty@pec.edu', role: 'Faculty', status: 'Active'),
    _UserRecord(name: 'Prof. Simran Gill', email: 'simran.gill@pec.edu', role: 'Faculty', status: 'Active'),
    _UserRecord(name: 'Prof. Raghav Malhotra', email: 'raghav.malhotra@pec.edu', role: 'Faculty', status: 'Active'),
  ];

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  List<_UserRecord> get _filteredUsers {
    final search = _searchCtrl.text.trim().toLowerCase();
    return _users.where((user) {
      final roleOk = _selectedRole == 'All Roles' || user.role == _selectedRole;
      final searchOk =
          search.isEmpty || user.name.toLowerCase().contains(search) || user.email.toLowerCase().contains(search);
      return roleOk && searchOk;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final totalUsers = _users.length;
    final students = _users.where((e) => e.role == 'Student').length;
    final faculty = _users.where((e) => e.role == 'Faculty').length;
    final admins = _users.where((e) => e.role == 'Admin').length;

    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: const FacultyTopNavBar(),
      body: LayoutBuilder(
        builder: (context, constraints) {
          final width = constraints.maxWidth;
          final isMobile = width < 700;
          final isTablet = width >= 700 && width < 1120;
          final cardWidth = isMobile
              ? width - (AppDimensions.md * 2)
              : isTablet
                  ? (width - (AppDimensions.md * 3)) / 2
                  : (width - (AppDimensions.md * 5)) / 4;

          return Padding(
            padding: const EdgeInsets.all(AppDimensions.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _UsersHeader(
                  isMobile: isMobile,
                  onExport: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Export started...')),
                    );
                  },
                ),
                const SizedBox(height: AppDimensions.md),
                Wrap(
                  spacing: AppDimensions.md,
                  runSpacing: AppDimensions.md,
                  children: [
                    _MetricCard(
                      width: cardWidth,
                      compact: isMobile,
                      title: 'TOTAL USERS',
                      value: '$totalUsers',
                      icon: Icons.group_outlined,
                      iconColor: AppColors.gold,
                      iconBg: AppColors.goldSubtle,
                    ),
                    _MetricCard(
                      width: cardWidth,
                      compact: isMobile,
                      title: 'STUDENTS',
                      value: '$students',
                      icon: Icons.shield_outlined,
                      iconColor: AppColors.success,
                      iconBg: AppColors.successBg,
                    ),
                    _MetricCard(
                      width: cardWidth,
                      compact: isMobile,
                      title: 'FACULTY',
                      value: '$faculty',
                      icon: Icons.verified_user_outlined,
                      iconColor: AppColors.gold,
                      iconBg: AppColors.warningBg,
                    ),
                    _MetricCard(
                      width: cardWidth,
                      compact: isMobile,
                      title: 'ADMINS',
                      value: '$admins',
                      icon: Icons.person_off_outlined,
                      iconColor: AppColors.error,
                      iconBg: AppColors.errorBg,
                    ),
                  ],
                ),
                const SizedBox(height: AppDimensions.md),
                if (isMobile)
                  Column(
                    children: [
                      _SearchField(
                        controller: _searchCtrl,
                        onChanged: (_) => setState(() {}),
                      ),
                      const SizedBox(height: AppDimensions.sm),
                      _RoleDropdown(
                        selectedRole: _selectedRole,
                        roles: _roles,
                        onChanged: (value) {
                          if (value == null) return;
                          setState(() => _selectedRole = value);
                        },
                      ),
                    ],
                  )
                else
                  Row(
                    children: [
                      Expanded(
                        child: _SearchField(
                          controller: _searchCtrl,
                          onChanged: (_) => setState(() {}),
                        ),
                      ),
                      const SizedBox(width: AppDimensions.md),
                      SizedBox(
                        width: 180,
                        child: _RoleDropdown(
                          selectedRole: _selectedRole,
                          roles: _roles,
                          onChanged: (value) {
                            if (value == null) return;
                            setState(() => _selectedRole = value);
                          },
                        ),
                      ),
                    ],
                  ),
                const SizedBox(height: AppDimensions.md),
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(
                      color: AppColors.cardDark.withValues(alpha: 0.6),
                      borderRadius: BorderRadius.circular(AppDimensions.borderRadiusLg),
                      border: Border.all(color: AppColors.borderDark),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(AppDimensions.borderRadiusLg),
                      child: isMobile
                          ? _UsersMobileList(users: _filteredUsers)
                          : _UsersTable(users: _filteredUsers),
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _UsersHeader extends StatelessWidget {
  final bool isMobile;
  final VoidCallback onExport;

  const _UsersHeader({required this.isMobile, required this.onExport});

  @override
  Widget build(BuildContext context) {
    final titleStyle = isMobile ? AppTextStyles.heading2 : AppTextStyles.heading1;

    if (isMobile) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('User Management', style: titleStyle),
          const SizedBox(height: 2),
          Text(
            'Manage institutional user accounts and access levels',
            style: AppTextStyles.bodySmall.copyWith(
              fontStyle: FontStyle.italic,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: AppDimensions.sm),
          SizedBox(
            width: double.infinity,
            child: _ExportButton(onPressed: onExport),
          ),
        ],
      );
    }

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('User Management', style: titleStyle),
              const SizedBox(height: 2),
              Text(
                'Manage institutional user accounts and access levels',
                style: AppTextStyles.bodySmall.copyWith(
                  fontStyle: FontStyle.italic,
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(width: AppDimensions.md),
        _ExportButton(onPressed: onExport),
      ],
    );
  }
}

class _ExportButton extends StatelessWidget {
  final VoidCallback onPressed;

  const _ExportButton({required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return OutlinedButton.icon(
      onPressed: onPressed,
      icon: const Icon(Icons.download_rounded, size: 16),
      label: Text('Export', style: AppTextStyles.labelLarge),
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.textPrimary,
        side: BorderSide(color: AppColors.borderDark),
        minimumSize: const Size(108, AppDimensions.controlHeight),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppDimensions.borderRadiusMd),
        ),
      ),
    );
  }
}

class _SearchField extends StatelessWidget {
  final TextEditingController controller;
  final ValueChanged<String> onChanged;

  const _SearchField({required this.controller, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: AppDimensions.controlHeight,
      decoration: BoxDecoration(
        color: AppColors.surfaceDark,
        borderRadius: BorderRadius.circular(AppDimensions.borderRadiusMd),
        border: Border.all(color: AppColors.borderDark),
      ),
      child: TextField(
        controller: controller,
        onChanged: onChanged,
        style: AppTextStyles.bodyMedium,
        decoration: InputDecoration(
          prefixIcon: const Icon(Icons.search_rounded, color: AppColors.textMuted),
          hintText: 'Search users...',
          hintStyle: AppTextStyles.bodyMedium.copyWith(color: AppColors.textMuted),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(vertical: 10),
        ),
      ),
    );
  }
}

class _RoleDropdown extends StatelessWidget {
  final String selectedRole;
  final List<String> roles;
  final ValueChanged<String?> onChanged;

  const _RoleDropdown({
    required this.selectedRole,
    required this.roles,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return DropdownButtonFormField<String>(
      initialValue: selectedRole,
      dropdownColor: AppColors.cardDark,
      style: AppTextStyles.labelLarge.copyWith(color: AppColors.textPrimary),
      iconEnabledColor: AppColors.textMuted,
      decoration: InputDecoration(
        filled: true,
        fillColor: AppColors.surfaceDark,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppDimensions.borderRadiusMd),
          borderSide: BorderSide(color: AppColors.borderDark),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppDimensions.borderRadiusMd),
          borderSide: BorderSide(color: AppColors.borderDark),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppDimensions.borderRadiusMd),
          borderSide: BorderSide(color: AppColors.gold.withValues(alpha: 0.6)),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      ),
      items: roles.map((r) => DropdownMenuItem<String>(value: r, child: Text(r))).toList(),
      onChanged: onChanged,
    );
  }
}

class _UsersMobileList extends StatelessWidget {
  final List<_UserRecord> users;

  const _UsersMobileList({required this.users});

  @override
  Widget build(BuildContext context) {
    if (users.isEmpty) {
      return Center(
        child: Text(
          'No users found for current filters.',
          style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textMuted),
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.all(AppDimensions.md),
      itemCount: users.length,
      separatorBuilder: (_, _) => const SizedBox(height: AppDimensions.sm),
      itemBuilder: (_, i) {
        final user = users[i];
        final roleColor = _roleColor(user.role);

        return Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.cardDark,
            borderRadius: BorderRadius.circular(AppDimensions.borderRadiusMd),
            border: Border.all(color: AppColors.borderDark),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(user.name, style: AppTextStyles.labelLarge),
              const SizedBox(height: 2),
              Text(
                user.email,
                style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary),
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: _Tag(
                      text: user.role.toUpperCase(),
                      textColor: roleColor,
                      background: roleColor.withValues(alpha: 0.14),
                      border: roleColor.withValues(alpha: 0.36),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _Tag(
                      text: user.status.toUpperCase(),
                      textColor: AppColors.success,
                      background: AppColors.successBg,
                      border: AppColors.success.withValues(alpha: 0.35),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}

class _UsersTable extends StatelessWidget {
  final List<_UserRecord> users;

  const _UsersTable({required this.users});

  @override
  Widget build(BuildContext context) {
    if (users.isEmpty) {
      return Center(
        child: Text(
          'No users found for current filters.',
          style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textMuted),
        ),
      );
    }

    return LayoutBuilder(
      builder: (context, constraints) {
        final tableWidth = constraints.maxWidth < 900 ? 900.0 : constraints.maxWidth;

        return SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: SizedBox(
            width: tableWidth,
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: AppDimensions.md, vertical: 14),
                  decoration: BoxDecoration(
                    color: AppColors.cardDark,
                    border: Border(bottom: BorderSide(color: AppColors.borderDark)),
                  ),
                  child: const Row(
                    children: [
                      _HeaderCell(flex: 26, text: 'NAME'),
                      _HeaderCell(flex: 28, text: 'EMAIL ADDRESS'),
                      _HeaderCell(flex: 14, text: 'ROLE'),
                      _HeaderCell(flex: 14, text: 'STATUS'),
                      _HeaderCell(flex: 18, text: 'ACTIONS', alignEnd: true),
                    ],
                  ),
                ),
                Expanded(
                  child: ListView.separated(
                    itemCount: users.length,
                    separatorBuilder: (_, _) => Divider(color: AppColors.borderDark, height: 1),
                    itemBuilder: (_, i) {
                      final user = users[i];
                      final roleColor = _roleColor(user.role);

                      return Padding(
                        padding: const EdgeInsets.symmetric(horizontal: AppDimensions.md, vertical: 12),
                        child: Row(
                          children: [
                            Expanded(
                              flex: 26,
                              child: Text(user.name, style: AppTextStyles.heading3),
                            ),
                            Expanded(
                              flex: 28,
                              child: Text(
                                user.email,
                                style: AppTextStyles.bodySmall.copyWith(color: AppColors.textPrimary),
                              ),
                            ),
                            Expanded(
                              flex: 14,
                              child: _Tag(
                                text: user.role.toUpperCase(),
                                textColor: roleColor,
                                background: roleColor.withValues(alpha: 0.14),
                                border: roleColor.withValues(alpha: 0.36),
                              ),
                            ),
                            Expanded(
                              flex: 14,
                              child: _Tag(
                                text: user.status.toUpperCase(),
                                textColor: AppColors.success,
                                background: AppColors.successBg,
                                border: AppColors.success.withValues(alpha: 0.35),
                              ),
                            ),
                            Expanded(
                              flex: 18,
                              child: Align(
                                alignment: Alignment.centerRight,
                                child: IconButton(
                                  tooltip: 'More actions',
                                  onPressed: () {},
                                  icon: const Icon(Icons.more_horiz_rounded, color: AppColors.textMuted),
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

Color _roleColor(String role) {
  switch (role) {
    case 'Student':
      return AppColors.info;
    case 'Faculty':
      return const Color(0xFFA855F7);
    case 'Admin':
      return AppColors.error;
    default:
      return AppColors.textMuted;
  }
}

class _HeaderCell extends StatelessWidget {
  final int flex;
  final String text;
  final bool alignEnd;

  const _HeaderCell({required this.flex, required this.text, this.alignEnd = false});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      flex: flex,
      child: Align(
        alignment: alignEnd ? Alignment.centerRight : Alignment.centerLeft,
        child: Text(
          text,
          style: AppTextStyles.labelSmall.copyWith(
            color: AppColors.textMuted,
            letterSpacing: 1.25,
          ),
        ),
      ),
    );
  }
}

class _Tag extends StatelessWidget {
  final String text;
  final Color textColor;
  final Color background;
  final Color border;

  const _Tag({
    required this.text,
    required this.textColor,
    required this.background,
    required this.border,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(AppDimensions.borderRadius),
        border: Border.all(color: border),
      ),
      child: Text(
        text,
        textAlign: TextAlign.center,
        style: AppTextStyles.labelSmall.copyWith(color: textColor, letterSpacing: 0.8),
      ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  final double width;
  final bool compact;
  final String title;
  final String value;
  final IconData icon;
  final Color iconColor;
  final Color iconBg;

  const _MetricCard({
    required this.width,
    this.compact = false,
    required this.title,
    required this.value,
    required this.icon,
    required this.iconColor,
    required this.iconBg,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: width,
      child: Container(
        padding: const EdgeInsets.all(AppDimensions.md),
        decoration: BoxDecoration(
          color: AppColors.cardDark.withValues(alpha: 0.76),
          borderRadius: BorderRadius.circular(AppDimensions.borderRadiusMd),
          border: Border.all(color: AppColors.borderDark),
        ),
        child: Row(
          children: [
            Container(
              width: compact ? 44 : 50,
              height: compact ? 44 : 50,
              decoration: BoxDecoration(
                color: iconBg,
                borderRadius: BorderRadius.circular(AppDimensions.borderRadiusMd),
                border: Border.all(color: iconColor.withValues(alpha: 0.35)),
              ),
              child: Icon(icon, color: iconColor, size: compact ? 20 : 24),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: AppTextStyles.labelSmall.copyWith(
                      color: AppColors.textMuted,
                      letterSpacing: 1.2,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    value,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AppTextStyles.display.copyWith(
                      fontSize: compact ? 34 : 42,
                      height: 1,
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
}

class _UserRecord {
  final String name;
  final String email;
  final String role;
  final String status;

  const _UserRecord({
    required this.name,
    required this.email,
    required this.role,
    required this.status,
  });
}
