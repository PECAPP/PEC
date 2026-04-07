import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/pec_empty_state.dart';
import '../../../../shared/widgets/pec_shimmer.dart';
import '../../data/models/canteen_models.dart';
import '../providers/canteen_provider.dart';

enum _NightCanteenView { menu, orders }

class CanteenMenuScreen extends ConsumerStatefulWidget {
  const CanteenMenuScreen({super.key});

  @override
  ConsumerState<CanteenMenuScreen> createState() => _CanteenMenuScreenState();
}

class _CanteenMenuScreenState extends ConsumerState<CanteenMenuScreen> {
  _NightCanteenView _view = _NightCanteenView.menu;
  String _search = '';
  String _selectedCategory = 'all';

  @override
  Widget build(BuildContext context) {
    final cart = ref.watch(cartProvider);
    final cartCount = cart.values.fold<int>(0, (sum, entry) => sum + entry.qty);
    final cartTotal = ref.read(cartProvider.notifier).total;

    return Scaffold(
      backgroundColor: const Color(0xFF1B160D),
      body: SafeArea(
        child: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Color(0xFF2A210D),
                Color(0xFF1E180F),
                Color(0xFF15110A),
              ],
            ),
          ),
          child: LayoutBuilder(
            builder: (context, constraints) {
              final isWide = constraints.maxWidth >= 1000;
              final contentWidth = isWide ? 1280.0 : constraints.maxWidth;

              return Center(
                child: ConstrainedBox(
                  constraints: BoxConstraints(maxWidth: contentWidth),
                  child: Padding(
                    padding: EdgeInsets.fromLTRB(
                      isWide ? 30 : 16,
                      14,
                      isWide ? 30 : 16,
                      14,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _HeaderBar(
                          wide: isWide,
                          view: _view,
                          onViewChanged: (view) => setState(() => _view = view),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Late night cravings sorted! Ordered straight to your room.',
                          style: AppTextStyles.bodySmall.copyWith(
                            color: AppColors.textSecondaryDark,
                          ),
                        ),
                        const SizedBox(height: AppDimensions.md),
                        Expanded(
                          child: _view == _NightCanteenView.menu
                              ? _MenuLayout(
                                  wide: isWide,
                                  search: _search,
                                  selectedCategory: _selectedCategory,
                                  onSearchChanged: (value) => setState(
                                      () => _search = value.toLowerCase()),
                                  onCategoryChanged: (value) =>
                                      setState(() => _selectedCategory = value),
                                  cartCount: cartCount,
                                  cartTotal: cartTotal,
                                )
                              : const _OrdersLayout(),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}

class _HeaderBar extends StatelessWidget {
  final bool wide;
  final _NightCanteenView view;
  final ValueChanged<_NightCanteenView> onViewChanged;

  const _HeaderBar({
    required this.wide,
    required this.view,
    required this.onViewChanged,
  });

  @override
  Widget build(BuildContext context) {
    final menuActive = view == _NightCanteenView.menu;
    final ordersActive = view == _NightCanteenView.orders;

    return LayoutBuilder(
      builder: (context, constraints) {
        final compact = constraints.maxWidth < 720;

        if (compact) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(Icons.restaurant_outlined,
                      color: AppColors.yellow, size: 24),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Night Canteen',
                      style: AppTextStyles.heading2.copyWith(
                        color: AppColors.white,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                'Late night cravings sorted! Ordered straight to your room.',
                style: AppTextStyles.bodySmall.copyWith(
                  color: AppColors.textSecondaryDark,
                ),
              ),
              const SizedBox(height: AppDimensions.sm),
              Align(
                alignment: Alignment.centerRight,
                child: _ModeSwitch(
                  menuActive: menuActive,
                  ordersActive: ordersActive,
                  onMenu: () => onViewChanged(_NightCanteenView.menu),
                  onOrders: () => onViewChanged(_NightCanteenView.orders),
                  compact: true,
                ),
              ),
            ],
          );
        }

        return Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Icon(Icons.restaurant_outlined,
                color: AppColors.yellow, size: 24),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Night Canteen',
                    style: AppTextStyles.heading2.copyWith(
                      color: AppColors.white,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 2),
                  if (!wide)
                    Text(
                      'Menu and orders',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.textSecondaryDark,
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            _ModeSwitch(
              menuActive: menuActive,
              ordersActive: ordersActive,
              onMenu: () => onViewChanged(_NightCanteenView.menu),
              onOrders: () => onViewChanged(_NightCanteenView.orders),
            ),
          ],
        );
      },
    );
  }
}

class _ModeSwitch extends StatelessWidget {
  final bool menuActive;
  final bool ordersActive;
  final VoidCallback onMenu;
  final VoidCallback onOrders;
  final bool compact;

  const _ModeSwitch({
    required this.menuActive,
    required this.ordersActive,
    required this.onMenu,
    required this.onOrders,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF3A2E1B),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: const Color(0xFF4D4028)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _SwitchButton(
            label: 'Menu',
            active: menuActive,
            onTap: onMenu,
            compact: compact,
          ),
          _SwitchButton(
            label: 'My Orders',
            active: ordersActive,
            onTap: onOrders,
            compact: compact,
          ),
        ],
      ),
    );
  }
}

