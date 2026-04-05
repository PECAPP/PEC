import 'package:flutter/material.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';

class ScoreSheetScreen extends StatelessWidget {
  const ScoreSheetScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        backgroundColor: const Color(0xFF0F0D09),
        body: Container(
          width: double.infinity,
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Color(0xFF1A1205),
                Color(0xFF100D08),
                Color(0xFF0C0A07),
              ],
              stops: [0.0, 0.42, 1.0],
            ),
          ),
          child: SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  _FinanceHeaderSection(),
                  SizedBox(height: 16),
                  _FinanceTabsBody(),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _FinanceHeaderSection extends StatelessWidget {
  const _FinanceHeaderSection();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(14, 14, 14, 12),
      decoration: BoxDecoration(
        color: const Color(0xFF120F0B),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFF2B261A), width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 34,
                height: 34,
                decoration: BoxDecoration(
                  color: const Color(0xFF2B250D),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(
                      color: AppColors.yellow.withValues(alpha: 0.35)),
                ),
                child: const Icon(Icons.account_balance_wallet_outlined,
                    size: 18, color: AppColors.yellow),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Finance',
                      style: AppTextStyles.heading2.copyWith(
                        color: AppColors.white,
                        fontSize: 32 / 2,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Fees, Payments & Transactions',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.white.withValues(alpha: 0.66),
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                width: 34,
                height: 34,
                decoration: BoxDecoration(
                  color: const Color(0xFF121212),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: const Color(0xFF2B2B2B)),
                ),
                child: IconButton(
                  onPressed: () {},
                  icon: const Icon(Icons.refresh, size: 17),
                  color: AppColors.white.withValues(alpha: 0.85),
                  padding: EdgeInsets.zero,
                  splashRadius: 16,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Container(
            height: 38,
            padding: const EdgeInsets.all(3),
            decoration: BoxDecoration(
              color: const Color(0xFF2E2618),
              borderRadius: BorderRadius.circular(6),
            ),
            child: const TabBar(
              indicatorSize: TabBarIndicatorSize.tab,
              dividerColor: Colors.transparent,
              indicator: BoxDecoration(
                color: Color(0xFF16120B),
                borderRadius: BorderRadius.all(Radius.circular(5)),
              ),
              labelColor: AppColors.white,
              unselectedLabelColor: Color(0xFFC9BDA8),
              labelStyle: TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
              tabs: [
                Tab(text: 'Overview'),
                Tab(text: 'My Fees'),
                Tab(text: 'Transactions'),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _FinanceTabsBody extends StatelessWidget {
  const _FinanceTabsBody();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 360,
      child: TabBarView(
        children: [
          _OverviewFinancePane(),
          _PlaceholderPane(
            icon: Icons.request_page_outlined,
            title: 'My Fees',
            subtitle: 'Detailed fee items will appear here.',
          ),
          _PlaceholderPane(
            icon: Icons.receipt_long_outlined,
            title: 'Transactions',
            subtitle: 'Recent payments and receipts will appear here.',
          ),
        ],
      ),
    );
  }
}

class _OverviewFinancePane extends StatelessWidget {
  const _OverviewFinancePane();

  @override
  Widget build(BuildContext context) {
    const stats = [
      _FinanceStat(
        title: 'Total Pending',
        value: '—',
        icon: Icons.schedule_outlined,
        accent: Color(0xFFFFA726),
        border: Color(0xFF55411F),
      ),
      _FinanceStat(
        title: 'Total Paid',
        value: '—',
        icon: Icons.check_circle_outline,
        accent: Color(0xFF00D8A6),
        border: Color(0xFF1C574A),
      ),
      _FinanceStat(
        title: 'Overdue',
        value: '—',
        icon: Icons.warning_amber_rounded,
        accent: Color(0xFFFF4B4B),
        border: Color(0xFF5A2222),
      ),
      _FinanceStat(
        title: 'Total Paid Fees',
        value: '0',
        icon: Icons.currency_rupee,
        accent: Color(0xFF2E7CFF),
        border: Color(0xFF243A66),
      ),
    ];

    return LayoutBuilder(
      builder: (context, constraints) {
        final isPhone = constraints.maxWidth < 760;
        final isVeryNarrow = constraints.maxWidth < 430;
        return GridView.builder(
          itemCount: stats.length,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: isPhone ? 2 : 4,
            crossAxisSpacing: isVeryNarrow ? 10 : 14,
            mainAxisSpacing: isVeryNarrow ? 10 : 14,
            childAspectRatio: isVeryNarrow
                ? 1.65
                : isPhone
                    ? 1.95
                    : 2.35,
          ),
          itemBuilder: (_, i) => _FinanceStatCard(stat: stats[i]),
        );
      },
    );
  }
}

class _FinanceStat {
  final String title;
  final String value;
  final IconData icon;
  final Color accent;
  final Color border;

  const _FinanceStat({
    required this.title,
    required this.value,
    required this.icon,
    required this.accent,
    required this.border,
  });
}

class _FinanceStatCard extends StatelessWidget {
  final _FinanceStat stat;
  const _FinanceStatCard({required this.stat});

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final compact = constraints.maxWidth < 190 || constraints.maxHeight < 112;
        final padH = compact ? 10.0 : 14.0;
        final padV = compact ? 10.0 : 14.0;
        final iconSize = compact ? 34.0 : 40.0;
        final iconGlyph = compact ? 18.0 : 20.0;
        final titleSize = compact ? 12.0 : 13.0;
        final valueSize = compact ? 13.0 : 16.0;

        return Container(
          padding: EdgeInsets.symmetric(horizontal: padH, vertical: padV),
          decoration: BoxDecoration(
            color: const Color(0xFF2A241A).withValues(alpha: 0.48),
            borderRadius: BorderRadius.circular(6),
            border: Border.all(color: stat.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                children: [
                  Container(
                    width: iconSize,
                    height: iconSize,
                    decoration: BoxDecoration(
                      color: stat.accent.withValues(alpha: 0.16),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Icon(stat.icon, size: iconGlyph, color: stat.accent),
                  ),
                  SizedBox(width: compact ? 8 : 10),
                  Expanded(
                    child: Text(
                      stat.title,
                      style: AppTextStyles.bodyMedium.copyWith(
                        color: AppColors.white.withValues(alpha: 0.78),
                        fontSize: titleSize,
                      ),
                      maxLines: compact ? 2 : 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const Spacer(),
              Text(
                stat.value,
                style: AppTextStyles.heading2.copyWith(
                  color: stat.accent,
                  fontSize: valueSize,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _PlaceholderPane extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;

  const _PlaceholderPane({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: const Color(0xFF17120C),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFF2D281E)),
      ),
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 30, color: AppColors.yellow.withValues(alpha: 0.8)),
              const SizedBox(height: 10),
              Text(
                title,
                style: AppTextStyles.heading3.copyWith(
                  color: AppColors.white,
                  fontSize: 20,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                subtitle,
                textAlign: TextAlign.center,
                style: AppTextStyles.bodyMedium.copyWith(
                  color: AppColors.white.withValues(alpha: 0.72),
                ),
              ),
            ],
          ),
        ),
        ),
    );
  }
}
