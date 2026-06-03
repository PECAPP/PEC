import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/pec_card.dart';
import '../../../../shared/widgets/pec_empty_state.dart';
import '../../../../shared/widgets/pec_error_state.dart';
import '../../../../shared/widgets/pec_shimmer.dart';
import '../../data/models/notice_model.dart';
import '../providers/notice_provider.dart';

class NoticeListScreen extends ConsumerStatefulWidget {
  const NoticeListScreen({super.key});

  @override
  ConsumerState<NoticeListScreen> createState() => _NoticeListScreenState();
}

class _NoticeListScreenState extends ConsumerState<NoticeListScreen> {
  String _search = '';
  String _filterCategory = '';

  @override
  Widget build(BuildContext context) {
    final noticesAsync = ref.watch(noticesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('NOTICEBOARD'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.invalidate(noticesProvider),
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(AppDimensions.md),
            child: Column(
              children: [
                TextField(
                  onChanged: (v) => setState(() => _search = v.toLowerCase()),
                  decoration: InputDecoration(
                    hintText: 'Search notices…',
                    hintStyle: AppTextStyles.bodySmall,
                    prefixIcon: const Icon(Icons.search, size: 20),
                    border: const OutlineInputBorder(
                        borderSide: BorderSide(color: AppColors.black, width: 2)),
                    enabledBorder: const OutlineInputBorder(
                        borderSide: BorderSide(color: AppColors.black, width: 2)),
                    focusedBorder: const OutlineInputBorder(
                        borderSide: BorderSide(color: AppColors.yellow, width: 2)),
                    filled: true,
                    contentPadding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  ),
                ),
                const SizedBox(height: AppDimensions.sm),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _Chip(
                          label: 'ALL',
                          value: '',
                          current: _filterCategory,
                          onTap: () =>
                              setState(() => _filterCategory = '')),
                      const SizedBox(width: AppDimensions.xs),
                      for (final cat in [
                        'urgent',
                        'academic',
                        'exam',
                        'hostel',
                        'general'
                      ])
                        Padding(
                          padding:
                              const EdgeInsets.only(right: AppDimensions.xs),
                          child: _Chip(
                            label: cat.toUpperCase(),
                            value: cat,
                            current: _filterCategory,
                            onTap: () => setState(() =>
                                _filterCategory =
                                    _filterCategory == cat ? '' : cat),
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: noticesAsync.when(
              loading: () => ListView.separated(
                padding: const EdgeInsets.all(AppDimensions.md),
                itemCount: 6,
                separatorBuilder: (_, __) =>
                    const SizedBox(height: AppDimensions.sm),
                itemBuilder: (_, __) =>
                    const PecShimmerBox(height: 80, width: double.infinity),
              ),
              error: (e, _) => PecErrorState(
                message: e.toString(),
                onRetry: () => ref.invalidate(noticesProvider),
              ),
              data: (notices) {
                final filtered = notices.where((n) {
                  final matchSearch = _search.isEmpty ||
                      n.title.toLowerCase().contains(_search) ||
                      (n.content?.toLowerCase().contains(_search) ?? false);
                  final matchCat =
                      _filterCategory.isEmpty || n.category == _filterCategory;
                  return matchSearch && matchCat;
                }).toList();

                if (filtered.isEmpty) {
                  return PecEmptyState(
                    icon: Icons.campaign_outlined,
                    title: 'No notices found',
                    subtitle: _search.isNotEmpty
                        ? 'Try a different search'
                        : 'Notices from admin will appear here',
                  );
                }

                return ListView.separated(
                  padding: const EdgeInsets.fromLTRB(AppDimensions.md, 0,
                      AppDimensions.md, AppDimensions.md),
                  itemCount: filtered.length,
                  separatorBuilder: (_, __) =>
                      const SizedBox(height: AppDimensions.sm),
                  itemBuilder: (_, i) => _NoticeCard(notice: filtered[i]),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  final String label, value, current;
  final VoidCallback onTap;
  const _Chip(
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

class _NoticeCard extends StatelessWidget {
  final NoticeModel notice;
  const _NoticeCard({required this.notice});

  @override
  Widget build(BuildContext context) {
    return PecCard(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(width: 4, color: notice.dotColor),
          const SizedBox(width: AppDimensions.sm),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(notice.title,
                          style: AppTextStyles.labelLarge,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis),
                    ),
                    const SizedBox(width: AppDimensions.xs),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 6, vertical: 2),
                      color: notice.dotColor,
                      child: Text(notice.categoryLabel,
                          style: AppTextStyles.labelSmall
                              .copyWith(color: AppColors.black, fontSize: 8)),
                    ),
                    if (notice.isPinned) ...[
                      const SizedBox(width: 4),
                      const Icon(Icons.push_pin,
                          size: 14, color: AppColors.red),
                    ],
                  ],
                ),
                if (notice.content != null &&
                    notice.content!.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Text(notice.content!,
                      style: AppTextStyles.bodySmall,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis),
                ],
                const SizedBox(height: 4),
                Text(
                  _timeAgo(notice.createdAt),
                  style: AppTextStyles.caption
                      .copyWith(color: AppColors.textSecondary),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _timeAgo(DateTime dt) {
    final diff = DateTime.now().difference(dt);
    if (diff.inDays > 30) return '${dt.day}/${dt.month}/${dt.year}';
    if (diff.inDays > 0) return '${diff.inDays}d ago';
    if (diff.inHours > 0) return '${diff.inHours}h ago';
    return 'Just now';
  }
}