class _SwitchButton extends StatelessWidget {
  final String label;
  final bool active;
  final VoidCallback onTap;
  final bool compact;

  const _SwitchButton({
    required this.label,
    required this.active,
    required this.onTap,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.symmetric(
          horizontal: compact ? 12 : 16,
          vertical: compact ? 8 : 10,
        ),
        decoration: BoxDecoration(
          color: active ? const Color(0xFF5A4A2B) : Colors.transparent,
          borderRadius: BorderRadius.circular(3),
        ),
        child: Text(
          label,
          style: AppTextStyles.labelSmall.copyWith(
            color: AppColors.white,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }
}

class _MenuLayout extends ConsumerWidget {
  final bool wide;
  final String search;
  final String selectedCategory;
  final ValueChanged<String> onSearchChanged;
  final ValueChanged<String> onCategoryChanged;
  final int cartCount;
  final double cartTotal;

  const _MenuLayout({
    required this.wide,
    required this.search,
    required this.selectedCategory,
    required this.onSearchChanged,
    required this.onCategoryChanged,
    required this.cartCount,
    required this.cartTotal,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final itemsAsync = ref.watch(canteenItemsProvider);
    final width = MediaQuery.of(context).size.width;
    final columns = width >= 1200
        ? 3
        : width >= 720
            ? 2
            : 1;

    if (wide) {
      return Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: 7,
            child: _MenuPane(
              search: search,
              selectedCategory: selectedCategory,
              onSearchChanged: onSearchChanged,
              onCategoryChanged: onCategoryChanged,
              itemsAsync: itemsAsync,
              columns: columns,
            ),
          ),
          const SizedBox(width: 20),
          SizedBox(
            width: 360,
            child: _CartPanel(
              cartCount: cartCount,
              cartTotal: cartTotal,
              wide: true,
            ),
          ),
        ],
      );
    }

    return ListView(
      children: [
        _MenuPane(
          search: search,
          selectedCategory: selectedCategory,
          onSearchChanged: onSearchChanged,
          onCategoryChanged: onCategoryChanged,
          itemsAsync: itemsAsync,
          columns: columns,
        ),
        const SizedBox(height: AppDimensions.md),
        SizedBox(
          height: 480,
          child: _CartPanel(
            cartCount: cartCount,
            cartTotal: cartTotal,
            wide: false,
          ),
        ),
      ],
    );
  }
}

class _MenuPane extends ConsumerWidget {
  final String search;
  final String selectedCategory;
  final ValueChanged<String> onSearchChanged;
  final ValueChanged<String> onCategoryChanged;
  final AsyncValue<List<CanteenItem>> itemsAsync;
  final int columns;

  const _MenuPane({
    required this.search,
    required this.selectedCategory,
    required this.onSearchChanged,
    required this.onCategoryChanged,
    required this.itemsAsync,
    required this.columns,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        LayoutBuilder(
          builder: (context, constraints) {
            final compact = constraints.maxWidth < 720;

            if (compact) {
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _SearchField(onChanged: onSearchChanged),
                  const SizedBox(height: AppDimensions.sm),
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        for (final category in _categories) ...[
                          _FilterChip(
                            label: category.label.toUpperCase(),
                            active: selectedCategory == category.id,
                            onTap: () => onCategoryChanged(category.id),
                          ),
                          const SizedBox(width: 8),
                        ],
                      ],
                    ),
                  ),
                ],
              );
            }

