import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/faculty_card.dart';
import '../../../faculty_dashboard/presentation/providers/dashboard_provider.dart';

class AttendanceScreen extends ConsumerWidget {
  const AttendanceScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(dashboardProvider);
    final selected = state.selectedCourse;

    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: AppBar(
        backgroundColor: AppColors.bgDark,
        title: Text('Attendance', style: AppTextStyles.heading3),
      ),
      body: ListView(
        padding: const EdgeInsets.all(AppDimensions.md),
        children: [
          // Selected course header
          if (selected != null)
            FacultyCard(
              color: AppColors.gold.withValues(alpha: 0.08),
              borderColor: AppColors.gold.withValues(alpha: 0.2),
              child: Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: AppColors.gold,
                      borderRadius: BorderRadius.circular(AppDimensions.borderRadiusMd),
                    ),
                    child: const Icon(Icons.qr_code_2, color: AppColors.bgDark, size: 24),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('${selected.code} - ${selected.name}',
                            style: AppTextStyles.labelLarge),
                        const SizedBox(height: 2),
                        Text('${selected.students} enrolled students',
                            style: AppTextStyles.caption),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          const SizedBox(height: AppDimensions.lg),

          // QR Generate button
          SizedBox(
            width: double.infinity,
            height: 56,
            child: ElevatedButton.icon(
              onPressed: selected != null
                  ? () => context.go('/attendance/generate-qr')
                  : null,
              icon: const Icon(Icons.qr_code_2, size: 22),
              label: Text('GENERATE QR SESSION',
                  style: AppTextStyles.button.copyWith(
                    color: AppColors.bgDark,
                    letterSpacing: 0.5,
                  )),
            ),
          ),
          const SizedBox(height: AppDimensions.lg),

          // Course selector
          Text('SELECT COURSE', style: AppTextStyles.labelSmall.copyWith(letterSpacing: 1.5)),
          const SizedBox(height: AppDimensions.sm),
          ...state.courses.map((c) => GestureDetector(
                onTap: () => ref.read(dashboardProvider.notifier).selectCourse(c),
                child: Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: c.id == selected?.id ? AppColors.goldSubtle : AppColors.cardDark,
                    borderRadius: BorderRadius.circular(AppDimensions.borderRadiusMd),
                    border: Border.all(
                      color: c.id == selected?.id ? AppColors.gold.withValues(alpha: 0.3) : AppColors.borderDark,
                    ),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(c.code, style: AppTextStyles.labelSmall.copyWith(color: AppColors.gold)),
                            Text(c.name, style: AppTextStyles.labelLarge),
                          ],
                        ),
                      ),
                      if (c.id == selected?.id)
                        const Icon(Icons.check_circle, color: AppColors.gold, size: 20),
                    ],
                  ),
                ),
              )),
        ],
      ),
    );
  }
}
