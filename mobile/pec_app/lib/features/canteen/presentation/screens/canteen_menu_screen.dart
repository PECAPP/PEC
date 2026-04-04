import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/pec_card.dart';
import '../../../../shared/widgets/pec_empty_state.dart';
import '../../../../shared/widgets/pec_error_state.dart';
import '../../../../shared/widgets/pec_shimmer.dart';
import '../../data/models/canteen_models.dart';
import '../providers/canteen_provider.dart';

class CanteenMenuScreen extends ConsumerStatefulWidget {
  const CanteenMenuScreen({super.key});

  @override
  ConsumerState<CanteenMenuScreen> createState() => _CanteenMenuScreenState();
}

class _CanteenMenuScreenState extends ConsumerState<CanteenMenuScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tab;
  String _search = '';

  static const _categories = [
    'all', 'breakfast', 'lunch', 'snacks', 'beverages', 'dinner'
  ];

  @override
  void initState() {
    super.initState();
    _tab = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tab.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cart = ref.watch(cartProvider);
    final cartCount = cart.values.fold<int>(0, (s, e) => s + e.qty);

    return Scaffold(
      appBar: AppBar(
        title: const Text('CANTEEN'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.invalidate(canteenItemsProvider),
          ),
        ],
        bottom: TabBar(
          controller: _tab,
          labelStyle: AppTextStyles.labelSmall,
          tabs: const [Tab(text: 'MENU'), Tab(text: 'MY ORDERS')],
        ),
      ),
      body: TabBarView(
        controller: _tab,
        children: [
          _MenuTab(search: _search, categories: _categories,
              onSearchChange: (v) => setState(() => _search = v.toLowerCase())),
          const _OrdersTab(),
        ],
      ),
      // Cart FAB
      floatingActionButton: cartCount > 0
          ? FloatingActionButton.extended(
              backgroundColor: AppColors.yellow,
              foregroundColor: AppColors.black,
              onPressed: () => _showCartSheet(context),
              icon: const Icon(Icons.shopping_cart_outlined),
              label: Text('$cartCount item${cartCount > 1 ? 's' : ''} · ₹${ref.read(cartProvider.notifier).total.toStringAsFixed(0)}',
                  style: AppTextStyles.labelSmall),
            )
          : null,
    );
  }

  void _showCartSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) => const _CartSheet(),
    );
  }
}

class _MenuTab extends ConsumerWidget {
  final String search;
  final List<String> categories;
  final ValueChanged<String> onSearchChange;
  const _MenuTab(
      {required this.search,
      required this.categories,
      required this.onSearchChange});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final itemsAsync = ref.watch(canteenItemsProvider);
    final selectedCat = ref.watch(_selectedCatProvider);

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(AppDimensions.md),
          child: Column(
            children: [
              TextField(
                onChanged: onSearchChange,
                decoration: InputDecoration(
                  hintText: 'Search menu…',
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
                  children: categories
                      .map((cat) => Padding(
                            padding: const EdgeInsets.only(right: AppDimensions.xs),
                            child: _Chip(
                              label: cat.toUpperCase(),
                              active: selectedCat == cat,
                              onTap: () => ref
                                  .read(_selectedCatProvider.notifier)
                                  .state = cat,
                            ),
                          ))
                      .toList(),
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: itemsAsync.when(
            loading: () => ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: AppDimensions.md),
              itemCount: 6,
              separatorBuilder: (_, __) =>
                  const SizedBox(height: AppDimensions.sm),
              itemBuilder: (_, __) =>
                  const PecShimmerBox(height: 72, width: double.infinity),
            ),
            error: (e, _) => PecErrorState(
              message: e.toString(),
              onRetry: () => ref.invalidate(canteenItemsProvider),
            ),
            data: (items) {
              final filtered = items.where((item) {
                final matchCat =
                    selectedCat == 'all' || item.category == selectedCat;
                final matchSearch = search.isEmpty ||
                    item.name.toLowerCase().contains(search);
                return matchCat && matchSearch && item.isAvailable;
              }).toList();

              if (filtered.isEmpty) {
                return const PecEmptyState(
                    icon: Icons.restaurant_menu_outlined,
                    title: 'No items found');
              }

              return ListView.separated(
                padding: const EdgeInsets.fromLTRB(AppDimensions.md, 0,
                    AppDimensions.md, 100),
                itemCount: filtered.length,
                separatorBuilder: (_, __) =>
                    const SizedBox(height: AppDimensions.sm),
                itemBuilder: (_, i) => _MenuItemCard(item: filtered[i]),
              );
            },
          ),
        ),
      ],
    );
  }
}

