import 'package:flutter/material.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/pec_card.dart';

class ScoreSheetScreen extends StatelessWidget {
  const ScoreSheetScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('FINANCE'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppDimensions.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            _FinanceHero(),
            SizedBox(height: AppDimensions.lg),
            _FinanceSummaryGrid(),
            SizedBox(height: AppDimensions.lg),
            _UpcomingDues(),
            SizedBox(height: AppDimensions.lg),
            _RecentPayments(),
            SizedBox(height: AppDimensions.xl),
          ],
        ),
      ),
    );
  }
}

class _FinanceHero extends StatelessWidget {
  const _FinanceHero();

  @override
  Widget build(BuildContext context) {
    return PecCard(
      color: AppColors.yellow,
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'STUDENT FINANCE OVERVIEW',
                  style: AppTextStyles.labelSmall.copyWith(color: AppColors.black),
                ),
                const SizedBox(height: AppDimensions.xs),
                Text(
                  '2025-26',
                  style: AppTextStyles.heading1.copyWith(
                    color: AppColors.black,
                    fontSize: 40,
                  ),
                ),
                const SizedBox(height: AppDimensions.xs),
                Text(
                  'Track your payments and pending fee dues at a glance.',
                  style: AppTextStyles.bodySmall.copyWith(color: AppColors.black),
                ),
              ],
            ),
          ),
          const SizedBox(width: AppDimensions.md),
          const Icon(
            Icons.account_balance_wallet_rounded,
            size: 44,
            color: AppColors.black,
          ),
        ],
      ),
    );
  }
}

class _FinanceSummaryGrid extends StatelessWidget {
  const _FinanceSummaryGrid();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: const [
        Row(
          children: [
            Expanded(
              child: _FinanceStatCard(
                title: 'Total Pending',
                value: 'Rs 24,500',
                icon: Icons.pending_actions_outlined,
                accent: AppColors.red,
              ),
            ),
            SizedBox(width: AppDimensions.sm),
            Expanded(
              child: _FinanceStatCard(
                title: 'Total Paid',
                value: 'Rs 42,500',
                icon: Icons.payments_outlined,
                accent: AppColors.green,
              ),
            ),
          ],
        ),
        SizedBox(height: AppDimensions.sm),
        Row(
          children: [
            Expanded(
              child: _FinanceStatCard(
                title: 'Overdue',
                value: 'Rs 7,500',
                icon: Icons.warning_amber_rounded,
                accent: AppColors.warning,
              ),
            ),
            SizedBox(width: AppDimensions.sm),
            Expanded(
              child: _FinanceStatCard(
                title: 'Total Paid Fees',
                value: 'Rs 1,83,000',
                icon: Icons.receipt_long_outlined,
                accent: AppColors.blue,
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _FinanceStatCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color accent;

  const _FinanceStatCard({
    required this.title,
    required this.value,
    required this.icon,
    required this.accent,
  });

  @override
  Widget build(BuildContext context) {
    return PecCard(
      color: AppColors.white,
      shadowColor: accent,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 18, color: accent),
              const SizedBox(width: AppDimensions.xs),
              Expanded(
                child: Text(
                  title,
                  style: AppTextStyles.labelSmall.copyWith(
                    color: AppColors.textSecondary,
                    fontSize: 10,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppDimensions.sm),
          Text(
            value,
            style: AppTextStyles.heading3.copyWith(
              color: AppColors.black,
              fontSize: 20,
            ),
          ),
        ],
      ),
    );
  }
}

class _UpcomingDues extends StatelessWidget {
  const _UpcomingDues();

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(width: 4, height: 20, color: AppColors.yellow),
            const SizedBox(width: AppDimensions.sm),
            Text('UPCOMING DUES', style: AppTextStyles.labelLarge),
          ],
        ),
        const SizedBox(height: AppDimensions.sm),
        const PecCard(
          child: Column(
            children: [
              _DueRow(title: 'Hostel Fee - Q2', dueDate: '15 Apr 2026', amount: 'Rs 12,000'),
              Divider(height: 14, color: AppColors.borderLight),
              _DueRow(title: 'Lab Development Fee', dueDate: '22 Apr 2026', amount: 'Rs 5,000'),
              Divider(height: 14, color: AppColors.borderLight),
              _DueRow(title: 'Library Renewal', dueDate: '30 Apr 2026', amount: 'Rs 1,500'),
            ],
          ),
        ),
      ],
    );
  }
}

class _DueRow extends StatelessWidget {
  final String title;
  final String dueDate;
  final String amount;

  const _DueRow({
    required this.title,
    required this.dueDate,
    required this.amount,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: AppTextStyles.labelLarge),
              const SizedBox(height: 2),
              Text(
                'Due: $dueDate',
                style: AppTextStyles.bodySmall,
              ),
            ],
          ),
        ),
        Text(
          amount,
          style: AppTextStyles.labelLarge.copyWith(
            color: AppColors.red,
          ),
        ),
      ],
    );
  }
}

class _RecentPayments extends StatelessWidget {
  const _RecentPayments();

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(width: 4, height: 20, color: AppColors.yellow),
            const SizedBox(width: AppDimensions.sm),
            Text('RECENT PAYMENTS', style: AppTextStyles.labelLarge),
          ],
        ),
        const SizedBox(height: AppDimensions.sm),
        const PecCard(
          child: Column(
            children: [
              _PaymentRow(title: 'Tuition Fee Installment', date: '03 Apr 2026', amount: 'Rs 20,000'),
              Divider(height: 14, color: AppColors.borderLight),
              _PaymentRow(title: 'Exam Fee', date: '25 Mar 2026', amount: 'Rs 2,500'),
              Divider(height: 14, color: AppColors.borderLight),
              _PaymentRow(title: 'Activity Fee', date: '10 Mar 2026', amount: 'Rs 1,200'),
            ],
          ),
        ),
      ],
    );
  }
}

class _PaymentRow extends StatelessWidget {
  final String title;
  final String date;
  final String amount;

  const _PaymentRow({
    required this.title,
    required this.date,
    required this.amount,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const Icon(
          Icons.check_circle_outline,
          color: AppColors.green,
          size: 18,
        ),
        const SizedBox(width: AppDimensions.sm),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: AppTextStyles.labelLarge),
              const SizedBox(height: 2),
              Text(date, style: AppTextStyles.bodySmall),
            ],
          ),
        ),
        Text(
          amount,
          style: AppTextStyles.labelLarge.copyWith(color: AppColors.green),
        ),
      ],
    );
  }
}
