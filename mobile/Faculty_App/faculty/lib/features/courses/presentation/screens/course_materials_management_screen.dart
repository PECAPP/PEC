import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/faculty_badge.dart';
import '../../../../shared/widgets/faculty_card.dart';
import '../../../../shared/widgets/faculty_empty_state.dart';
import '../../../../shared/widgets/faculty_error_state.dart';
import '../../../../shared/widgets/faculty_shimmer.dart';
import '../../../../shared/widgets/faculty_top_nav_bar.dart';
import '../../../faculty_dashboard/presentation/providers/dashboard_provider.dart';
import '../providers/course_materials_provider.dart';

class CourseMaterialsManagementScreen extends ConsumerStatefulWidget {
  const CourseMaterialsManagementScreen({super.key});

  @override
  ConsumerState<CourseMaterialsManagementScreen> createState() =>
      _CourseMaterialsManagementScreenState();
}

class _CourseMaterialsManagementScreenState
    extends ConsumerState<CourseMaterialsManagementScreen> {
  String? _selectedCourseId;

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      final courses = ref.read(dashboardProvider).courses;
      if (courses.isNotEmpty && _selectedCourseId == null) {
        setState(() => _selectedCourseId = courses.first.id);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final dashboardState = ref.watch(dashboardProvider);
    final courses = dashboardState.courses;
    final isMobile = MediaQuery.of(context).size.width < 420;

    final selectedCourseId = _selectedCourseId ?? courses.firstOrNull?.id;
      final selectedCourseName = courses
          .where((c) => c.id == selectedCourseId)
          .firstOrNull
          ?.name ?? 'Select Course';

    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: const FacultyTopNavBar(),
      body: courses.isEmpty
          ? const FacultyEmptyState(
              title: 'No courses assigned',
              description: 'Your courses will appear here once assigned.',
              icon: Icons.book_outlined,
            )
          : SingleChildScrollView(
              child: Padding(
                padding: EdgeInsets.all(isMobile ? 12.0 : AppDimensions.md),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header
                    _SectionHeader(
                      title: 'Course Materials',
                      description: 'Upload and manage course materials',
                      isMobile: isMobile,
                    ),
                    SizedBox(height: isMobile ? 14 : AppDimensions.md),

                    // Course Selector + Buttons Row (responsive)
                    _CourseSelectionRow(
                      courses: courses,
                      selectedCourseId: selectedCourseId,
                      onCourseChanged: selectedCourseId != null
                          ? (courseId) => setState(() => _selectedCourseId = courseId)
                          : null,
                      isMobile: isMobile,
                    ),
                    SizedBox(height: isMobile ? 14 : AppDimensions.md),

                    // Materials List
                    if (selectedCourseId != null)
                      _MaterialsListSection(
                        courseId: selectedCourseId,
                        courseName: selectedCourseName,
                        isMobile: isMobile,
                      )
                    else
                      const FacultyEmptyState(
                        title: 'No course selected',
                        description: 'Select a course to view its materials.',
                        icon: Icons.folder_open_outlined,
                      ),
                  ],
                ),
              ),
            ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  final String description;
  final bool isMobile;

  const _SectionHeader({
    required this.title,
    required this.description,
    required this.isMobile,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: isMobile
              ? AppTextStyles.heading2.copyWith(fontSize: 18)
              : AppTextStyles.heading2,
        ),
        SizedBox(height: isMobile ? 4 : 8),
        Text(
          description,
          style: AppTextStyles.bodySmall.copyWith(
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }
}

class _CourseSelectionRow extends ConsumerWidget {
  final List<dynamic> courses;
  final String? selectedCourseId;
  final Function(String)? onCourseChanged;
  final bool isMobile;

  const _CourseSelectionRow({
    required this.courses,
    required this.selectedCourseId,
    required this.onCourseChanged,
    required this.isMobile,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isWide = MediaQuery.of(context).size.width >= 780;

    if (isMobile) {
      // Stack on mobile: dropdown on top, buttons below
      return Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Course dropdown
          Container(
            decoration: BoxDecoration(
              color: AppColors.cardDark,
              border: Border.all(color: AppColors.surfaceDark, width: 1),
              borderRadius: BorderRadius.circular(AppDimensions.borderRadiusMd),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: DropdownButton<String>(
              value: selectedCourseId,
              isExpanded: true,
              underline: const SizedBox(),
              dropdownColor: AppColors.cardDark,
              style:
                  AppTextStyles.bodyMedium.copyWith(color: AppColors.textPrimary),
                items: courses
                    .map((c) => DropdownMenuItem<String>(
                          value: c.id as String,
                          child: Text(c.name as String),
                        ))
                    .toList(),
                onChanged: onCourseChanged != null ? (String? value) {
                  if (value != null) onCourseChanged!(value);
                } : null,
            ),
          ),
          SizedBox(height: isMobile ? 10 : 12),
          // Buttons stacked vertically on mobile
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () =>
                  _showBulkUploadDialog(context, ref, selectedCourseId),
              icon: const Icon(Icons.cloud_upload_outlined, size: 18),
              label: const Text('Bulk Upload'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.surfaceDark,
                foregroundColor: AppColors.textPrimary,
                padding: const EdgeInsets.symmetric(vertical: 10),
              ),
            ),
          ),
          SizedBox(height: isMobile ? 8 : 10),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () => _showUploadMaterialDialog(context, ref, selectedCourseId),
              icon: const Icon(Icons.add, size: 18),
              label: const Text('Upload Material'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.gold,
                foregroundColor: AppColors.bgDark,
                padding: const EdgeInsets.symmetric(vertical: 10),
              ),
            ),
          ),
        ],
      );
    } else if (isWide) {
      // Desktop: row layout
      return Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Course dropdown
          Expanded(
            flex: 2,
            child: Container(
              decoration: BoxDecoration(
                color: AppColors.cardDark,
                border: Border.all(color: AppColors.surfaceDark, width: 1),
                borderRadius: BorderRadius.circular(AppDimensions.borderRadiusMd),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: DropdownButton<String>(
                value: selectedCourseId,
                isExpanded: true,
                underline: const SizedBox(),
                dropdownColor: AppColors.cardDark,
                style: AppTextStyles.bodyMedium.copyWith(
                  color: AppColors.textPrimary,
                ),
                  items: courses
                      .map((c) => DropdownMenuItem<String>(
                            value: c.id as String,
                            child: Text(c.name as String),
                          ))
                      .toList(),
                  onChanged: onCourseChanged != null ? (String? value) {
                    if (value != null) onCourseChanged!(value);
                  } : null,
              ),
            ),
          ),
          SizedBox(width: AppDimensions.md),
          // Buttons horizontal
          Expanded(
            child: ElevatedButton.icon(
              onPressed: () =>
                  _showBulkUploadDialog(context, ref, selectedCourseId),
              icon: const Icon(Icons.cloud_upload_outlined, size: 18),
              label: const Text('Bulk Upload'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.surfaceDark,
                foregroundColor: AppColors.textPrimary,
              ),
            ),
          ),
          SizedBox(width: 8),
          Expanded(
            child: ElevatedButton.icon(
              onPressed: () =>
                  _showUploadMaterialDialog(context, ref, selectedCourseId),
              icon: const Icon(Icons.add, size: 18),
              label: const Text('Upload Material'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.gold,
                foregroundColor: AppColors.bgDark,
              ),
            ),
          ),
        ],
      );
    } else {
      // Tablet: vertical stack
      return Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            decoration: BoxDecoration(
              color: AppColors.cardDark,
              border: Border.all(color: AppColors.surfaceDark, width: 1),
              borderRadius: BorderRadius.circular(AppDimensions.borderRadiusMd),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: DropdownButton<String>(
              value: selectedCourseId,
              isExpanded: true,
              underline: const SizedBox(),
              dropdownColor: AppColors.cardDark,
              style: AppTextStyles.bodyMedium.copyWith(
                color: AppColors.textPrimary,
              ),
                items: courses
                    .map((c) => DropdownMenuItem<String>(
                          value: c.id as String,
                          child: Text(c.name as String),
                        ))
                    .toList(),
                onChanged: onCourseChanged != null ? (String? value) {
                  if (value != null) onCourseChanged!(value);
                } : null,
            ),
          ),
          SizedBox(height: AppDimensions.sm),
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () =>
                      _showBulkUploadDialog(context, ref, selectedCourseId),
                  icon: const Icon(Icons.cloud_upload_outlined, size: 18),
                  label: const Text('Bulk Upload'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.surfaceDark,
                    foregroundColor: AppColors.textPrimary,
                  ),
                ),
              ),
              SizedBox(width: AppDimensions.sm),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () =>
                      _showUploadMaterialDialog(context, ref, selectedCourseId),
                  icon: const Icon(Icons.add, size: 18),
                  label: const Text('Upload Material'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.gold,
                    foregroundColor: AppColors.bgDark,
                  ),
                ),
              ),
            ],
          ),
        ],
      );
    }
  }

  void _showBulkUploadDialog(
    BuildContext context,
    WidgetRef ref,
    String? courseId,
  ) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Bulk upload picker would open here.'),
        duration: Duration(seconds: 2),
      ),
    );
  }

  void _showUploadMaterialDialog(
    BuildContext context,
    WidgetRef ref,
    String? courseId,
  ) {
    if (courseId == null) return;

    final titleCtrl = TextEditingController();
    final urlCtrl = TextEditingController();
    final descCtrl = TextEditingController();
    String type = 'note';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.cardDark,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheetState) => Padding(
          padding: EdgeInsets.fromLTRB(
            16,
            16,
            16,
            MediaQuery.of(ctx).viewInsets.bottom + 16,
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Add Material', style: AppTextStyles.heading3),
                SizedBox(height: MediaQuery.of(ctx).size.width < 420 ? 12 : 16),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: ['note', 'link', 'assignment', 'lecture']
                      .map((t) {
                        final selected = type == t;
                        return ChoiceChip(
                          label: Text(t[0].toUpperCase() + t.substring(1)),
                          selected: selected,
                          selectedColor: AppColors.gold,
                          backgroundColor: AppColors.surfaceDark,
                          labelStyle: AppTextStyles.labelMedium.copyWith(
                            color: selected
                                ? AppColors.bgDark
                                : AppColors.textPrimary,
                            fontSize:
                                MediaQuery.of(ctx).size.width < 420 ? 12 : 13,
                          ),
                          onSelected: (_) =>
                              setSheetState(() => type = t),
                        );
                      })
                      .toList(),
                ),
                SizedBox(height: MediaQuery.of(ctx).size.width < 420 ? 12 : 16),
                TextField(
                  controller: titleCtrl,
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: AppColors.textPrimary,
                  ),
                  decoration: InputDecoration(
                    hintText: 'Title',
                    hintStyle: AppTextStyles.bodyMedium.copyWith(
                      color: AppColors.textSecondary,
                    ),
                    filled: true,
                    fillColor: AppColors.surfaceDark,
                    border: OutlineInputBorder(
                      borderRadius:
                          BorderRadius.circular(AppDimensions.borderRadiusMd),
                      borderSide: BorderSide.none,
                    ),
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 10,
                    ),
                  ),
                ),
                SizedBox(height: MediaQuery.of(ctx).size.width < 420 ? 10 : 12),
                if (type == 'link')
                  TextField(
                    controller: urlCtrl,
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: AppColors.textPrimary,
                    ),
                    decoration: InputDecoration(
                      hintText: 'URL',
                      hintStyle: AppTextStyles.bodyMedium.copyWith(
                        color: AppColors.textSecondary,
                      ),
                      filled: true,
                      fillColor: AppColors.surfaceDark,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(
                          AppDimensions.borderRadiusMd,
                        ),
                        borderSide: BorderSide.none,
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 10,
                      ),
                    ),
                    keyboardType: TextInputType.url,
                  )
                else
                  TextField(
                    controller: descCtrl,
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: AppColors.textPrimary,
                    ),
                    decoration: InputDecoration(
                      hintText: 'Description',
                      hintStyle: AppTextStyles.bodyMedium.copyWith(
                        color: AppColors.textSecondary,
                      ),
                      filled: true,
                      fillColor: AppColors.surfaceDark,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(
                          AppDimensions.borderRadiusMd,
                        ),
                        borderSide: BorderSide.none,
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 10,
                      ),
                    ),
                    maxLines: 3,
                  ),
                SizedBox(height: MediaQuery.of(ctx).size.width < 420 ? 14 : 20),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.gold,
                      foregroundColor: AppColors.bgDark,
                      padding: const EdgeInsets.symmetric(vertical: 10),
                    ),
                    onPressed: () async {
                      if (titleCtrl.text.trim().isEmpty) return;
                      try {
                        await ref
                            .read(courseMaterialsProvider(courseId).notifier)
                            .add({
                          'title': titleCtrl.text.trim(),
                          'type': type,
                          if (type == 'link')
                            'url': urlCtrl.text.trim(),
                          if (type != 'link')
                            'description': descCtrl.text.trim(),
                        });
                        if (ctx.mounted) Navigator.pop(ctx);
                      } catch (e) {
                        if (ctx.mounted) {
                          ScaffoldMessenger.of(ctx).showSnackBar(
                            SnackBar(content: Text('Error: $e')),
                          );
                        }
                      }
                    },
                    child: const Text('SAVE'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _MaterialsListSection extends ConsumerWidget {
  final String courseId;
  final String courseName;
  final bool isMobile;

  const _MaterialsListSection({
    required this.courseId,
    required this.courseName,
    required this.isMobile,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(courseMaterialsProvider(courseId));

    return state.loading
        ? FacultyShimmer(
            child: Column(
              children: List.generate(
                4,
                (_) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: ShimmerBox(
                    height: isMobile ? 100 : 80,
                  ),
                ),
              ),
            ),
          )
        : state.error != null
            ? FacultyErrorState(
                message: state.error!,
                onRetry: () =>
                    ref.read(courseMaterialsProvider(courseId).notifier).load(),
              )
            : state.materials.isEmpty
                ? const FacultyEmptyState(
                    title: 'No materials uploaded',
                    description:
                        'Tap Upload Material to add course materials like notes, links, or assignments.',
                    icon: Icons.folder_open_outlined,
                  )
                : SingleChildScrollView(
                    scrollDirection:
                        isMobile ? Axis.vertical : Axis.horizontal,
                    child: ConstrainedBox(
                      constraints: BoxConstraints(
                        minWidth:
                            MediaQuery.of(context).size.width - (isMobile ? 24 : 32),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Materials count header
                          Padding(
                            padding: EdgeInsets.only(
                              bottom: isMobile ? 10 : 12,
                            ),
                            child: Text(
                              '${state.materials.length} Material${state.materials.length != 1 ? 's' : ''}',
                              style: AppTextStyles.labelLarge.copyWith(
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ),
                          // Materials list
                          ListView.separated(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: state.materials.length,
                              separatorBuilder: (_, _) => SizedBox(
                              height: isMobile ? 8 : 10,
                            ),
                            itemBuilder: (_, i) => _MaterialCard(
                              material: state.materials[i],
                              isMobile: isMobile,
                              onDelete: () => _confirmDelete(
                                context,
                                ref,
                                state.materials[i],
                                courseId,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
  }

  void _confirmDelete(
    BuildContext context,
    WidgetRef ref,
    Map<String, dynamic> material,
    String courseId,
  ) {
    final isMobile = MediaQuery.of(context).size.width < 420;

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.cardDark,
        title: Text(
          'Delete Material?',
          style: AppTextStyles.heading3.copyWith(
            fontSize: isMobile ? 16 : 18,
          ),
        ),
        content: Text(
          'Delete "${material['title']}"? This cannot be undone.',
          style: AppTextStyles.bodySmall,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(ctx);
              final id = material['id']?.toString();
              if (id != null) {
                await ref
                    .read(courseMaterialsProvider(courseId).notifier)
                    .remove(id);
              }
            },
            child: Text(
              'Delete',
              style: TextStyle(color: AppColors.error),
            ),
          ),
        ],
      ),
    );
  }
}

class _MaterialCard extends StatelessWidget {
  final Map<String, dynamic> material;
  final bool isMobile;
  final VoidCallback onDelete;

  const _MaterialCard({
    required this.material,
    required this.isMobile,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final title = material['title'] as String? ?? 'Untitled';
    final type = material['type'] as String? ?? 'note';
    final description = material['description'] as String? ?? '';
    final createdAt = material['createdAt'] as String?;

    String? dateStr;
    if (createdAt != null) {
      try {
        dateStr = DateFormat('MMM d, yyyy').format(DateTime.parse(createdAt));
      } catch (_) {}
    }

    final (IconData icon, Color color) = switch (type) {
      'link' => (Icons.link, AppColors.info),
      'assignment' => (Icons.assignment_outlined, AppColors.warning),
      'lecture' => (Icons.play_circle_outlined, AppColors.success),
      _ => (Icons.description_outlined, AppColors.gold),
    };

    return FacultyCard(
      child: isMobile
          ? Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: color.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(
                          AppDimensions.borderRadiusMd,
                        ),
                      ),
                      child: Icon(icon, color: color, size: 18),
                    ),
                    SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            title,
                            style: AppTextStyles.labelLarge.copyWith(
                              fontSize: 13,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                          SizedBox(height: 3),
                          Row(
                            children: [
                              FacultyBadge(
                                label: type,
                                variant: BadgeVariant.outline,
                              ),
                              if (dateStr != null) ...[
                                SizedBox(width: 6),
                                Expanded(
                                  child: Text(
                                    dateStr,
                                    style:
                                        AppTextStyles.caption.copyWith(
                                      fontSize: 10,
                                    ),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      onPressed: onDelete,
                      icon: const Icon(
                        Icons.delete_outline,
                        size: 16,
                        color: AppColors.error,
                      ),
                      padding: EdgeInsets.zero,
                      constraints:
                          const BoxConstraints(minWidth: 28, minHeight: 28),
                    ),
                  ],
                ),
                if (description.isNotEmpty) ...[
                  SizedBox(height: 6),
                  Text(
                    description,
                    style: AppTextStyles.bodySmall.copyWith(fontSize: 11),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ],
            )
          : Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(
                      AppDimensions.borderRadiusMd,
                    ),
                  ),
                  child: Icon(icon, color: color, size: 20),
                ),
                SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(title, style: AppTextStyles.labelLarge),
                      SizedBox(height: 4),
                      Row(
                        children: [
                          FacultyBadge(label: type, variant: BadgeVariant.outline),
                          if (dateStr != null) ...[
                            SizedBox(width: 8),
                            Text(dateStr, style: AppTextStyles.caption),
                          ],
                        ],
                      ),
                      if (description.isNotEmpty) ...[
                        SizedBox(height: 6),
                        Text(
                          description,
                          style: AppTextStyles.bodySmall,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ],
                  ),
                ),
                IconButton(
                  onPressed: onDelete,
                  icon: const Icon(
                    Icons.delete_outline,
                    size: 18,
                    color: AppColors.error,
                  ),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                ),
              ],
            ),
    );
  }
}
