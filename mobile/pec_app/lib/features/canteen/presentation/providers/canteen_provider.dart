import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../data/datasources/canteen_remote_datasource.dart';
import '../../data/models/canteen_models.dart';

final canteenDataSourceProvider = Provider<CanteenRemoteDataSource>((ref) =>
    CanteenRemoteDataSource(ref.watch(apiClientProvider)));

final canteenItemsProvider =
    FutureProvider<List<CanteenItem>>((ref) async {
  final ds = ref.watch(canteenDataSourceProvider);
  return ds.getItems();
});

final canteenOrdersProvider =
    FutureProvider<List<CanteenOrder>>((ref) async {
  final ds = ref.watch(canteenDataSourceProvider);
  final orders = await ds.getMyOrders();
  orders.sort((a, b) => b.createdAt.compareTo(a.createdAt));
  return orders;
});

// ── Cart ──────────────────────────────────────────────────────────────────────
class CartNotifier extends StateNotifier<Map<String, CartItem>> {
  CartNotifier() : super({});

  void add(CanteenItem item) {
    final existing = state[item.id];
    state = {
      ...state,
      item.id: CartItem(item: item, qty: (existing?.qty ?? 0) + 1),
    };
  }

  void remove(String itemId) {
    final existing = state[itemId];
    if (existing == null) return;
    if (existing.qty <= 1) {
      final next = Map<String, CartItem>.from(state);
      next.remove(itemId);
      state = next;
    } else {
      state = {
        ...state,
        itemId: existing.copyWith(qty: existing.qty - 1),
      };
    }
  }

  void clear() => state = {};

  double get total =>
      state.values.fold(0, (sum, e) => sum + e.subtotal);

  int get itemCount =>
      state.values.fold(0, (sum, e) => sum + e.qty);
}

final cartProvider =
    StateNotifierProvider<CartNotifier, Map<String, CartItem>>(
  (_) => CartNotifier(),
);

// ── Place order ───────────────────────────────────────────────────────────────
class OrderNotifier extends StateNotifier<AsyncValue<CanteenOrder?>> {
  final CanteenRemoteDataSource _ds;
  final Ref _ref;
  OrderNotifier(this._ds, this._ref) : super(const AsyncValue.data(null));

  Future<void> placeOrder() async {
    final cart = _ref.read(cartProvider);
    if (cart.isEmpty) return;
    state = const AsyncValue.loading();
    try {
      final lines = cart.values
          .map((c) => {'itemId': c.item.id, 'qty': c.qty})
          .toList();
      final order = await _ds.placeOrder(lines);
      _ref.read(cartProvider.notifier).clear();
      _ref.invalidate(canteenOrdersProvider);
      state = AsyncValue.data(order);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  void reset() => state = const AsyncValue.data(null);
}

final orderNotifierProvider =
    StateNotifierProvider<OrderNotifier, AsyncValue<CanteenOrder?>>(
  (ref) => OrderNotifier(ref.watch(canteenDataSourceProvider), ref),
);
