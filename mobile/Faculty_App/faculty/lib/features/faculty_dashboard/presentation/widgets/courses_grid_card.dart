import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/faculty_card.dart';
import '../../data/models/course_card_model.dart';

class CoursesGridCard extends StatelessWidget {
  final List<CourseCardModel> courses;
  final VoidCallback onManage;

  const CoursesGridCard({super.key, required this.courses, required this.onManage});

  @override
  Widget build(BuildContext context) {
    return FacultyCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('My Courses', style: AppTextStyles.heading3),
              GestureDetector(
                onTap: onManage,
                child: Row(
                  children: [
                    Text('Manage',
                        style: AppTextStyles.labelMedium.copyWith(color: AppColors.textMuted)),
                    const SizedBox(width: 4),
                    const Icon(Icons.arrow_outward, size: 14, color: AppColors.textMuted),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: AppDimensions.md),
          if (courses.isEmpty)
            Text('No faculty courses found.', style: AppTextStyles.bodySmall)
          else
            ...courses.map((c) => _CourseRow(course: c)),
        ],
      ),
    );
  }
}

class _CourseRow extends StatelessWidget {
  final CourseCardModel course;
  const _CourseRow({required this.course});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppDimensions.sm),
      padding: const EdgeInsets.all(AppDimensions.md - 4),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppDimensions.borderRadiusMd),
        border: Border.all(color: AppColors.borderDark),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(course.code,
                        style: AppTextStyles.labelSmall.copyWith(color: AppColors.gold)),
                    const SizedBox(height: 2),
                    Text(course.name,
                        style: AppTextStyles.labelLarge, overflow: TextOverflow.ellipsis),
                  ],
                ),
              ),
              Row(
                children: [
                  const Icon(Icons.people_outline, size: 14, color: AppColors.textMuted),
                  const SizedBox(width: 4),
                  Text('${course.students}', style: AppTextStyles.bodySmall),
                ],
              ),
            ],
          ),
          const SizedBox(height: AppDimensions.sm),
          // Progress bar
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Syllabus', style: AppTextStyles.caption),
              Text('${course.progress}%', style: AppTextStyles.labelMedium),
            ],
          ),
          const SizedBox(height: 4),
          ClipRRect(
            borderRadius: BorderRadius.circular(2),
            child: LinearProgressIndicator(
              value: course.progress / 100,
              backgroundColor: AppColors.surfaceDark,
              valueColor: const AlwaysStoppedAnimation(AppColors.gold),
              minHeight: 4,
            ),
          ),
          const SizedBox(height: AppDimensions.sm),
          // Attendance row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Attendance', style: AppTextStyles.caption),
              Text(
                '${course.avgAttendance}%',
                style: AppTextStyles.labelMedium.copyWith(
                  color: course.avgAttendance >= 80
                      ? AppColors.success
                      : course.avgAttendance >= 75
                          ? AppColors.warning
                          : AppColors.error,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
