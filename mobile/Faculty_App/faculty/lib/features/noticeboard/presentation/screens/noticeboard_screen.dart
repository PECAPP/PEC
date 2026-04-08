import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../../core/api/api_endpoints.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/faculty_badge.dart';
import '../../../../shared/widgets/faculty_card.dart';
import '../../../../shared/widgets/faculty_empty_state.dart';
import '../../../../shared/widgets/faculty_error_state.dart';
import '../../../../shared/widgets/faculty_shimmer.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

final _noticesProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final client = ref.read(apiClientProvider);
  final res = await client.dio.get(ApiEndpoints.noticeboard, queryParameters: {'limit': 50});
  final data = res.data;
  if (data is Map && data.containsKey('data')) {
    return List<Map<String, dynamic>>.from(data['data'] as List);
  }
  return [];
});

class NoticeboardScreen extends ConsumerWidget {
  const NoticeboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final noticesAsync = ref.watch(_noticesProvider);

    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: AppBar(
        backgroundColor: AppColors.bgDark,
        title: Text('Noticeboard', style: AppTextStyles.heading3),
      ),
      body: noticesAsync.when(
        loading: () => FacultyShimmer(
          child: ListView(
            padding: const EdgeInsets.all(AppDimensions.md),
            children: List.generate(6, (_) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: ShimmerBox(height: 90),
            )),
          ),
        ),
        error: (e, _) => FacultyErrorState(message: e.toString(), onRetry: () => ref.invalidate(_noticesProvider)),
        data: (notices) => notices.isEmpty
            ? const FacultyEmptyState(title: 'No notices yet', icon: Icons.campaign_outlined)
            : ListView.separated(
                padding: const EdgeInsets.all(AppDimensions.md),
                itemCount: notices.length,
                separatorBuilder: (_, _) => const SizedBox(height: 10),
                itemBuilder: (_, i) => _NoticeCard(notice: notices[i]),
              ),
      ),
    );
  }
}

class _NoticeCard extends StatelessWidget {
  final Map<String, dynamic> notice;
  const _NoticeCard({required this.notice});

  @override
  Widget build(BuildContext context) {
    final title = notice['title'] as String? ?? 'Notice';
    final content = notice['content'] as String? ?? '';
    final category = notice['category'] as String? ?? 'update';
    final pinned = notice['pinned'] as bool? ?? false;
    final important = notice['important'] as bool? ?? false;
    final publishedAt = notice['publishedAt'] as String?;

    String? dateStr;
    if (publishedAt != null) {
      try { dateStr = DateFormat('MMM d, yyyy').format(DateTime.parse(publishedAt)); } catch (_) {}
    }

    return FacultyCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(child: Text(title, style: AppTextStyles.labelLarge, maxLines: 2, overflow: TextOverflow.ellipsis)),
              if (dateStr != null) Text(dateStr, style: AppTextStyles.caption),
            ],
          ),
          const SizedBox(height: 6),
          Wrap(
            spacing: 4,
            runSpacing: 4,
            children: [
              if (pinned) const FacultyBadge(label: 'Pinned', variant: BadgeVariant.secondary, icon: Icons.push_pin),
              if (important) const FacultyBadge(label: 'Important', variant: BadgeVariant.error),
              FacultyBadge(label: category, variant: BadgeVariant.outline),
            ],
          ),
          if (content.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(content, style: AppTextStyles.bodySmall, maxLines: 3, overflow: TextOverflow.ellipsis),
          ],
        ],
      ),
    );
  }
}
