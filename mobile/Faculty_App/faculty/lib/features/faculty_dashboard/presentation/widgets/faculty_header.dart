import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/faculty_badge.dart';
import '../../data/models/course_card_model.dart';

class FacultyHeader extends StatelessWidget {
  final List<CourseCardModel> courses;
  final CourseCardModel? selectedCourse;
  final ValueChanged<CourseCardModel> onSelectCourse;
  final VoidCallback onGenerateQR;

  const FacultyHeader({
    super.key,
    required this.courses,
    required this.selectedCourse,
    required this.onSelectCourse,
    required this.onGenerateQR,
  });

  String _greeting() {
    final h = DateTime.now().hour;
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppDimensions.md + 4),
      decoration: BoxDecoration(
        color: AppColors.cardDark,
        borderRadius: BorderRadius.circular(AppDimensions.borderRadiusXl),
        border: Border.all(color: AppColors.borderDark),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.gold.withValues(alpha: 0.06),
            AppColors.cardDark,
          ],
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const FacultyBadge(label: 'Academic Management'),
          const SizedBox(height: AppDimensions.sm),
          Text(
            '${_greeting()}, Professor!',
            style: AppTextStyles.heading2,
          ),
          const SizedBox(height: 4),
          Text(
            'Manage your courses, students, and institutional activities.',
            style: AppTextStyles.bodySmall,
          ),
          const SizedBox(height: AppDimensions.md),

          // Action row
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              // Course selector
              if (courses.isNotEmpty)
                _CourseDropdown(
                  courses: courses,
                  selected: selectedCourse,
                  onChanged: onSelectCourse,
                ),
              // QR Attendance button
              SizedBox(
                height: 36,
                child: ElevatedButton.icon(
                  onPressed: selectedCourse != null ? onGenerateQR : null,
                  icon: const Icon(Icons.qr_code_2, size: 16),
                  label: const Text('QR Attendance'),
                  style: ElevatedButton.styleFrom(
                    textStyle: AppTextStyles.labelMedium,
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(AppDimensions.borderRadiusMd),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _CourseDropdown extends StatelessWidget {
  final List<CourseCardModel> courses;
  final CourseCardModel? selected;
  final ValueChanged<CourseCardModel> onChanged;

  const _CourseDropdown({
    required this.courses,
    required this.selected,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 36,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      constraints: const BoxConstraints(minWidth: 140, maxWidth: 260),
      decoration: BoxDecoration(
        border: Border.all(color: AppColors.borderDark),
        borderRadius: BorderRadius.circular(AppDimensions.borderRadiusMd),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: selected?.id,
          isExpanded: true,
          dropdownColor: AppColors.cardDark,
          style: AppTextStyles.labelMedium.copyWith(color: AppColors.textPrimary),
          hint: Text('Select course', style: AppTextStyles.labelMedium, overflow: TextOverflow.ellipsis),
          icon: const Icon(Icons.keyboard_arrow_down, size: 18, color: AppColors.textMuted),
          isDense: true,
          items: courses.map((c) => DropdownMenuItem(
            value: c.id,
            child: Text('${c.code} - ${c.name}', overflow: TextOverflow.ellipsis),
          )).toList(),
          onChanged: (id) {
            if (id == null) return;
            final course = courses.firstWhere((c) => c.id == id);
            onChanged(course);
          },
        ),
      ),
    );
  }
}
