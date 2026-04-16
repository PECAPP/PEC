import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/faculty_card.dart';
import '../../../../shared/widgets/faculty_top_nav_bar.dart';

class HelpSupportScreen extends StatelessWidget {
  const HelpSupportScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: const FacultyTopNavBar(),
      body: ListView(
        padding: const EdgeInsets.all(AppDimensions.md),
        children: [
          // ── Quick Help ──
          _SectionLabel('QUICK HELP'),
          const SizedBox(height: AppDimensions.sm),
          _HelpCard(
            icon: Icons.book_outlined,
            title: 'User Guide',
            subtitle: 'Step-by-step guide for all app features',
            onTap: () => _launchUrl('https://pec.ac.in/faculty-portal/guide'),
          ),
          _HelpCard(
            icon: Icons.video_library_outlined,
            title: 'Video Tutorials',
            subtitle: 'Watch walkthroughs for common tasks',
            onTap: () => _launchUrl('https://pec.ac.in/faculty-portal/tutorials'),
          ),
          _HelpCard(
            icon: Icons.quiz_outlined,
            title: 'FAQs',
            subtitle: 'Frequently asked questions',
            onTap: () => _showFAQ(context),
          ),

          const SizedBox(height: AppDimensions.lg),
          _SectionLabel('CONTACT SUPPORT'),
          const SizedBox(height: AppDimensions.sm),
          _HelpCard(
            icon: Icons.email_outlined,
            title: 'Email Support',
            subtitle: 'support@pec.edu.in',
            onTap: () => _launchUrl('mailto:support@pec.edu.in'),
          ),
          _HelpCard(
            icon: Icons.phone_outlined,
            title: 'IT Helpdesk',
            subtitle: '+91-172-2753500 (Ext. 201)',
            onTap: () => _launchUrl('tel:+911722753500'),
          ),
          _HelpCard(
            icon: Icons.location_on_outlined,
            title: 'Visit IT Office',
            subtitle: 'Computer Centre, PEC Campus',
            onTap: () {},
          ),

          const SizedBox(height: AppDimensions.lg),
          _SectionLabel('RESOURCES'),
          const SizedBox(height: AppDimensions.sm),
          _HelpCard(
            icon: Icons.bug_report_outlined,
            title: 'Report a Bug',
            subtitle: 'Help us improve the app',
            onTap: () => _launchUrl('mailto:erp-bugs@pec.edu.in?subject=Faculty%20App%20Bug%20Report'),
          ),
          _HelpCard(
            icon: Icons.lightbulb_outlined,
            title: 'Feature Request',
            subtitle: 'Suggest new features',
            onTap: () => _launchUrl('mailto:erp-feedback@pec.edu.in?subject=Faculty%20App%20Feature%20Request'),
          ),
          _HelpCard(
            icon: Icons.privacy_tip_outlined,
            title: 'Privacy Policy',
            subtitle: 'How we handle your data',
            onTap: () => _launchUrl('https://pec.ac.in/privacy'),
          ),
          const SizedBox(height: AppDimensions.xxl),
        ],
      ),
    );
  }

  Future<void> _launchUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  void _showFAQ(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.cardDark,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        maxChildSize: 0.9,
        minChildSize: 0.4,
        expand: false,
        builder: (_, controller) => ListView(
          controller: controller,
          padding: const EdgeInsets.all(24),
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.borderDark,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 20),
            Text('Frequently Asked Questions', style: AppTextStyles.heading3),
            const SizedBox(height: 20),
            ..._faqItems.map((faq) => _FAQItem(question: faq.$1, answer: faq.$2)),
          ],
        ),
      ),
    );
  }

  static const _faqItems = [
    (
      'How do I mark attendance?',
      'Navigate to the Attendance section, select a course, and tap "Generate QR Code". Students scan the code to mark their attendance.',
    ),
    (
      'How do I upload course materials?',
      'Go to Course Materials from the dashboard, select a course, and tap the upload button to add files, links, or notes.',
    ),
    (
      'How do I update my Faculty Bio?',
      'Go to Profile > Faculty Bio System. You can add publications, awards, conferences, and consultations from there.',
    ),
    (
      'Why can\'t I see my courses?',
      'Courses are assigned by the administration. If your courses are missing, contact the IT Helpdesk or your HOD.',
    ),
    (
      'How do I change the app theme?',
      'Go to Settings > Appearance. You can toggle Dark Mode or use the System Theme to match your device settings.',
    ),
    (
      'Is my data secure?',
      'Yes. All data is transmitted over encrypted connections (HTTPS) and authenticated using secure tokens. No data is stored on third-party servers.',
    ),
  ];
}

class _SectionLabel extends StatelessWidget {
  final String title;
  const _SectionLabel(this.title);

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(width: 3, height: 16, color: AppColors.gold),
        const SizedBox(width: 8),
        Text(title, style: AppTextStyles.labelSmall.copyWith(letterSpacing: 1.5)),
      ],
    );
  }
}

class _HelpCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _HelpCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: FacultyCard(
        onTap: onTap,
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: AppColors.goldSubtle,
                borderRadius: BorderRadius.circular(AppDimensions.borderRadiusMd),
              ),
              child: Icon(icon, color: AppColors.gold, size: 20),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: AppTextStyles.labelLarge),
                  Text(subtitle, style: AppTextStyles.caption),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, size: 20, color: AppColors.textMuted),
          ],
        ),
      ),
    );
  }
}

class _FAQItem extends StatefulWidget {
  final String question;
  final String answer;
  const _FAQItem({required this.question, required this.answer});

  @override
  State<_FAQItem> createState() => _FAQItemState();
}

class _FAQItemState extends State<_FAQItem> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: FacultyCard(
        onTap: () => setState(() => _expanded = !_expanded),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(widget.question, style: AppTextStyles.labelLarge),
                ),
                AnimatedRotation(
                  duration: const Duration(milliseconds: 200),
                  turns: _expanded ? 0.5 : 0,
                  child: const Icon(Icons.expand_more, color: AppColors.gold, size: 20),
                ),
              ],
            ),
            AnimatedCrossFade(
              firstChild: const SizedBox.shrink(),
              secondChild: Padding(
                padding: const EdgeInsets.only(top: 10),
                child: Text(widget.answer, style: AppTextStyles.bodySmall),
              ),
              crossFadeState: _expanded ? CrossFadeState.showSecond : CrossFadeState.showFirst,
              duration: const Duration(milliseconds: 200),
            ),
          ],
        ),
      ),
    );
  }
}
