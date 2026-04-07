import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/pec_card.dart';
import '../../../../shared/widgets/pec_empty_state.dart';
import '../../../../shared/widgets/pec_shimmer.dart';
import '../../data/models/material_model.dart';
import '../providers/materials_provider.dart';

class MaterialsListScreen extends ConsumerStatefulWidget {
  final String? courseId;
  const MaterialsListScreen({super.key, this.courseId});

  @override
  ConsumerState<MaterialsListScreen> createState() =>
      _MaterialsListScreenState();
}

class _MaterialsListScreenState extends ConsumerState<MaterialsListScreen> {
  String _search = '';
  String _filterType = '';

  @override
  Widget build(BuildContext context) {
    final materialsAsync = ref.watch(materialsProvider(widget.courseId));

    return Scaffold(
      appBar: AppBar(
        title: Text(
            widget.courseId != null ? 'COURSE MATERIALS' : 'ALL MATERIALS'),
      ),
      body: Column(
        children: [
          // Search + filter bar
          Padding(
            padding: const EdgeInsets.all(AppDimensions.md),
            child: Column(
              children: [
                TextField(
                  onChanged: (v) => setState(() => _search = v.toLowerCase()),
                  decoration: InputDecoration(
                    hintText: 'Search materials…',
                    hintStyle: AppTextStyles.bodySmall,
                    prefixIcon: const Icon(Icons.search, size: 20),
                    border: const OutlineInputBorder(
                        borderSide:
                            BorderSide(color: AppColors.black, width: 2)),
                    enabledBorder: const OutlineInputBorder(
                        borderSide:
                            BorderSide(color: AppColors.black, width: 2)),
                    focusedBorder: const OutlineInputBorder(
                        borderSide:
                            BorderSide(color: AppColors.yellow, width: 2)),
                    filled: true,
                    contentPadding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 10),
                  ),
                ),
                const SizedBox(height: AppDimensions.sm),
                // Type chips
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _TypeChip(
                          label: 'ALL',
                          value: '',
                          current: _filterType,
                          onTap: () => setState(() => _filterType = '')),
                      const SizedBox(width: AppDimensions.xs),
                      for (final t in ['pdf', 'ppt', 'doc', 'video', 'other'])
                        Padding(
                          padding:
                              const EdgeInsets.only(right: AppDimensions.xs),
                          child: _TypeChip(
                              label: t.toUpperCase(),
                              value: t,
                              current: _filterType,
                              onTap: () => setState(() =>
                                  _filterType = _filterType == t ? '' : t)),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: materialsAsync.when(
              loading: () => _shimmer(),
              error: (e, _) => _MaterialsLoadFallback(
                onRetry: () =>
                    ref.invalidate(materialsProvider(widget.courseId)),
              ),
              data: (materials) {
                final filtered = materials.where((m) {
                  final matchSearch = _search.isEmpty ||
                      m.title.toLowerCase().contains(_search) ||
                      (m.courseName?.toLowerCase().contains(_search) ?? false);
                  final matchType =
                      _filterType.isEmpty || m.fileType == _filterType;
                  return matchSearch && matchType;
                }).toList()
                  ..sort((a, b) => b.createdAt.compareTo(a.createdAt));

                if (filtered.isEmpty) {
                  return PecEmptyState(
                    icon: Icons.folder_open_outlined,
                    title: 'No materials found',
                    subtitle: _search.isNotEmpty
                        ? 'Try a different search'
                        : 'Materials uploaded by faculty will appear here',
                  );
                }
                return ListView.separated(
                  padding: const EdgeInsets.fromLTRB(
                      AppDimensions.md, 0, AppDimensions.md, AppDimensions.md),
                  itemCount: filtered.length,
                  separatorBuilder: (_, __) =>
                      const SizedBox(height: AppDimensions.sm),
                  itemBuilder: (_, i) => _MaterialCard(material: filtered[i]),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _shimmer() => ListView.separated(
        padding: const EdgeInsets.all(AppDimensions.md),
        itemCount: 6,
        separatorBuilder: (_, __) => const SizedBox(height: AppDimensions.sm),
        itemBuilder: (_, __) =>
            const PecShimmerBox(height: 72, width: double.infinity),
      );
}

class _TypeChip extends StatelessWidget {
  final String label, value, current;
  final VoidCallback onTap;
  const _TypeChip(
      {required this.label,
      required this.value,
      required this.current,
      required this.onTap});

  @override
  Widget build(BuildContext context) {
    final active = current == value;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: active ? AppColors.yellow : Colors.transparent,
          border: Border.all(color: AppColors.black, width: 2),
          boxShadow: active
              ? const [BoxShadow(offset: Offset(2, 2), color: AppColors.black)]
              : null,
        ),
        child: Text(label,
            style: AppTextStyles.labelSmall
                .copyWith(fontSize: 10, color: AppColors.black)),
      ),
    );
  }
}

class _MaterialCard extends StatelessWidget {
  final CourseMaterialModel material;
  const _MaterialCard({required this.material});

  String get _createdLabel {
    final d = material.createdAt;
    final day = d.day.toString().padLeft(2, '0');
    final month = d.month.toString().padLeft(2, '0');
    final year = d.year.toString();
    return '$day/$month/$year';
  }

  @override
  Widget build(BuildContext context) {
    return PecCard(
      onTap: () async {
        final uri = Uri.tryParse(material.fileUrl);
        if (uri != null && await canLaunchUrl(uri)) {
          await launchUrl(uri, mode: LaunchMode.externalApplication);
        }
      },
      child: Row(
        children: [
          // Icon
          Container(
            width: 48,
            height: 48,
            color: material.fileColor,
            child: Icon(material.fileIcon, color: AppColors.black, size: 24),
          ),
          const SizedBox(width: AppDimensions.md),
          // Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(material.title,
                    style: AppTextStyles.labelLarge,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis),
                if (material.courseName != null)
                  Text(material.courseName!,
                      style: AppTextStyles.caption,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis),
                Row(
                  children: [
                    Text(material.fileType.toUpperCase(),
                        style: AppTextStyles.caption
                            .copyWith(color: material.fileColor)),
                    if (material.fileSizeLabel.isNotEmpty) ...[
                      const Text(' · ', style: TextStyle(fontSize: 10)),
                      Text(material.fileSizeLabel,
                          style: AppTextStyles.caption),
                    ],
                  ],
                ),
                if ((material.uploadedBy ?? '').isNotEmpty)
                  Text(
                    'By ${material.uploadedBy} · $_createdLabel',
                    style: AppTextStyles.caption
                        .copyWith(color: AppColors.textSecondary),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
              ],
            ),
          ),
          const Icon(Icons.open_in_new_outlined,
              size: 18, color: AppColors.textSecondary),
        ],
      ),
    );
  }
}

class _MaterialsLoadFallback extends StatelessWidget {
  final VoidCallback onRetry;
  const _MaterialsLoadFallback({required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(
            Icons.folder_off_outlined,
            size: 42,
            color: AppColors.textSecondary,
          ),
          const SizedBox(height: AppDimensions.sm),
          Text(
            'Could not load materials right now',
            style: AppTextStyles.bodySmall
                .copyWith(color: AppColors.textSecondary),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppDimensions.md),
          SizedBox(
            width: 160,
            child: FilledButton(
              onPressed: onRetry,
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.yellow,
                foregroundColor: AppColors.black,
              ),
              child: const Text('Retry'),
            ),
          ),
        ],
      ),
    );
  }
}