            return Row(
              children: [
                Expanded(
                  child: _SearchField(onChanged: onSearchChanged),
                ),
                const SizedBox(width: AppDimensions.sm),
                Flexible(
                  child: Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    alignment: WrapAlignment.end,
                    children: [
                      for (final category in _categories)
                        _FilterChip(
                          label: category.label.toUpperCase(),
                          active: selectedCategory == category.id,
                          onTap: () => onCategoryChanged(category.id),
                        ),
                    ],
                  ),
                ),
              ],
            );
          },
        ),
        const SizedBox(height: AppDimensions.md),
        itemsAsync.when(
          loading: () => _MenuSkeletonGrid(columns: columns),
          error: (e, _) => _LoadState(
            message: 'Could not load menu right now.',
            onRetry: () => ref.invalidate(canteenItemsProvider),
          ),
          data: (items) {
            final filtered = items.where((item) {
              final category = _mapCategory(item.category);
              final categoryMatch =
                  selectedCategory == 'all' || category == selectedCategory;
              final searchMatch = search.isEmpty ||
                  item.name.toLowerCase().contains(search) ||
                  (item.description?.toLowerCase().contains(search) ?? false);
              return categoryMatch && searchMatch && item.isAvailable;
            }).toList();

            if (filtered.isEmpty) {
              return const PecEmptyState(
                icon: Icons.restaurant_menu_outlined,
                title: 'No items found',
                subtitle: 'Try a different search or category',
              );
            }

            return GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: columns,
                crossAxisSpacing: AppDimensions.md,
                mainAxisSpacing: AppDimensions.md,
                childAspectRatio: columns >= 2 ? 1.08 : 1.34,
              ),
              itemCount: filtered.length,
              itemBuilder: (_, index) => _MenuCard(item: filtered[index]),
            );
          },
        ),
      ],
    );
  }
}

