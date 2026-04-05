import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
// import '../../../../shared/widgets/pec_avatar.dart';
import '../../../../shared/widgets/pec_card.dart';
import '../../../../shared/widgets/pec_empty_state.dart';
import '../../../../shared/widgets/pec_error_state.dart';
import '../../../../shared/widgets/pec_shimmer.dart';
import '../../data/models/club_model.dart';
import '../providers/clubs_provider.dart';

class ClubListScreen extends ConsumerStatefulWidget {
  const ClubListScreen({super.key});

  @override
  ConsumerState<ClubListScreen> createState() => _ClubListScreenState();
}

class _ClubListScreenState extends ConsumerState<ClubListScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tab;
  String _search = '';
  String _filterCategory = '';

  @override
  void initState() {
    super.initState();
    _tab = TabController(length: 2, vsync: this);
    _tab.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _tab.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('CLUBS'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.invalidate(clubsProvider),
          ),
        ],
        bottom: TabBar(
          controller: _tab,
          labelStyle: AppTextStyles.labelSmall,
          tabs: const [
            Tab(text: 'ALL CLUBS'),
            Tab(text: 'MY CLUBS'),
          ],
        ),
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
                    hintText: 'Search clubs…',
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
                      _Chip(label: 'ALL', value: '', current: _filterCategory,
                          onTap: () => setState(() => _filterCategory = '')),
                      const SizedBox(width: AppDimensions.xs),
                      for (final cat in ['technical', 'cultural', 'sports', 'academic', 'other'])
                        Padding(
                          padding: const EdgeInsets.only(right: AppDimensions.xs),
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
            child: TabBarView(
              controller: _tab,
              children: [
                _ClubsTab(
                    search: _search,
                    category: _filterCategory,
                    memberOnly: false),
                _ClubsTab(
                    search: _search,
                    category: _filterCategory,
                    memberOnly: true),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ClubsTab extends ConsumerWidget {
  final String search, category;
  final bool memberOnly;
  const _ClubsTab(
      {required this.search,
      required this.category,
      required this.memberOnly});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final clubsAsync = ref.watch(clubsProvider);

    return clubsAsync.when(
      loading: () => GridView.builder(
        padding: const EdgeInsets.all(AppDimensions.md),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: AppDimensions.sm,
            mainAxisSpacing: AppDimensions.sm,
            childAspectRatio: 0.85),
        itemCount: 6,
        itemBuilder: (_, __) =>
            const PecShimmerBox(height: double.infinity, width: double.infinity),
      ),
      error: (e, _) => PecErrorState(
          message: e.toString(),
          onRetry: () => ref.invalidate(clubsProvider)),
      data: (clubs) {
        final filtered = clubs.where((c) {
          final matchSearch = search.isEmpty ||
              c.name.toLowerCase().contains(search);
          final matchCat = category.isEmpty || c.category == category;
          final matchMember = !memberOnly || c.isMember || c.isPending;
          return matchSearch && matchCat && matchMember;
        }).toList();

        if (filtered.isEmpty) {
          return PecEmptyState(
            icon: Icons.groups_outlined,
            title: memberOnly ? 'No clubs joined' : 'No clubs found',
            subtitle: memberOnly ? 'Join clubs from the All Clubs tab' : null,
          );
        }

        return GridView.builder(
          padding: const EdgeInsets.fromLTRB(
              AppDimensions.md, 0, AppDimensions.md, AppDimensions.md),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: AppDimensions.sm,
              mainAxisSpacing: AppDimensions.sm,
              childAspectRatio: 0.82),
          itemCount: filtered.length,
          itemBuilder: (_, i) => _ClubCard(club: filtered[i]),
        );
      },
    );
  }
}

class _ClubCard extends ConsumerWidget {
  final ClubModel club;
  const _ClubCard({required this.club});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final joinAsync = ref.watch(clubJoinNotifierProvider);

    return PecCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Banner / logo area
          Container(
            height: 64,
            width: double.infinity,
            color: club.categoryColor.withValues(alpha: 0.15),
            child: club.logoUrl != null
                ? Image.network(club.logoUrl!,
                    fit: BoxFit.contain,
                    errorBuilder: (_, __, ___) =>
                        _defaultLogo(club))
                : _defaultLogo(club),
          ),
          const SizedBox(height: AppDimensions.xs),
          Padding(
            padding: const EdgeInsets.symmetric(
                horizontal: AppDimensions.xs),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(club.name,
                    style: AppTextStyles.labelLarge
                        .copyWith(fontSize: 12),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis),
                const SizedBox(height: 2),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 4, vertical: 1),
                      color: club.categoryColor,
                      child: Text(club.categoryLabel,
                          style: AppTextStyles.labelSmall
                              .copyWith(
                                  color: AppColors.black,
                                  fontSize: 7)),
                    ),
                    const SizedBox(width: 4),
                    Text('${club.memberCount} members',
                        style: AppTextStyles.caption
                            .copyWith(fontSize: 9)),
                  ],
                ),
                const SizedBox(height: AppDimensions.xs),
                _JoinButton(club: club, joinAsync: joinAsync, ref: ref),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _defaultLogo(ClubModel c) {
    return Center(
      child: Text(
        c.name.length > 2 ? c.name.substring(0, 2).toUpperCase() : c.name,
        style: AppTextStyles.heading2.copyWith(
            color: c.categoryColor, fontSize: 24),
      ),
    );
  }
}

class _JoinButton extends StatelessWidget {
  final ClubModel club;
  final AsyncValue<void> joinAsync;
  final WidgetRef ref;
  const _JoinButton(
      {required this.club,
      required this.joinAsync,
      required this.ref});

  @override
  Widget build(BuildContext context) {
    if (club.isMember) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 4),
        color: AppColors.green,
        child: Text('MEMBER',
            style: AppTextStyles.labelSmall
                .copyWith(color: AppColors.black, fontSize: 9),
            textAlign: TextAlign.center),
      );
    }

    if (club.isPending) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 4),
        color: AppColors.warning,
        child: Text('PENDING',
            style: AppTextStyles.labelSmall
                .copyWith(color: AppColors.black, fontSize: 9),
            textAlign: TextAlign.center),
      );
    }

    return GestureDetector(
      onTap: joinAsync.isLoading
          ? null
          : () => ref
              .read(clubJoinNotifierProvider.notifier)
              .sendJoinRequest(club.id),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 4),
        decoration: BoxDecoration(
          border: Border.all(color: AppColors.black, width: 1.5),
          boxShadow: joinAsync.isLoading
              ? null
              : const [BoxShadow(offset: Offset(2, 2), color: AppColors.black)],
        ),
        child: joinAsync.isLoading
            ? const Center(
                child: SizedBox(
                    width: 12,
                    height: 12,
                    child: CircularProgressIndicator(
                        strokeWidth: 1.5,
                        color: AppColors.black)))
            : Text('JOIN',
                style: AppTextStyles.labelSmall
                    .copyWith(color: AppColors.black, fontSize: 9),
                textAlign: TextAlign.center),
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
        padding:
            const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: active ? AppColors.yellow : Colors.transparent,
          border: Border.all(color: AppColors.black, width: 2),
          boxShadow: active
              ? const [
                  BoxShadow(offset: Offset(2, 2), color: AppColors.black)
                ]
              : null,
        ),
        child: Text(label,
            style: AppTextStyles.labelSmall
                .copyWith(fontSize: 10, color: AppColors.black)),
      ),
    );
  }
}
