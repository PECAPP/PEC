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
import '../providers/marketplace_provider.dart';

class MarketplaceScreen extends ConsumerWidget {
  const MarketplaceScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(marketplaceProvider);
    final notifier = ref.read(marketplaceProvider.notifier);
    final width = MediaQuery.of(context).size.width;
    final isMobile = width < 420;

    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: const FacultyTopNavBar(),
      body: RefreshIndicator(
        color: AppColors.gold,
        onRefresh: notifier.load,
        child: ListView(
          padding: EdgeInsets.all(isMobile ? 12 : AppDimensions.md),
          children: [
            _Header(
              isMobile: isMobile,
              onOpenChats: () => ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Marketplace chats coming soon.')),
              ),
              onSellItem: () => _showSellDialog(context, ref),
            ),
            SizedBox(height: isMobile ? 12 : AppDimensions.md),
            _TabStrip(
              selectedTab: state.selectedTab,
              onSelected: notifier.setTab,
            ),
            SizedBox(height: isMobile ? 12 : AppDimensions.md),
            _FilterBar(
              isMobile: isMobile,
              query: state.query,
              selectedCategory: state.selectedCategory,
              gridView: state.gridView,
              onQueryChanged: notifier.setQuery,
              onCategoryChanged: notifier.setCategory,
              onToggleView: notifier.toggleView,
            ),
            SizedBox(height: isMobile ? 10 : 12),
            Text(
              '${state.filteredListings.length} listing${state.filteredListings.length == 1 ? '' : 's'} found',
              style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary),
            ),
            SizedBox(height: isMobile ? 10 : 12),
            if (state.loading)
              _LoadingList(isMobile: isMobile)
            else if (state.error != null)
              FacultyErrorState(
                message: state.error!,
                onRetry: notifier.load,
              )
            else
              _ListingsView(
                listings: state.filteredListings,
                isMobile: isMobile,
                gridView: state.gridView,
                onToggleSaved: notifier.toggleSaved,
              ),
          ],
        ),
      ),
    );
  }

  void _showSellDialog(BuildContext context, WidgetRef ref) {
    final titleCtrl = TextEditingController();
    final priceCtrl = TextEditingController();
    final descCtrl = TextEditingController();
    String category = 'Books';
    String condition = 'Good';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.cardDark,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheetState) {
          final isMobile = MediaQuery.of(ctx).size.width < 420;
          return Padding(
            padding: EdgeInsets.fromLTRB(16, 16, 16, MediaQuery.of(ctx).viewInsets.bottom + 16),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Sell Item', style: AppTextStyles.heading3),
                  SizedBox(height: isMobile ? 12 : 16),
                  TextField(
                    controller: titleCtrl,
                    style: AppTextStyles.bodyMedium,
                    decoration: const InputDecoration(hintText: 'Item title'),
                  ),
                  SizedBox(height: isMobile ? 10 : 12),
                  TextField(
                    controller: priceCtrl,
                    style: AppTextStyles.bodyMedium,
                    decoration: const InputDecoration(hintText: 'Price (INR)'),
                    keyboardType: TextInputType.number,
                  ),
                  SizedBox(height: isMobile ? 10 : 12),
                  TextField(
                    controller: descCtrl,
                    style: AppTextStyles.bodyMedium,
                    decoration: const InputDecoration(hintText: 'Description'),
                    maxLines: 3,
                  ),
                  SizedBox(height: isMobile ? 10 : 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: marketplaceCategories.where((c) => c != 'All').map((c) {
                      final selected = category == c;
                      return ChoiceChip(
                        label: Text(c),
                        selected: selected,
                        onSelected: (_) => setSheetState(() => category = c),
                        selectedColor: AppColors.gold,
                        labelStyle: AppTextStyles.labelMedium.copyWith(
                          color: selected ? AppColors.bgDark : AppColors.textPrimary,
                        ),
                        backgroundColor: AppColors.surfaceDark,
                      );
                    }).toList(),
                  ),
                  SizedBox(height: isMobile ? 10 : 12),
                  DropdownButtonFormField<String>(
                    initialValue: condition,
                    items: const [
                      DropdownMenuItem(value: 'Like New', child: Text('Like New')),
                      DropdownMenuItem(value: 'Good', child: Text('Good')),
                      DropdownMenuItem(value: 'Fair', child: Text('Fair')),
                    ],
                    onChanged: (v) {
                      if (v != null) setSheetState(() => condition = v);
                    },
                    dropdownColor: AppColors.cardDark,
                    decoration: const InputDecoration(labelText: 'Condition'),
                  ),
                  SizedBox(height: isMobile ? 14 : 18),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () async {
                        final title = titleCtrl.text.trim();
                        final price = double.tryParse(priceCtrl.text.trim());
                        final desc = descCtrl.text.trim();
                        if (title.isEmpty || price == null) return;

                        await ref.read(marketplaceProvider.notifier).addListing({
                          'title': title,
                          'description': desc,
                          'price': price,
                          'category': category,
                          'condition': condition,
                          'sellerName': 'You',
                        });

                        if (ctx.mounted) Navigator.pop(ctx);
                      },
                      child: const Text('POST LISTING'),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class _Header extends StatelessWidget {
  final bool isMobile;
  final VoidCallback onOpenChats;
  final VoidCallback onSellItem;

  const _Header({
    required this.isMobile,
    required this.onOpenChats,
    required this.onSellItem,
  });

  @override
  Widget build(BuildContext context) {
    return FacultyCard(
      child: isMobile
          ? Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 38,
                      height: 38,
                      decoration: BoxDecoration(
                        color: AppColors.gold.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(AppDimensions.borderRadiusMd),
                      ),
                      child: const Icon(Icons.shopping_bag_outlined, color: AppColors.gold),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Campus Marketplace',
                            style: AppTextStyles.heading2.copyWith(fontSize: 22),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          Text(
                            'Buy & Sell within PEC',
                            style: AppTextStyles.bodySmall,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: onOpenChats,
                        icon: const Icon(Icons.chat_bubble_outline, size: 18),
                        label: const Text('Chats'),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: onSellItem,
                        icon: const Icon(Icons.add, size: 18),
                        label: const Text('Sell Item'),
                      ),
                    ),
                  ],
                ),
              ],
            )
          : Row(
              children: [
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    color: AppColors.gold.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(AppDimensions.borderRadiusMd),
                  ),
                  child: const Icon(Icons.shopping_bag_outlined, color: AppColors.gold),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Campus Marketplace', style: AppTextStyles.heading2.copyWith(fontSize: 30)),
                      Text('Buy & Sell within PEC', style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary)),
                    ],
                  ),
                ),
                OutlinedButton.icon(
                  onPressed: onOpenChats,
                  icon: const Icon(Icons.chat_bubble_outline, size: 18),
                  label: const Text('Chats'),
                ),
                const SizedBox(width: 8),
                ElevatedButton.icon(
                  onPressed: onSellItem,
                  icon: const Icon(Icons.add, size: 18),
                  label: const Text('Sell Item'),
                ),
              ],
            ),
    );
  }
}