class _SearchField extends StatelessWidget {
  final ValueChanged<String> onChanged;
  const _SearchField({required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return TextField(
      onChanged: onChanged,
      decoration: InputDecoration(
        hintText: 'Search for items...',
        hintStyle: AppTextStyles.bodySmall.copyWith(
          color: AppColors.textSecondaryDark,
        ),
        prefixIcon: const Icon(Icons.search,
            size: 20, color: AppColors.textSecondaryDark),
        filled: true,
        fillColor: const Color(0xFF1C1610),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(4),
          borderSide: const BorderSide(color: Color(0xFF2E271C), width: 1),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(4),
          borderSide: const BorderSide(color: Color(0xFF2E271C), width: 1),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(4),
          borderSide: const BorderSide(color: AppColors.yellow, width: 1.5),
        ),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      ),
      style: AppTextStyles.bodySmall.copyWith(color: AppColors.white),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool active;
  final VoidCallback onTap;

  const _FilterChip({
    required this.label,
    required this.active,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: active ? AppColors.yellow : const Color(0xFF211A14),
          border: Border.all(
            color: active ? AppColors.yellow : const Color(0xFF372D20),
            width: 1,
          ),
          borderRadius: BorderRadius.circular(3),
        ),
        child: Text(
          label,
          style: AppTextStyles.labelSmall.copyWith(
            color: active ? AppColors.black : AppColors.white,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }
}

class _MenuCard extends ConsumerWidget {
  final CanteenItem item;
  const _MenuCard({required this.item});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cart = ref.watch(cartProvider);
    final qty = cart[item.id]?.qty ?? 0;
    final initial = item.name.trim().isEmpty
        ? '??'
        : item.name
            .trim()
            .split(RegExp(r'\s+'))
            .take(2)
            .map((e) => e.isEmpty ? '' : e[0])
            .join()
            .toUpperCase();

    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF2A241B),
        border: Border.all(color: const Color(0xFF3E3426), width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Expanded(
            child: Container(
              color: item.previewColor,
              alignment: Alignment.center,
              child: Text(
                initial,
                style: AppTextStyles.heading2.copyWith(
                  color: AppColors.black,
                  fontSize: 72,
                  fontWeight: FontWeight.w300,
                ),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Text(
                        item.name,
                        style: AppTextStyles.labelLarge.copyWith(
                          color: AppColors.white,
                          fontSize: 16,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      '₹${item.price.toStringAsFixed(0)}',
                      style: AppTextStyles.labelLarge.copyWith(
                        color: AppColors.yellow,
                        fontSize: 16,
                      ),
                    ),
                  ],
                ),
                if (item.description != null &&
                    item.description!.isNotEmpty) ...[
                  const SizedBox(height: 2),
                  Text(
                    item.description!,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AppTextStyles.caption.copyWith(
                      color: AppColors.textSecondaryDark,
                    ),
                  ),
                ],
                const SizedBox(height: 10),
                GestureDetector(
                  onTap: () => ref.read(cartProvider.notifier).add(item),
                  child: Container(
                    height: 36,
                    decoration: BoxDecoration(
                      color: const Color(0xFF1F1B14),
                      border:
                          Border.all(color: const Color(0xFF2D271D), width: 1),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        if (qty == 0) ...[
                          const Icon(Icons.add,
                              size: 16, color: AppColors.white),
                          const SizedBox(width: 10),
                          Text('Add to Cart',
                              style: AppTextStyles.labelSmall
                                  .copyWith(color: AppColors.white)),
                        ] else ...[
                          _QtyButton(
                              icon: Icons.remove,
                              onTap: () => ref
                                  .read(cartProvider.notifier)
                                  .remove(item.id)),
                          const SizedBox(width: 10),
                          Text(
                            '$qty',
                            style: AppTextStyles.labelSmall
                                .copyWith(color: AppColors.white),
                          ),
                          const SizedBox(width: 10),
                          _QtyButton(
                              icon: Icons.add,
                              onTap: () =>
                                  ref.read(cartProvider.notifier).add(item)),
                        ],
                      ],
                    ),
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

class _QtyButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;

  const _QtyButton({required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 22,
        height: 22,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: AppColors.yellow,
          borderRadius: BorderRadius.circular(2),
        ),
        child: Icon(icon, size: 14, color: AppColors.black),
      ),
    );
  }
}

class _CartPanel extends ConsumerWidget {
  final int cartCount;
  final double cartTotal;
  final bool wide;

  const _CartPanel({
    required this.cartCount,
    required this.cartTotal,
    required this.wide,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cart = ref.watch(cartProvider);
    final cartNotifier = ref.read(cartProvider.notifier);
    final orderAsync = ref.watch(orderNotifierProvider);

    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF2C251A),
        border: Border.all(color: const Color(0xFF3D3424), width: 1),
        borderRadius: BorderRadius.circular(3),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: double.infinity,
            decoration: const BoxDecoration(
              border:
                  Border(top: BorderSide(color: AppColors.yellow, width: 4)),
            ),
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
            child: Row(
              children: [
                const Icon(Icons.shopping_bag_outlined,
                    color: AppColors.yellow, size: 18),
                const SizedBox(width: 8),
                Text(
                  'Your Cart',
                  style: AppTextStyles.heading3.copyWith(
                    color: AppColors.white,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: Color(0xFF4A3F2A)),
          Expanded(
            child: cart.isEmpty
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 58,
                            height: 58,
                            decoration: BoxDecoration(
                              color: const Color(0xFF4B3E28),
                              borderRadius: BorderRadius.circular(3),
                            ),
                            child: const Icon(Icons.shopping_bag_outlined,
                                color: Color(0xFF8B7A5C), size: 30),
                          ),
                          const SizedBox(height: 14),
                          Text(
                            'Hungry?',
                            style: AppTextStyles.labelLarge
                                .copyWith(color: AppColors.white),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Your cart is as empty as your stomach!',
                            textAlign: TextAlign.center,
                            style: AppTextStyles.bodySmall.copyWith(
                              color: AppColors.textSecondaryDark,
                            ),
                          ),
                        ],
                      ),
                    ),
                  )
                : ListView(
                    padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
                    children: [
                      for (final entry in cart.values) ...[
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              child: Text(
                                entry.item.name,
                                style: AppTextStyles.bodySmall.copyWith(
                                  color: AppColors.white,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Text(
                              '₹${entry.subtotal.toStringAsFixed(0)}',
                              style: AppTextStyles.bodySmall.copyWith(
                                  color: AppColors.yellow,
                                  fontWeight: FontWeight.w700),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Container(
                          height: 32,
                          decoration: BoxDecoration(
                            color: const Color(0xFF201B13),
                            border: Border.all(color: const Color(0xFF31291D)),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              _QtyButton(
                                  icon: Icons.remove,
                                  onTap: () =>
                                      cartNotifier.remove(entry.item.id)),
                              Container(
                                width: 30,
                                height: double.infinity,
                                alignment: Alignment.center,
                                color: AppColors.yellow,
                                child: Text(
                                  '${entry.qty}',
                                  style: AppTextStyles.labelSmall
                                      .copyWith(color: AppColors.black),
                                ),
                              ),
                              _QtyButton(
                                  icon: Icons.add,
                                  onTap: () => cartNotifier.add(entry.item)),
                            ],
                          ),
                        ),
                        const SizedBox(height: 12),
                      ],
                    ],
                  ),
          ),
          const Divider(height: 1, color: Color(0xFF4A3F2A)),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('TOTAL',
                        style: AppTextStyles.labelLarge
                            .copyWith(color: AppColors.white)),
                    Text(
                      '₹${cartTotal.toStringAsFixed(0)}',
                      style: AppTextStyles.heading2.copyWith(
                        color: AppColors.yellow,
                        fontSize: 28,
                      ),
                    ),
                  ],
                ),
                if (orderAsync is AsyncError) ...[
                  const SizedBox(height: 10),
                  Text(
                    orderAsync.error.toString(),
                    style:
                        AppTextStyles.bodySmall.copyWith(color: AppColors.red),
                  ),
                ],
                const SizedBox(height: 14),
                if (orderAsync.value != null)
                  _OrderConfirmation(order: orderAsync.value!)
                else
                  GestureDetector(
                    onTap: cartCount == 0 || orderAsync.isLoading
                        ? null
                        : () => ref
                            .read(orderNotifierProvider.notifier)
                            .placeOrder(),
                    child: Container(
                      width: double.infinity,
                      height: 48,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: AppColors.yellow,
                        border: Border.all(color: AppColors.black, width: 2),
                      ),
                      child: orderAsync.isLoading
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: AppColors.black,
                              ),
                            )
                          : Text(
                              'PLACE ORDER',
                              style: AppTextStyles.labelLarge
                                  .copyWith(color: AppColors.black),
                            ),
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

class _OrdersLayout extends ConsumerWidget {
  const _OrdersLayout();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ordersAsync = ref.watch(canteenOrdersProvider);

    return ordersAsync.when(
      loading: () => ListView.separated(
        padding: const EdgeInsets.all(AppDimensions.md),
        itemCount: 4,
        separatorBuilder: (_, __) => const SizedBox(height: AppDimensions.sm),
        itemBuilder: (_, __) =>
            const PecShimmerBox(height: 100, width: double.infinity),
      ),
      error: (e, _) => Center(
        child: _LoadState(
          message: 'Could not load your orders right now.',
          onRetry: () => ref.invalidate(canteenOrdersProvider),
        ),
      ),
      data: (orders) {
        if (orders.isEmpty) {
          return const Center(
            child: PecEmptyState(
              icon: Icons.receipt_long_outlined,
              title: 'No orders yet',
              subtitle: 'Place an order from the Menu tab',
            ),
          );
        }

        return ListView.separated(
          padding: const EdgeInsets.all(AppDimensions.md),
          itemCount: orders.length,
          separatorBuilder: (_, __) => const SizedBox(height: AppDimensions.sm),
          itemBuilder: (_, i) => _OrderCard(order: orders[i]),
        );
      },
    );
  }
}

class _OrderCard extends StatelessWidget {
  final CanteenOrder order;
  const _OrderCard({required this.order});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF2A241B),
        border: Border.all(color: const Color(0xFF3E3527), width: 1),
      ),
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                color: AppColors.yellow,
                child: Text(
                  order.tokenNumber,
                  style:
                      AppTextStyles.labelLarge.copyWith(color: AppColors.black),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  '${order.lines.length} item${order.lines.length == 1 ? '' : 's'}',
                  style:
                      AppTextStyles.bodySmall.copyWith(color: AppColors.white),
                ),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                color: order.statusColor,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(order.statusIcon, size: 12, color: AppColors.black),
                    const SizedBox(width: 4),
                    Text(
                      order.status.toUpperCase(),
                      style: AppTextStyles.labelSmall
                          .copyWith(color: AppColors.black),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          for (final line in order.lines)
            Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Row(
                children: [
                  Text(
                    '${line.qty}×',
                    style: AppTextStyles.caption
                        .copyWith(color: AppColors.textSecondaryDark),
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      line.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: AppTextStyles.bodySmall
                          .copyWith(color: AppColors.white),
                    ),
                  ),
                  Text(
                    '₹${(line.price * line.qty).toStringAsFixed(0)}',
                    style: AppTextStyles.caption
                        .copyWith(color: AppColors.textSecondaryDark),
                  ),
                ],
              ),
            ),
          const Divider(height: 16, color: Color(0xFF4A3F2A)),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                _timeAgo(order.createdAt),
                style: AppTextStyles.caption
                    .copyWith(color: AppColors.textSecondaryDark),
              ),
              Text(
                '₹${order.totalAmount.toStringAsFixed(0)}',
                style:
                    AppTextStyles.labelLarge.copyWith(color: AppColors.yellow),
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _timeAgo(DateTime dt) {
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inHours < 1) return '${diff.inMinutes}m ago';
    if (diff.inDays < 1) return '${diff.inHours}h ago';
    return '${dt.day}/${dt.month}';
  }
}