final _selectedCatProvider = StateProvider<String>((_) => 'all');

class _MenuItemCard extends ConsumerWidget {
  final CanteenItem item;
  const _MenuItemCard({required this.item});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cart = ref.watch(cartProvider);
    final cartItem = cart[item.id];
    final qty = cartItem?.qty ?? 0;

    return PecCard(
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            color: item.categoryColor.withValues(alpha: 0.15),
            child: Center(
              child: Icon(
                item.isVeg ? Icons.eco_outlined : Icons.set_meal_outlined,
                color: item.isVeg ? AppColors.green : AppColors.red,
                size: 22,
              ),
            ),
          ),
          const SizedBox(width: AppDimensions.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item.name, style: AppTextStyles.labelLarge),
                if (item.description != null)
                  Text(item.description!,
                      style: AppTextStyles.caption,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 4, vertical: 1),
                      color: item.categoryColor,
                      child: Text(item.category.toUpperCase(),
                          style: AppTextStyles.labelSmall
                              .copyWith(color: AppColors.black, fontSize: 7)),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: AppDimensions.sm),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text('₹${item.price.toStringAsFixed(0)}',
                  style: AppTextStyles.labelLarge),
              const SizedBox(height: 4),
              if (qty == 0)
                GestureDetector(
                  onTap: () =>
                      ref.read(cartProvider.notifier).add(item),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.yellow,
                      border: Border.all(
                          color: AppColors.black, width: 1.5),
                      boxShadow: const [
                        BoxShadow(
                            offset: Offset(2, 2), color: AppColors.black)
                      ],
                    ),
                    child: Text('ADD',
                        style: AppTextStyles.labelSmall
                            .copyWith(color: AppColors.black, fontSize: 10)),
                  ),
                )
              else
                Container(
                  decoration: BoxDecoration(
                    border:
                        Border.all(color: AppColors.black, width: 1.5),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      _QtyBtn(
                          icon: Icons.remove,
                          onTap: () => ref
                              .read(cartProvider.notifier)
                              .remove(item.id)),
                      Container(
                        width: 28,
                        color: AppColors.yellow,
                        child: Text('$qty',
                            style: AppTextStyles.labelSmall
                                .copyWith(color: AppColors.black),
                            textAlign: TextAlign.center),
                      ),
                      _QtyBtn(
                          icon: Icons.add,
                          onTap: () =>
                              ref.read(cartProvider.notifier).add(item)),
                    ],
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class _QtyBtn extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  const _QtyBtn({required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 28,
        height: 28,
        color: AppColors.white,
        child: Icon(icon, size: 14, color: AppColors.black),
      ),
    );
  }
}

// ── Orders Tab ────────────────────────────────────────────────────────────────
class _OrdersTab extends ConsumerWidget {
  const _OrdersTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ordersAsync = ref.watch(canteenOrdersProvider);

