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
import '../providers/finance_provider.dart';

class FinanceScreen extends ConsumerWidget {
  const FinanceScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(financeProvider);
    final notifier = ref.read(financeProvider.notifier);
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth < 420;
    final isTablet = screenWidth >= 420 && screenWidth < 900;

    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: const FacultyTopNavBar(),
      body: RefreshIndicator(
        color: AppColors.gold,
        onRefresh: () => notifier.load(),
        child: ListView(
          padding: EdgeInsets.all(isMobile ? 12 : AppDimensions.md),
          children: [
            _FinanceHeader(
              isMobile: isMobile,
              onRefresh: () => notifier.load(),
            ),
            SizedBox(height: isMobile ? 12 : AppDimensions.md),
            _FinanceTabs(
              selectedTab: state.selectedTab,
              onTabSelected: notifier.setTab,
            ),
            SizedBox(height: isMobile ? 12 : AppDimensions.md),
            if (state.loading)
              _FinanceLoading(isMobile: isMobile)
            else if (state.error != null)
              FacultyErrorState(
                message: state.error!,
                onRetry: () => notifier.load(),
              )
            else ...[
              _SummaryGrid(
                pending: state.totalPending,
                paid: state.totalPaid,
                overdue: state.overdueCount,
                paidFeesCount: state.paidFeesCount,
                isMobile: isMobile,
                isTablet: isTablet,
              ),
              SizedBox(height: isMobile ? 12 : AppDimensions.md),
              _FinanceBody(
                selectedTab: state.selectedTab,
                fees: state.fees,
                transactions: state.transactions,
                isMobile: isMobile,
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _FinanceHeader extends StatelessWidget {
  final bool isMobile;
  final VoidCallback onRefresh;

  const _FinanceHeader({
    required this.isMobile,
    required this.onRefresh,
  });

  @override
  Widget build(BuildContext context) {
    return FacultyCard(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: isMobile ? 42 : 48,
            height: isMobile ? 42 : 48,
            decoration: BoxDecoration(
              color: AppColors.gold.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(AppDimensions.borderRadiusMd),
            ),
            child: Icon(
              Icons.account_balance_wallet_outlined,
              color: AppColors.gold,
              size: isMobile ? 22 : 24,
            ),
          ),
          SizedBox(width: isMobile ? 10 : 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Finance',
                  style: isMobile
                      ? AppTextStyles.heading2.copyWith(fontSize: 24)
                      : AppTextStyles.heading2.copyWith(fontSize: 30),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  'Fees, Payments & Transactions',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: AppColors.textSecondary,
                    fontSize: isMobile ? 12 : 14,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          SizedBox(width: isMobile ? 6 : 10),
          IconButton(
            onPressed: onRefresh,
            icon: const Icon(Icons.refresh),
            color: AppColors.textPrimary,
            tooltip: 'Refresh',
            constraints: BoxConstraints(
              minWidth: isMobile ? 36 : 40,
              minHeight: isMobile ? 36 : 40,
            ),
            padding: EdgeInsets.zero,
          ),
        ],
      ),
    );
  }
}

class _FinanceTabs extends StatelessWidget {
  final int selectedTab;
  final ValueChanged<int> onTabSelected;

  const _FinanceTabs({
    required this.selectedTab,
    required this.onTabSelected,
  });

  @override
  Widget build(BuildContext context) {
    final tabs = ['Overview', 'My Fees', 'Transactions'];
    final isMobile = MediaQuery.of(context).size.width < 420;

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: List.generate(tabs.length, (i) {
          final selected = selectedTab == i;
          return Padding(
            padding: EdgeInsets.only(right: i == tabs.length - 1 ? 0 : 8),
            child: ChoiceChip(
              label: Text(tabs[i]),
              selected: selected,
              onSelected: (_) => Future.microtask(() => onTabSelected(i)),
              selectedColor: AppColors.gold.withValues(alpha: 0.2),
              backgroundColor: AppColors.surfaceDark,
              side: BorderSide(
                color: selected ? AppColors.gold : AppColors.borderDark,
              ),
              labelStyle: AppTextStyles.labelMedium.copyWith(
                color: selected ? AppColors.goldLight : AppColors.textSecondary,
                fontSize: isMobile ? 12 : 13,
              ),
              materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
          );
        }),
      ),
    );
  }
}

class _SummaryGrid extends StatelessWidget {
  final double pending;
  final double paid;
  final int overdue;
  final int paidFeesCount;
  final bool isMobile;
  final bool isTablet;

  const _SummaryGrid({
    required this.pending,
    required this.paid,
    required this.overdue,
    required this.paidFeesCount,
    required this.isMobile,
    required this.isTablet,
  });

  @override
  Widget build(BuildContext context) {
    final cards = [
      _SummaryCardData(
        icon: Icons.schedule,
        title: 'Total Pending',
        value: _currency(pending),
        accent: AppColors.warning,
      ),
      _SummaryCardData(
        icon: Icons.check_circle_outline,
        title: 'Total Paid',
        value: _currency(paid),
        accent: const Color(0xFF00B894),
      ),
      _SummaryCardData(
        icon: Icons.warning_amber_outlined,
        title: 'Overdue',
        value: '$overdue fee${overdue == 1 ? '' : 's'}',
        accent: AppColors.error,
      ),
      _SummaryCardData(
        icon: Icons.receipt_long_outlined,
        title: 'Total Paid Fees',
        value: '$paidFeesCount',
        accent: AppColors.info,
      ),
    ];

    final width = MediaQuery.of(context).size.width;
    final columns = isMobile ? 1 : (isTablet ? 2 : 4);
    final itemWidth = isMobile ? double.infinity : ((width - 24 - ((columns - 1) * 12)) / columns);

    return Wrap(
      spacing: 12,
      runSpacing: 12,
      children: cards
          .map((card) => SizedBox(
                width: itemWidth,
                child: _SummaryCard(data: card, isMobile: isMobile),
              ))
          .toList(),
    );
  }

  String _currency(double value) => '₹${value.toStringAsFixed(0)}';
}

class _SummaryCardData {
  final IconData icon;
  final String title;
  final String value;
  final Color accent;

  const _SummaryCardData({
    required this.icon,
    required this.title,
    required this.value,
    required this.accent,
  });
}

class _SummaryCard extends StatelessWidget {
  final _SummaryCardData data;
  final bool isMobile;

  const _SummaryCard({required this.data, required this.isMobile});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(isMobile ? 12 : 14),
      decoration: BoxDecoration(
        color: AppColors.cardDark,
        borderRadius: BorderRadius.circular(AppDimensions.borderRadiusMd),
        border: Border.all(color: data.accent.withValues(alpha: 0.35)),
      ),
      child: Row(
        children: [
          Container(
            width: isMobile ? 36 : 38,
            height: isMobile ? 36 : 38,
            decoration: BoxDecoration(
              color: data.accent.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(AppDimensions.borderRadiusMd),
            ),
            child: Icon(data.icon, color: data.accent, size: isMobile ? 18 : 20),
          ),
          SizedBox(width: isMobile ? 10 : 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  data.title,
                  style: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.textSecondary,
                    fontSize: isMobile ? 11 : 12,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  data.value,
                  style: AppTextStyles.heading3.copyWith(
                    color: data.accent,
                    fontSize: isMobile ? 18 : 20,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _FinanceBody extends StatelessWidget {
  final int selectedTab;
  final List<Map<String, dynamic>> fees;
  final List<Map<String, dynamic>> transactions;
  final bool isMobile;

  const _FinanceBody({
    required this.selectedTab,
    required this.fees,
    required this.transactions,
    required this.isMobile,
  });

  @override
  Widget build(BuildContext context) {
    if (selectedTab == 1) {
      return _FeesList(fees: fees, isMobile: isMobile);
    }
    if (selectedTab == 2) {
      return _TransactionsList(transactions: transactions, isMobile: isMobile);
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _SectionHeading(title: 'Upcoming / Pending Fees'),
        const SizedBox(height: 8),
        _FeesList(
          fees: fees.where((f) {
            final status = (f['status'] ?? '').toString().toLowerCase();
            return status == 'pending' || status == 'overdue';
          }).toList(),
          isMobile: isMobile,
          compact: true,
        ),
        const SizedBox(height: 14),
        _SectionHeading(title: 'Recent Transactions'),
        const SizedBox(height: 8),
        _TransactionsList(
          transactions: transactions.take(4).toList(),
          isMobile: isMobile,
          compact: true,
        ),
      ],
    );
  }
}

class _SectionHeading extends StatelessWidget {
  final String title;
  const _SectionHeading({required this.title});

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: AppTextStyles.labelLarge.copyWith(fontSize: 15),
    );
  }
}

class _FeesList extends StatelessWidget {
  final List<Map<String, dynamic>> fees;
  final bool isMobile;
  final bool compact;

  const _FeesList({
    required this.fees,
    required this.isMobile,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    if (fees.isEmpty) {
      return const FacultyEmptyState(
        title: 'No fees available',
        description: 'You are all caught up.',
        icon: Icons.receipt_long_outlined,
      );
    }

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: compact ? (fees.length > 4 ? 4 : fees.length) : fees.length,
      separatorBuilder: (_, _) => SizedBox(height: compact ? 8 : 10),
      itemBuilder: (_, i) => _FeeCard(fee: fees[i], isMobile: isMobile),
    );
  }
}

class _FeeCard extends StatelessWidget {
  final Map<String, dynamic> fee;
  final bool isMobile;

  const _FeeCard({required this.fee, required this.isMobile});

  @override
  Widget build(BuildContext context) {
    final title = (fee['title'] ?? 'Fee').toString();
    final amount = _toDouble(fee['amount']);
    final status = (fee['status'] ?? 'pending').toString();
    final dueDateRaw = fee['dueDate']?.toString();

    String dueDate = '-';
    if (dueDateRaw != null) {
      try {
        dueDate = DateFormat('dd MMM yyyy').format(DateTime.parse(dueDateRaw));
      } catch (_) {}
    }

    final (BadgeVariant badgeVariant, Color amountColor) = switch (status.toLowerCase()) {
      'paid' => (BadgeVariant.success, const Color(0xFF00B894)),
      'overdue' => (BadgeVariant.error, AppColors.error),
      _ => (BadgeVariant.warning, AppColors.warning),
    };

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
                  style: AppTextStyles.labelLarge.copyWith(
                    fontSize: isMobile ? 13 : 14,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 8),
              FacultyBadge(
                label: status,
                variant: badgeVariant,
              ),
            ],
          ),
          SizedBox(height: isMobile ? 6 : 8),
          Wrap(
            spacing: 10,
            runSpacing: 6,
            children: [
              Text(
                'Amount: ₹${amount.toStringAsFixed(0)}',
                style: AppTextStyles.bodyMedium.copyWith(
                  color: amountColor,
                  fontWeight: FontWeight.w600,
                  fontSize: isMobile ? 12 : 13,
                ),
              ),
              Text(
                'Due: $dueDate',
                style: AppTextStyles.bodySmall.copyWith(
                  color: AppColors.textSecondary,
                  fontSize: isMobile ? 11 : 12,
                ),
              ),
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

class _TransactionsList extends StatelessWidget {
  final List<Map<String, dynamic>> transactions;
  final bool isMobile;
  final bool compact;

  const _TransactionsList({
    required this.transactions,
    required this.isMobile,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    if (transactions.isEmpty) {
      return const FacultyEmptyState(
        title: 'No transactions found',
        description: 'Completed payments will appear here.',
        icon: Icons.swap_horiz,
      );
    }

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: compact
          ? (transactions.length > 4 ? 4 : transactions.length)
          : transactions.length,
      separatorBuilder: (_, _) => SizedBox(height: compact ? 8 : 10),
      itemBuilder: (_, i) => _TransactionCard(
        transaction: transactions[i],
        isMobile: isMobile,
      ),
    );
  }
}

class _TransactionCard extends StatelessWidget {
  final Map<String, dynamic> transaction;
  final bool isMobile;

  const _TransactionCard({required this.transaction, required this.isMobile});

  @override
  Widget build(BuildContext context) {
    final title = (transaction['description'] ?? 'Payment').toString();
    final amount = _toDouble(transaction['amount']);
    final method = (transaction['method'] ?? '-').toString();
    final status = (transaction['status'] ?? 'success').toString();
    final dateRaw = transaction['date']?.toString();

    String date = '-';
    if (dateRaw != null) {
      try {
        date = DateFormat('dd MMM yyyy').format(DateTime.parse(dateRaw));
      } catch (_) {}
    }

    final badgeVariant = switch (status.toLowerCase()) {
      'success' => BadgeVariant.success,
      'failed' => BadgeVariant.error,
      'refunded' => BadgeVariant.secondary,
      _ => BadgeVariant.outline,
    };

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
                  style: AppTextStyles.labelLarge.copyWith(
                    fontSize: isMobile ? 13 : 14,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 8),
              FacultyBadge(label: status, variant: badgeVariant),
            ],
          ),
          SizedBox(height: isMobile ? 6 : 8),
          Wrap(
            spacing: 10,
            runSpacing: 6,
            children: [
              Text(
                '₹${amount.toStringAsFixed(0)}',
                style: AppTextStyles.bodyMedium.copyWith(
                  color: AppColors.info,
                  fontWeight: FontWeight.w700,
                  fontSize: isMobile ? 12 : 13,
                ),
              ),
              Text(
                method,
                style: AppTextStyles.bodySmall.copyWith(
                  color: AppColors.textSecondary,
                  fontSize: isMobile ? 11 : 12,
                ),
              ),
              Text(
                date,
                style: AppTextStyles.bodySmall.copyWith(
                  color: AppColors.textSecondary,
                  fontSize: isMobile ? 11 : 12,
                ),
              ),
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

class _FinanceLoading extends StatelessWidget {
  final bool isMobile;
  const _FinanceLoading({required this.isMobile});

  @override
  Widget build(BuildContext context) {
    return FacultyShimmer(
      child: Column(
        children: List.generate(
          6,
          (_) => Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: ShimmerBox(height: isMobile ? 80 : 90),
          ),
        ),
      ),
    );
  }
}