class _OrderConfirmation extends ConsumerWidget {
  final CanteenOrder order;
  const _OrderConfirmation({required this.order});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Column(
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(AppDimensions.md),
          color: AppColors.green,
          child: Column(
            children: [
              const Icon(Icons.check_circle_outline,
                  size: 32, color: AppColors.black),
              const SizedBox(height: AppDimensions.xs),
              Text('Order Placed!',
                  style: AppTextStyles.labelLarge
                      .copyWith(color: AppColors.black)),
              Text('Token: ${order.tokenNumber}',
                  style: AppTextStyles.heading2
                      .copyWith(color: AppColors.black, fontSize: 28)),
              Text('Show this token at the counter',
                  style:
                      AppTextStyles.bodySmall.copyWith(color: AppColors.black)),
            ],
          ),
        ),
        const SizedBox(height: AppDimensions.md),
        GestureDetector(
          onTap: () {
            ref.read(orderNotifierProvider.notifier).reset();
            ref.read(cartProvider.notifier).clear();
          },
          child: Container(
            width: double.infinity,
            height: 46,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              border: Border.all(color: AppColors.black, width: 2),
              color: AppColors.white,
            ),
            child: Text('CLOSE',
                style:
                    AppTextStyles.labelLarge.copyWith(color: AppColors.black)),
          ),
        ),
      ],
    );
  }
}