class _TabStrip extends StatelessWidget {
  final int selectedTab;
  final ValueChanged<int> onSelected;

  const _TabStrip({required this.selectedTab, required this.onSelected});

  @override
  Widget build(BuildContext context) {
    const tabs = ['Browse', 'My Listings', 'Saved'];

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: List.generate(tabs.length, (i) {
          final selected = selectedTab == i;
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: ChoiceChip(
              label: Text(tabs[i]),
              selected: selected,
              onSelected: (_) => Future.microtask(() => onSelected(i)),
              selectedColor: AppColors.gold.withValues(alpha: 0.2),
              backgroundColor: AppColors.surfaceDark,
              labelStyle: AppTextStyles.labelMedium.copyWith(
                color: selected ? AppColors.gold : AppColors.textSecondary,
              ),
              side: BorderSide(color: selected ? AppColors.gold : AppColors.borderDark),
            ),
          );
        }),
      ),
    );
  }
}

class _FilterBar extends StatelessWidget {
  final bool isMobile;
  final String query;
  final String selectedCategory;
  final bool gridView;
  final ValueChanged<String> onQueryChanged;
  final ValueChanged<String> onCategoryChanged;
  final VoidCallback onToggleView;

  const _FilterBar({
    required this.isMobile,
    required this.query,
    required this.selectedCategory,
    required this.gridView,
    required this.onQueryChanged,
    required this.onCategoryChanged,
    required this.onToggleView,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: TextField(
                onChanged: onQueryChanged,
                style: AppTextStyles.bodyMedium,
                decoration: InputDecoration(
                  hintText: 'Search listings...',
                  prefixIcon: const Icon(Icons.search, size: 20),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  filled: true,
                  fillColor: AppColors.cardDark,
                  border: OutlineInputBorder(
                    borderSide: BorderSide(color: AppColors.borderDark),
                    borderRadius: BorderRadius.circular(AppDimensions.borderRadiusMd),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            SizedBox(
              height: 44,
              width: 44,
              child: OutlinedButton(
                onPressed: () => Future.microtask(onToggleView),
                style: OutlinedButton.styleFrom(padding: EdgeInsets.zero),
                child: Icon(
                  gridView ? Icons.view_list_outlined : Icons.grid_view_rounded,
                  size: 20,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: marketplaceCategories.map((category) {
              final selected = selectedCategory == category;
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: ChoiceChip(
                  label: Text(category),
                  selected: selected,
                  onSelected: (_) => Future.microtask(() => onCategoryChanged(category)),
                  selectedColor: AppColors.gold.withValues(alpha: 0.2),
                  backgroundColor: AppColors.surfaceDark,
                  labelStyle: AppTextStyles.labelMedium.copyWith(
                    color: selected ? AppColors.gold : AppColors.textSecondary,
                  ),
                  side: BorderSide(
                    color: selected ? AppColors.gold : AppColors.borderDark,
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }
}

class _ListingsView extends StatelessWidget {
  final List<Map<String, dynamic>> listings;
  final bool isMobile;
  final bool gridView;
  final ValueChanged<String> onToggleSaved;

  const _ListingsView({
    required this.listings,
    required this.isMobile,
    required this.gridView,
    required this.onToggleSaved,
  });

  @override
  Widget build(BuildContext context) {
    if (listings.isEmpty) {
      return const FacultyEmptyState(
        title: 'No listings found',
        description: 'Try adjusting your filters or search query',
        icon: Icons.shopping_bag_outlined,
      );
    }

    if (!gridView || isMobile) {
      return ListView.separated(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: listings.length,
        separatorBuilder: (_, _) => const SizedBox(height: 10),
        itemBuilder: (_, i) => _ListingCard(
          listing: listings[i],
          compact: isMobile,
          onToggleSaved: () => onToggleSaved((listings[i]['id'] ?? '').toString()),
        ),
      );
    }

    final width = MediaQuery.of(context).size.width;
    final crossAxisCount = width >= 1200 ? 4 : 3;
    
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: listings.length,
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: crossAxisCount,
        mainAxisSpacing: 10,
        crossAxisSpacing: 10,
        childAspectRatio: 1.34,
      ),
      itemBuilder: (_, i) => _ListingCard(
        listing: listings[i],
        onToggleSaved: () => onToggleSaved((listings[i]['id'] ?? '').toString()),
      ),
    );
  }
}

class _ListingCard extends StatelessWidget {
  final Map<String, dynamic> listing;
  final bool compact;
  final VoidCallback onToggleSaved;

  const _ListingCard({
    required this.listing,
    required this.onToggleSaved,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    final title = (listing['title'] ?? 'Item').toString();
    final description = (listing['description'] ?? '').toString();
    final category = (listing['category'] ?? 'Other').toString();
    final condition = (listing['condition'] ?? 'Good').toString();
    final sellerName = (listing['sellerName'] ?? 'Seller').toString();
    final isSaved = (listing['isSaved'] as bool?) ?? false;
    final isMine = (listing['isMine'] as bool?) ?? false;
    final price = _toDouble(listing['price']);

    final postedAtRaw = listing['postedAt']?.toString();
    String postedText = '-';
    if (postedAtRaw != null) {
      try {
        postedText = DateFormat('dd MMM').format(DateTime.parse(postedAtRaw));
      } catch (_) {}
    }

    return FacultyCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(
                  title,
                  style: AppTextStyles.labelLarge.copyWith(fontSize: compact ? 13 : 14),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 8),
              IconButton(
                onPressed: () => Future.microtask(onToggleSaved),
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
                icon: Icon(
                  isSaved ? Icons.favorite : Icons.favorite_border,
                  color: isSaved ? AppColors.error : AppColors.textMuted,
                  size: 18,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            '₹${price.toStringAsFixed(0)}',
            style: AppTextStyles.heading3.copyWith(
              color: AppColors.gold,
              fontSize: compact ? 18 : 20,
            ),
          ),
          const SizedBox(height: 6),
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: [
              FacultyBadge(label: category, variant: BadgeVariant.outline),
              FacultyBadge(label: condition, variant: BadgeVariant.secondary),
              if (isMine) const FacultyBadge(label: 'Mine', variant: BadgeVariant.success),
            ],
          ),
          if (description.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(
              description,
              style: AppTextStyles.bodySmall,
              maxLines: compact ? 2 : 3,
              overflow: TextOverflow.ellipsis,
            ),
          ],
          const Spacer(),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: Text(
                  'By $sellerName',
                  style: AppTextStyles.caption,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Text(postedText, style: AppTextStyles.caption),
            ],
          ),
        ],
      ),
    );
  }

  double _toDouble(dynamic value) {
    if (value is num) return value.toDouble();
    return double.tryParse(value?.toString() ?? '') ?? 0;
  }
}

class _LoadingList extends StatelessWidget {
  final bool isMobile;
  const _LoadingList({required this.isMobile});

  @override
  Widget build(BuildContext context) {
    return FacultyShimmer(
      child: ListView.separated(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: 6,
        separatorBuilder: (_, _) => const SizedBox(height: 10),
        itemBuilder: (_, _) => ShimmerBox(height: isMobile ? 130 : 150),
      ),
    );
  }
}
