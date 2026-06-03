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
import '../providers/course_materials_provider.dart';

class CourseMaterialsScreen extends ConsumerWidget {
  final String courseId;
  final String courseName;

  const CourseMaterialsScreen({
    super.key,
    required this.courseId,
    required this.courseName,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(courseMaterialsProvider(courseId));

    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: const FacultyTopNavBar(),
      body: state.loading
          ? FacultyShimmer(
              child: ListView(
                padding: const EdgeInsets.all(AppDimensions.md),
                children: List.generate(4, (_) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: ShimmerBox(height: 80),
                )),
              ),
            )
          : state.error != null
              ? FacultyErrorState(
                  message: state.error!,
                  onRetry: () => ref.read(courseMaterialsProvider(courseId).notifier).load(),
                )
              : state.materials.isEmpty
                  ? const FacultyEmptyState(
                      title: 'No materials uploaded',
                      description: 'Tap + to add course materials like notes, links, or assignments.',
                      icon: Icons.folder_open_outlined,
                    )
                  : RefreshIndicator(
                      color: AppColors.gold,
                      onRefresh: () => ref.read(courseMaterialsProvider(courseId).notifier).load(),
                      child: ListView.separated(
                        padding: const EdgeInsets.all(AppDimensions.md),
                        itemCount: state.materials.length,
                        separatorBuilder: (_, _) => const SizedBox(height: 10),
                        itemBuilder: (_, i) => _MaterialCard(
                          material: state.materials[i],
                          onDelete: () => _confirmDelete(context, ref, state.materials[i]),
                        ),
                      ),
                    ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppColors.gold,
        foregroundColor: AppColors.bgDark,
        onPressed: () => _showAddDialog(context, ref),
        child: const Icon(Icons.add),
      ),
    );
  }

  void _showAddDialog(BuildContext context, WidgetRef ref) {
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
          padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(ctx).viewInsets.bottom + 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Add Material', style: AppTextStyles.heading3),
              const SizedBox(height: 16),
              // Type selector chips
              Wrap(
                spacing: 8,
                children: ['note', 'link', 'assignment', 'lecture'].map((t) {
                  final selected = type == t;
                  return ChoiceChip(
                    label: Text(t[0].toUpperCase() + t.substring(1)),
                    selected: selected,
                    selectedColor: AppColors.gold,
                    backgroundColor: AppColors.surfaceDark,
                    labelStyle: AppTextStyles.labelMedium.copyWith(
                      color: selected ? AppColors.bgDark : AppColors.textPrimary,
                    ),
                    onSelected: (_) => setSheetState(() => type = t),
                  );
                }).toList(),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: titleCtrl,
                style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textPrimary),
                decoration: const InputDecoration(hintText: 'Title'),
              ),
              const SizedBox(height: 12),
              if (type == 'link')
                TextField(
                  controller: urlCtrl,
                  style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textPrimary),
                  decoration: const InputDecoration(hintText: 'URL'),
                  keyboardType: TextInputType.url,
                ),
              if (type != 'link')
                TextField(
                  controller: descCtrl,
                  style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textPrimary),
                  decoration: const InputDecoration(hintText: 'Description'),
                  maxLines: 3,
                ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () async {
                    if (titleCtrl.text.trim().isEmpty) return;
                    try {
                      await ref.read(courseMaterialsProvider(courseId).notifier).add({
                        'title': titleCtrl.text.trim(),
                        'type': type,
                        if (type == 'link') 'url': urlCtrl.text.trim(),
                        if (type != 'link') 'description': descCtrl.text.trim(),
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
    );
  }

  void _confirmDelete(BuildContext context, WidgetRef ref, Map<String, dynamic> material) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.cardDark,
        title: Text('Delete Material?', style: AppTextStyles.heading3),
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
                await ref.read(courseMaterialsProvider(courseId).notifier).remove(id);
              }
            },
            child: Text('Delete', style: TextStyle(color: AppColors.error)),
          ),
        ],
      ),
    );
  }
}

class _MaterialCard extends StatelessWidget {
  final Map<String, dynamic> material;
  final VoidCallback onDelete;

  const _MaterialCard({required this.material, required this.onDelete});

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
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(AppDimensions.borderRadiusMd),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: AppTextStyles.labelLarge),
                const SizedBox(height: 4),
                Row(
                  children: [
                    FacultyBadge(label: type, variant: BadgeVariant.outline),
                    if (dateStr != null) ...[
                      const SizedBox(width: 8),
                      Text(dateStr, style: AppTextStyles.caption),
                    ],
                  ],
                ),
                if (description.isNotEmpty) ...[
                  const SizedBox(height: 6),
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
            icon: const Icon(Icons.delete_outline, size: 18, color: AppColors.error),
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
          ),
        ],
      ),
    );
  }
}