class _MenuSkeletonGrid extends StatelessWidget {
  final int columns;
  const _MenuSkeletonGrid({required this.columns});

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: columns,
        crossAxisSpacing: AppDimensions.md,
        mainAxisSpacing: AppDimensions.md,
        childAspectRatio: columns >= 2 ? 1.08 : 1.34,
      ),
      itemCount: 4,
      itemBuilder: (_, __) =>
          const PecShimmerBox(height: 240, width: double.infinity),
    );
  }
}

class _LoadState extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;
  const _LoadState({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            message,
            style: AppTextStyles.bodySmall
                .copyWith(color: AppColors.textSecondaryDark),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppDimensions.sm),
          SizedBox(
            width: 140,
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

class _FilterCategory {
  final String id;
  final String label;

  const _FilterCategory(this.id, this.label);
}

const _categories = [
  _FilterCategory('all', 'All'),
  _FilterCategory('snacks', 'Snacks'),
  _FilterCategory('drinks', 'Drinks'),
  _FilterCategory('meals', 'Meals'),
  _FilterCategory('desserts', 'Desserts'),
];

String _mapCategory(String category) {
  switch (category) {
    case 'breakfast':
      return 'snacks';
    case 'lunch':
      return 'meals';
    case 'dinner':
      return 'meals';
    case 'beverages':
      return 'drinks';
    default:
      return category;
  }
}

extension on CanteenItem {
  Color get previewColor {
    switch (category) {
      case 'snacks':
        return const Color(0xFFD6E8A4);
      case 'drinks':
        return const Color(0xFF4EAFD9);
      case 'meals':
        return const Color(0xFFCC3A2D);
      case 'desserts':
        return const Color(0xFFD7C7B7);
      default:
        return const Color(0xFF9CD900);
    }
  }
}
