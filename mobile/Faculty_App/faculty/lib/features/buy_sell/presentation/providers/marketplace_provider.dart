import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../features/auth/presentation/providers/auth_provider.dart';
import '../../data/datasources/marketplace_datasource.dart';

final _marketplaceDataSourceProvider = Provider((ref) {
  return MarketplaceDataSource(ref.read(apiClientProvider));
});

class MarketplaceState {
  final bool loading;
  final String? error;
  final int selectedTab; // 0 browse, 1 mine, 2 saved
  final String query;
  final String selectedCategory;
  final bool gridView;
  final List<Map<String, dynamic>> listings;

  const MarketplaceState({
    this.loading = true,
    this.error,
    this.selectedTab = 0,
    this.query = '',
    this.selectedCategory = 'All',
    this.gridView = true,
    this.listings = const [],
  });

  MarketplaceState copyWith({
    bool? loading,
    String? error,
    int? selectedTab,
    String? query,
    String? selectedCategory,
    bool? gridView,
    List<Map<String, dynamic>>? listings,
  }) {
    return MarketplaceState(
      loading: loading ?? this.loading,
      error: error,
      selectedTab: selectedTab ?? this.selectedTab,
      query: query ?? this.query,
      selectedCategory: selectedCategory ?? this.selectedCategory,
      gridView: gridView ?? this.gridView,
      listings: listings ?? this.listings,
    );
  }

  List<Map<String, dynamic>> get filteredListings {
    final q = query.trim().toLowerCase();

    return listings.where((item) {
      final title = (item['title'] ?? '').toString().toLowerCase();
      final desc = (item['description'] ?? '').toString().toLowerCase();
      final category = (item['category'] ?? 'Other').toString();
      final isMine = (item['isMine'] as bool?) ?? false;
      final isSaved = (item['isSaved'] as bool?) ?? false;

      final matchesTab = switch (selectedTab) {
        1 => isMine,
        2 => isSaved,
        _ => true,
      };
      final matchesQuery = q.isEmpty || title.contains(q) || desc.contains(q);
      final matchesCategory = selectedCategory == 'All' || category == selectedCategory;

      return matchesTab && matchesQuery && matchesCategory;
    }).toList();
  }
}

class MarketplaceNotifier extends StateNotifier<MarketplaceState> {
  final MarketplaceDataSource _ds;

  MarketplaceNotifier(this._ds) : super(const MarketplaceState()) {
    load();
  }

  Future<void> load() async {
    state = state.copyWith(loading: true, error: null);
    try {
      final items = await _ds.getListings();
      state = state.copyWith(
        loading: false,
        listings: items.isEmpty ? _demoListings : items,
      );
    } catch (_) {
      state = state.copyWith(
        loading: false,
        listings: _demoListings,
      );
    }
  }

  void setTab(int value) {
    state = state.copyWith(selectedTab: value);
  }

  void setQuery(String value) {
    state = state.copyWith(query: value);
  }

  void setCategory(String value) {
    state = state.copyWith(selectedCategory: value);
  }

  void toggleView() {
    state = state.copyWith(gridView: !state.gridView);
  }

  void toggleSaved(String id) {
    final updated = state.listings.map((item) {
      if ((item['id'] ?? '').toString() != id) {
        return item;
      }
      final isSaved = (item['isSaved'] as bool?) ?? false;
      return {
        ...item,
        'isSaved': !isSaved,
      };
    }).toList();

    state = state.copyWith(listings: updated);
  }

  Future<void> addListing(Map<String, dynamic> listing) async {
    final newListing = {
      ...listing,
      'id': DateTime.now().millisecondsSinceEpoch.toString(),
      'isMine': true,
      'isSaved': false,
      'postedAt': DateTime.now().toIso8601String(),
    };
    state = state.copyWith(listings: [newListing, ...state.listings]);
  }
}

final marketplaceProvider =
    StateNotifierProvider<MarketplaceNotifier, MarketplaceState>((ref) {
  return MarketplaceNotifier(ref.read(_marketplaceDataSourceProvider));
});

const List<String> marketplaceCategories = [
  'All',
  'Books',
  'Electronics',
  'Furniture',
  'Clothing',
  'Sports',
  'Stationery',
  'Other',
];

const List<Map<String, dynamic>> _demoListings = [
  {
    'id': 'm1',
    'title': 'Engineering Mathematics Vol 2',
    'description': 'Second-hand, highlighted pages, very useful for PEC syllabus.',
    'price': 450,
    'category': 'Books',
    'condition': 'Good',
    'sellerName': 'Aman S.',
    'postedAt': '2026-04-12T11:00:00Z',
    'isSaved': true,
    'isMine': false,
  },
  {
    'id': 'm2',
    'title': 'Scientific Calculator Casio fx-991ES',
    'description': 'Works perfectly. With cover and batteries.',
    'price': 900,
    'category': 'Electronics',
    'condition': 'Like New',
    'sellerName': 'Neha K.',
    'postedAt': '2026-04-10T08:30:00Z',
    'isSaved': false,
    'isMine': false,
  },
  {
    'id': 'm3',
    'title': 'Hostel Study Table',
    'description': 'Foldable wooden table. Pickup from girls hostel gate.',
    'price': 1200,
    'category': 'Furniture',
    'condition': 'Fair',
    'sellerName': 'You',
    'postedAt': '2026-04-09T14:15:00Z',
    'isSaved': false,
    'isMine': true,
  },
  {
    'id': 'm4',
    'title': 'PEC Cricket Kit',
    'description': 'Bat + pads + gloves set, lightly used.',
    'price': 2400,
    'category': 'Sports',
    'condition': 'Good',
    'sellerName': 'Rohit P.',
    'postedAt': '2026-04-08T17:40:00Z',
    'isSaved': true,
    'isMine': false,
  },
  {
    'id': 'm5',
    'title': 'Drawing Instruments Set',
    'description': 'Complete drafter kit for 1st year graphics.',
    'price': 700,
    'category': 'Stationery',
    'condition': 'Like New',
    'sellerName': 'You',
    'postedAt': '2026-04-07T09:20:00Z',
    'isSaved': false,
    'isMine': true,
  },
];
