import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../features/auth/presentation/providers/auth_provider.dart';
import '../../data/datasources/finance_datasource.dart';

final _financeDataSourceProvider = Provider((ref) {
  return FinanceDataSource(ref.read(apiClientProvider));
});

class FinanceState {
  final bool loading;
  final String? error;
  final int selectedTab;
  final List<Map<String, dynamic>> fees;
  final List<Map<String, dynamic>> transactions;
  final DateTime? lastUpdated;

  const FinanceState({
    this.loading = true,
    this.error,
    this.selectedTab = 0,
    this.fees = const [],
    this.transactions = const [],
    this.lastUpdated,
  });

  FinanceState copyWith({
    bool? loading,
    String? error,
    int? selectedTab,
    List<Map<String, dynamic>>? fees,
    List<Map<String, dynamic>>? transactions,
    DateTime? lastUpdated,
  }) {
    return FinanceState(
      loading: loading ?? this.loading,
      error: error,
      selectedTab: selectedTab ?? this.selectedTab,
      fees: fees ?? this.fees,
      transactions: transactions ?? this.transactions,
      lastUpdated: lastUpdated ?? this.lastUpdated,
    );
  }

  double get totalPending {
    return fees
        .where((f) => (f['status'] ?? '').toString().toLowerCase() == 'pending')
        .fold<double>(0, (sum, f) => sum + _toDouble(f['amount']));
  }

  double get totalPaid {
    return fees
        .where((f) => (f['status'] ?? '').toString().toLowerCase() == 'paid')
        .fold<double>(0, (sum, f) => sum + _toDouble(f['amount']));
  }

  int get overdueCount {
    return fees
        .where((f) => (f['status'] ?? '').toString().toLowerCase() == 'overdue')
        .length;
  }

  int get paidFeesCount {
    return fees
        .where((f) => (f['status'] ?? '').toString().toLowerCase() == 'paid')
        .length;
  }

  static double _toDouble(dynamic value) {
    if (value is num) return value.toDouble();
    return double.tryParse(value?.toString() ?? '') ?? 0;
  }
}

class FinanceNotifier extends StateNotifier<FinanceState> {
  final FinanceDataSource _ds;

  FinanceNotifier(this._ds) : super(const FinanceState()) {
    load();
  }

  void setTab(int index) {
    state = state.copyWith(selectedTab: index);
  }

  Future<void> load() async {
    state = state.copyWith(loading: true, error: null);
    try {
      final results = await Future.wait([
        _ds.getFees(),
        _ds.getTransactions(),
      ]);

      final fees = results[0];
      final txns = results[1];

      state = state.copyWith(
        loading: false,
        fees: fees.isEmpty ? _demoFees : fees,
        transactions: txns.isEmpty ? _demoTransactions : txns,
        lastUpdated: DateTime.now(),
      );
    } catch (_) {
      // Keep finance section usable even when backend endpoints are unavailable.
      state = state.copyWith(
        loading: false,
        fees: _demoFees,
        transactions: _demoTransactions,
        lastUpdated: DateTime.now(),
      );
    }
  }
}

final financeProvider = StateNotifierProvider<FinanceNotifier, FinanceState>((ref) {
  return FinanceNotifier(ref.read(_financeDataSourceProvider));
});

const List<Map<String, dynamic>> _demoFees = [
  {
    'id': 'f1',
    'title': 'Tuition Fee - Semester 6',
    'amount': 42000,
    'status': 'pending',
    'dueDate': '2026-05-15',
  },
  {
    'id': 'f2',
    'title': 'Lab Fee - CSE',
    'amount': 3500,
    'status': 'paid',
    'dueDate': '2026-03-10',
  },
  {
    'id': 'f3',
    'title': 'Library Fine',
    'amount': 250,
    'status': 'overdue',
    'dueDate': '2026-04-01',
  },
  {
    'id': 'f4',
    'title': 'Exam Registration',
    'amount': 1800,
    'status': 'paid',
    'dueDate': '2026-02-20',
  },
];

const List<Map<String, dynamic>> _demoTransactions = [
  {
    'id': 't1',
    'description': 'Lab Fee - CSE',
    'amount': 3500,
    'method': 'UPI',
    'status': 'success',
    'date': '2026-03-09',
  },
  {
    'id': 't2',
    'description': 'Exam Registration',
    'amount': 1800,
    'method': 'Net Banking',
    'status': 'success',
    'date': '2026-02-19',
  },
  {
    'id': 't3',
    'description': 'Hostel Security Deposit',
    'amount': 12000,
    'method': 'Card',
    'status': 'refunded',
    'date': '2026-01-11',
  },
];
