import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../providers/help_support_provider.dart';

class HelpSupportScreen extends ConsumerStatefulWidget {
  const HelpSupportScreen({super.key});

  @override
  ConsumerState<HelpSupportScreen> createState() => _HelpSupportScreenState();
}

class _HelpSupportScreenState extends ConsumerState<HelpSupportScreen> {
  late TextEditingController _searchController;

  @override
  void initState() {
    super.initState();
    _searchController = TextEditingController();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final categories = ref.watch(supportCategoriesProvider);
    final selectedCategory = ref.watch(selectedSupportCategoryProvider);
    final filteredFaqs = ref.watch(filteredFAQsProvider);

    return Scaffold(
      backgroundColor: const Color(0xFF1B160D),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppDimensions.md),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 1000),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  Padding(
                    padding: const EdgeInsets.only(bottom: AppDimensions.lg),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Help & Support',
                          style: AppTextStyles.heading1
                              .copyWith(color: AppColors.white),
                        ),
                        const SizedBox(height: AppDimensions.sm),
                        Text(
                          'Find answers to common questions and get support',
                          style: AppTextStyles.bodyLarge.copyWith(
                              color: AppColors.white.withValues(alpha: 0.7)),
                        ),
                      ],
                    ),
                  ),

                  // Search Bar
                  Container(
                    decoration: BoxDecoration(
                      color: const Color(0xFF1F1B14),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                          color: AppColors.yellow.withValues(alpha: 0.2)),
                    ),
                    child: TextField(
                      controller: _searchController,
                      style: AppTextStyles.bodyLarge
                          .copyWith(color: AppColors.white),
                      decoration: InputDecoration(
                        hintText: 'Search FAQ...',
                        hintStyle: AppTextStyles.bodyLarge
                            .copyWith(color: AppColors.white.withValues(alpha: 0.5)),
                        prefixIcon: Icon(Icons.search,
                            color: AppColors.yellow.withValues(alpha: 0.7)),
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(
                            horizontal: AppDimensions.md,
                            vertical: AppDimensions.sm),
                      ),
                      onChanged: (value) {
                        ref.read(supportSearchProvider.notifier).state = value;
                      },
                    ),
                  ),

                  const SizedBox(height: AppDimensions.lg),

                  // Category Tabs
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        for (final category in categories)
                          Padding(
                            padding:
                                const EdgeInsets.only(right: AppDimensions.sm),
                            child: _CategoryTab(
                              category: category,
                              isSelected: category.id == selectedCategory,
                              onTap: () {
                                ref
                                    .read(selectedSupportCategoryProvider
                                        .notifier)
                                    .state = category.id;
                                ref
                                    .read(supportSearchProvider.notifier)
                                    .state = '';
                                _searchController.clear();
                              },
                            ),
                          ),
                      ],
                    ),
                  ),

                  const SizedBox(height: AppDimensions.lg),

                  // FAQ List
                  if (filteredFaqs.isEmpty)
                    Center(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(
                            vertical: AppDimensions.xxl),
                        child: Column(
                          children: [
                            Icon(Icons.search_off,
                                size: 48,
                                color: AppColors.white.withValues(alpha: 0.3)),
                            const SizedBox(height: AppDimensions.md),
                            Text(
                              'No FAQs found',
                              style: AppTextStyles.bodyLarge.copyWith(
                                  color: AppColors.white.withValues(alpha: 0.5)),
                            ),
                          ],
                        ),
                      ),
                    )
                  else
                    Column(
                      children: [
                        for (final faq in filteredFaqs)
                          Padding(
                            padding: const EdgeInsets.only(
                                bottom: AppDimensions.md),
                            child: _FAQTile(faq: faq),
                          ),
                      ],
                    ),

                  const SizedBox(height: AppDimensions.lg),

                  // Contact Section
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                              width: 4,
                              height: 20,
                              color: AppColors.yellow),
                          const SizedBox(width: AppDimensions.sm),
                          Text(
                            'CONTACT US',
                            style: AppTextStyles.labelLarge
                                .copyWith(color: AppColors.white),
                          ),
                        ],
                      ),
                      const SizedBox(height: AppDimensions.md),
                      _ContactSection(),
                    ],
                  ),

                  const SizedBox(height: AppDimensions.xxl),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _CategoryTab extends StatelessWidget {
  final dynamic category;
  final bool isSelected;
  final VoidCallback onTap;

  const _CategoryTab({
    required this.category,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(6),
      child: Container(
        padding: const EdgeInsets.symmetric(
            horizontal: AppDimensions.md, vertical: AppDimensions.sm),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.yellow
              : const Color(0xFF1F1B14),
          borderRadius: BorderRadius.circular(6),
          border: Border.all(
            color: isSelected
                ? AppColors.yellow
                : AppColors.yellow.withValues(alpha: 0.2),
          ),
        ),
        child: Text(
          category.name,
          style: AppTextStyles.labelLarge.copyWith(
            color: isSelected ? AppColors.black : AppColors.white,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }
}

class _FAQTile extends ConsumerStatefulWidget {
  final dynamic faq;

  const _FAQTile({required this.faq});

  @override
  ConsumerState<_FAQTile> createState() => _FAQTileState();
}

class _FAQTileState extends ConsumerState<_FAQTile> {
  bool _isExpanded = false;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1F1B14),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
            color: AppColors.yellow.withValues(alpha: 0.15)),
      ),
      child: Column(
        children: [
          InkWell(
            onTap: () {
              setState(() => _isExpanded = !_isExpanded);
            },
            borderRadius: BorderRadius.circular(8),
            child: Padding(
              padding: const EdgeInsets.all(AppDimensions.md),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Text(
                      widget.faq.question,
                      style: AppTextStyles.bodyLarge.copyWith(
                          color: AppColors.white,
                          fontWeight: FontWeight.w600),
                    ),
                  ),
                  const SizedBox(width: AppDimensions.md),
                  Icon(
                    _isExpanded
                        ? Icons.expand_less
                        : Icons.expand_more,
                    color: AppColors.yellow,
                    size: 24,
                  ),
                ],
              ),
            ),
          ),
          if (_isExpanded)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(
                  AppDimensions.md, 0, AppDimensions.md, AppDimensions.md),
              decoration: BoxDecoration(
                border: Border(
                  top: BorderSide(
                      color: AppColors.yellow.withValues(alpha: 0.1)),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: AppDimensions.md),
                  Text(
                    widget.faq.answer,
                    style: AppTextStyles.bodyLarge.copyWith(
                      color: AppColors.white.withValues(alpha: 0.8),
                      height: 1.6,
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class _ContactSection extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final contactInfo = ref.watch(contactInfoProvider);

    return LayoutBuilder(
      builder: (context, constraints) {
        final isWide = constraints.maxWidth >= 900;

        return GridView.builder(
          itemCount: contactInfo.length,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: isWide ? 2 : 1,
            mainAxisSpacing: AppDimensions.md,
            crossAxisSpacing: AppDimensions.md,
            childAspectRatio: 2.5,
          ),
          itemBuilder: (context, index) {
            final contact = contactInfo[index];
            IconData icon;

            switch (contact.type) {
              case 'email':
                icon = Icons.email_outlined;
                break;
              case 'phone':
                icon = Icons.phone_outlined;
                break;
              default:
                icon = Icons.language;
            }

            return Container(
              decoration: BoxDecoration(
                color: const Color(0xFF121212),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                    color: AppColors.yellow.withValues(alpha: 0.2)),
              ),
              padding: const EdgeInsets.all(AppDimensions.md),
              child: Row(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: AppColors.yellow.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(icon,
                        color: AppColors.yellow, size: 24),
                  ),
                  const SizedBox(width: AppDimensions.md),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          contact.label,
                          style: AppTextStyles.labelSmall.copyWith(
                              color: AppColors.white.withValues(alpha: 0.7)),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          contact.value,
                          style: AppTextStyles.bodyMedium.copyWith(
                              color: AppColors.yellow,
                              fontWeight: FontWeight.w600),
                        ),
                        if (contact.description != null)
                          Padding(
                            padding: const EdgeInsets.only(top: 2),
                            child: Text(
                              contact.description!,
                              style: AppTextStyles.bodySmall.copyWith(
                                  color:
                                      AppColors.white.withValues(alpha: 0.5)),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }
}