    return ordersAsync.when(
      loading: () => ListView.separated(
        padding: const EdgeInsets.all(AppDimensions.md),
        itemCount: 4,
        separatorBuilder: (_, __) =>
            const SizedBox(height: AppDimensions.sm),
        itemBuilder: (_, __) =>
            const PecShimmerBox(height: 100, width: double.infinity),
      ),
      error: (e, _) => PecErrorState(
          message: e.toString(),
          onRetry: () => ref.invalidate(canteenOrdersProvider)),
      data: (orders) {
        if (orders.isEmpty) {
          return const PecEmptyState(
            icon: Icons.receipt_long_outlined,
            title: 'No orders yet',
            subtitle: 'Place an order from the Menu tab',
          );
        }
        return ListView.separated(
          padding: const EdgeInsets.all(AppDimensions.md),
          itemCount: orders.length,
          separatorBuilder: (_, __) =>
              const SizedBox(height: AppDimensions.sm),
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
    return PecCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 10, vertical: 4),
                color: AppColors.yellow,
                child: Text(order.tokenNumber,
                    style: AppTextStyles.labelLarge
                        .copyWith(color: AppColors.black)),
              ),
              const SizedBox(width: AppDimensions.sm),
              Expanded(
                child: Text(
                  '${order.lines.length} item${order.lines.length != 1 ? 's' : ''}',
                  style: AppTextStyles.bodySmall,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 8, vertical: 3),
                color: order.statusColor,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(order.statusIcon,
                        size: 12, color: AppColors.black),
                    const SizedBox(width: 3),
                    Text(order.status.toUpperCase(),
                        style: AppTextStyles.labelSmall.copyWith(
                            color: AppColors.black, fontSize: 9)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: AppDimensions.xs),
          for (final line in order.lines)
            Padding(
              padding: const EdgeInsets.only(bottom: 2),
              child: Row(
                children: [
                  Text('${line.qty}×',
                      style: AppTextStyles.caption
                          .copyWith(color: AppColors.textSecondary)),
                  const SizedBox(width: 4),
                  Expanded(
                      child: Text(line.name,
                          style: AppTextStyles.bodySmall,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis)),
                  Text('₹${(line.price * line.qty).toStringAsFixed(0)}',
                      style: AppTextStyles.caption),
                ],
              ),
            ),
          const Divider(height: 8, color: AppColors.borderLight),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(_timeAgo(order.createdAt),
                  style: AppTextStyles.caption
                      .copyWith(color: AppColors.textSecondary)),
              Text('₹${order.totalAmount.toStringAsFixed(0)}',
                  style: AppTextStyles.labelLarge),
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

// ── Cart Bottom Sheet ─────────────────────────────────────────────────────────
class _CartSheet extends ConsumerWidget {
  const _CartSheet();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cart = ref.watch(cartProvider);
    final cartNotifier = ref.read(cartProvider.notifier);
    final orderAsync = ref.watch(orderNotifierProvider);

    return DraggableScrollableSheet(
      initialChildSize: 0.65,
      minChildSize: 0.4,
      maxChildSize: 0.9,
      expand: false,
      builder: (_, scrollCtrl) => Container(
        decoration: const BoxDecoration(
          color: AppColors.white,
          border:
              Border(top: BorderSide(color: AppColors.black, width: 2)),
        ),
        child: Column(
          children: [
            // Handle
            Container(
              margin: const EdgeInsets.symmetric(vertical: AppDimensions.sm),
              width: 40,
              height: 4,
              color: AppColors.borderLight,
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppDimensions.md),
              child: Row(
                children: [
                  Text('YOUR ORDER', style: AppTextStyles.labelLarge),
                  const Spacer(),
                  TextButton(
                    onPressed: cartNotifier.clear,
                    child: Text('Clear',
                        style: AppTextStyles.bodySmall
                            .copyWith(color: AppColors.red)),
                  ),
                ],
              ),
            ),
            const Divider(color: AppColors.black, height: 1, thickness: 1),
            Expanded(
              child: ListView(
                controller: scrollCtrl,
                padding: const EdgeInsets.all(AppDimensions.md),
                children: cart.values
                    .map((ci) => Padding(
                          padding: const EdgeInsets.only(
                              bottom: AppDimensions.sm),
                          child: Row(
                            children: [
                              Expanded(
                                  child: Text(ci.item.name,
                                      style: AppTextStyles.labelLarge)),
                              Container(
                                decoration: BoxDecoration(
                                  border: Border.all(
                                      color: AppColors.black, width: 1.5),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    _QtyBtn(
                                        icon: Icons.remove,
                                        onTap: () => ref
                                            .read(cartProvider.notifier)
                                            .remove(ci.item.id)),
                                    Container(
                                      width: 30,
                                      color: AppColors.yellow,
                                      child: Text('${ci.qty}',
                                          style: AppTextStyles.labelSmall
                                              .copyWith(color: AppColors.black),
                                          textAlign: TextAlign.center),
                                    ),
                                    _QtyBtn(
                                        icon: Icons.add,
                                        onTap: () => ref
                                            .read(cartProvider.notifier)
                                            .add(ci.item)),
                                  ],
                                ),
                              ),
                              const SizedBox(width: AppDimensions.sm),
                              SizedBox(
                                width: 60,
                                child: Text(
                                    '₹${ci.subtotal.toStringAsFixed(0)}',
                                    style: AppTextStyles.labelLarge,
                                    textAlign: TextAlign.right),
                              ),
                            ],
                          ),
                        ))
                    .toList(),
              ),
            ),
            const Divider(color: AppColors.black, height: 1, thickness: 1),
            Padding(
              padding: const EdgeInsets.all(AppDimensions.md),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('TOTAL', style: AppTextStyles.labelLarge),
                      Text(
                          '₹${cartNotifier.total.toStringAsFixed(0)}',
                          style: AppTextStyles.heading2),
                    ],
                  ),
                  const SizedBox(height: AppDimensions.md),
                  if (orderAsync is AsyncError)
                    Padding(
                      padding: const EdgeInsets.only(bottom: AppDimensions.sm),
                      child: Text(
                        orderAsync.error.toString(),
                        style: AppTextStyles.bodySmall
                            .copyWith(color: AppColors.red),
                      ),
                    ),
                  if (orderAsync.value != null)
                    _OrderConfirmation(order: orderAsync.value!)
                  else
                    GestureDetector(
                      onTap: orderAsync.isLoading
                          ? null
                          : () => ref
                              .read(orderNotifierProvider.notifier)
                              .placeOrder(),
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        decoration: BoxDecoration(
                          color: AppColors.yellow,
                          border:
                              Border.all(color: AppColors.black, width: 2),
                          boxShadow: const [
                            BoxShadow(
                                offset: Offset(4, 4),
                                color: AppColors.black)
                          ],
                        ),
                        child: orderAsync.isLoading
                            ? const Center(
                                child: SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: AppColors.black),
                                ),
                              )
                            : Text('PLACE ORDER',
                                style: AppTextStyles.labelLarge
                                    .copyWith(color: AppColors.black),
                                textAlign: TextAlign.center),
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
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
                  style: AppTextStyles.bodySmall
                      .copyWith(color: AppColors.black)),
            ],
          ),
        ),
        const SizedBox(height: AppDimensions.md),
        GestureDetector(
          onTap: () {
            ref.read(orderNotifierProvider.notifier).reset();
            Navigator.pop(context);
          },
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 12),
            decoration: BoxDecoration(
              border: Border.all(color: AppColors.black, width: 2),
            ),
            child: Text('CLOSE',
                style: AppTextStyles.labelLarge,
                textAlign: TextAlign.center),
          ),
        ),
      ],
    );
  }
}

class _Chip extends StatelessWidget {
  final String label;
  final bool active;
  final VoidCallback onTap;
  const _Chip(
      {required this.label, required this.active, required this.onTap});

  @override
  Widget build(BuildContext context) {
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
