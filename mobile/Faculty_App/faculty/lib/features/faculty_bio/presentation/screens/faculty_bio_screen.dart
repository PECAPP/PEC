import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/faculty_badge.dart';
import '../../../../shared/widgets/faculty_card.dart';
import '../../../../shared/widgets/faculty_empty_state.dart';
import '../../../../shared/widgets/faculty_error_state.dart';
import '../../../../shared/widgets/faculty_shimmer.dart';
import '../../../../shared/widgets/faculty_top_nav_bar.dart';
import '../../data/models/publication_model.dart';
import '../providers/bio_provider.dart';

class FacultyBioScreen extends ConsumerStatefulWidget {
  const FacultyBioScreen({super.key});

  @override
  ConsumerState<FacultyBioScreen> createState() => _FacultyBioScreenState();
}

class _FacultyBioScreenState extends ConsumerState<FacultyBioScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabCtrl;

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(bioProvider);

    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: const FacultyTopNavBar(),
      body: Column(
        children: [
          Container(
            color: AppColors.bgDark,
            child: TabBar(
              controller: _tabCtrl,
              labelColor: AppColors.gold,
              unselectedLabelColor: AppColors.textMuted,
              indicatorColor: AppColors.gold,
              indicatorSize: TabBarIndicatorSize.label,
              tabs: [
                _tab(Icons.book_outlined, 'Pubs', state.totalPublications),
                _tab(Icons.emoji_events_outlined, 'Awards', state.totalAwards),
                _tab(Icons.mic_outlined, 'Confs', state.totalConferences),
                _tab(Icons.business_outlined, 'Consult', state.totalConsultations),
              ],
            ),
          ),
          Expanded(
            child: state.loading
                ? FacultyShimmer(child: _shimmerList())
                : state.error != null
                    ? FacultyErrorState(message: state.error!, onRetry: () => ref.read(bioProvider.notifier).load())
                    : TabBarView(
                        controller: _tabCtrl,
                        children: [
                          _PublicationsTab(items: state.publications),
                          _AwardsTab(items: state.awards),
                          _ConferencesTab(
                            items: state.conferences,
                            onEdit: (item) => _showEditConferenceDialog(context, item),
                            onDelete: (id) => _confirmDelete(
                              context,
                              title: 'Delete conference?',
                              onConfirm: () => ref.read(bioProvider.notifier).deleteConference(id),
                            ),
                          ),
                          _ConsultationsTab(
                            items: state.consultations,
                            onEdit: (item) => _showEditConsultationDialog(context, item),
                            onDelete: (id) => _confirmDelete(
                              context,
                              title: 'Delete consultation?',
                              onConfirm: () => ref.read(bioProvider.notifier).deleteConsultation(id),
                            ),
                          ),
                        ],
                      ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppColors.gold,
        foregroundColor: AppColors.bgDark,
        onPressed: () => _showAddDialog(context, _tabCtrl.index),
        child: const Icon(Icons.add),
      ),
    );
  }

  Tab _tab(IconData icon, String label, int count) {
    return Tab(
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16),
          const SizedBox(width: 4),
          Text(label),
          if (count > 0) ...[
            const SizedBox(width: 4),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
              decoration: BoxDecoration(
                color: AppColors.goldSubtle,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text('$count', style: AppTextStyles.caption.copyWith(color: AppColors.gold, fontSize: 10)),
            ),
          ],
        ],
      ),
    );
  }

  Widget _shimmerList() => ListView(
        padding: const EdgeInsets.all(AppDimensions.md),
        children: List.generate(5, (_) => Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: ShimmerBox(height: 100),
        )),
      );

  void _showAddDialog(BuildContext context, int tabIndex) {
    final titleCtrl = TextEditingController();
    final field2Ctrl = TextEditingController();
    final field3Ctrl = TextEditingController();

    final (title, hint1, hint2, hint3) = switch (tabIndex) {
      0 => ('Add Publication', 'Title', 'Journal / Conference', 'DOI (optional)'),
      1 => ('Add Award', 'Title', 'Awarded By', 'Description (optional)'),
      2 => ('Add Conference', 'Name', 'Location', 'Role (optional)'),
      _ => ('Add Consultation', 'Organization', 'Description', 'Status'),
    };

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.cardDark,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Padding(
        padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(ctx).viewInsets.bottom + 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: AppTextStyles.heading3),
            const SizedBox(height: 20),
            TextField(
              controller: titleCtrl,
              style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textPrimary),
              decoration: InputDecoration(hintText: hint1),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: field2Ctrl,
              style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textPrimary),
              decoration: InputDecoration(hintText: hint2),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: field3Ctrl,
              style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textPrimary),
              decoration: InputDecoration(hintText: hint3),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () async {
                  final notifier = ref.read(bioProvider.notifier);
                  try {
                    switch (tabIndex) {
                      case 0:
                        await notifier.addPublication({
                          'title': titleCtrl.text,
                          'journal': field2Ctrl.text,
                          'doi': field3Ctrl.text,
                          'year': DateTime.now().year,
                        });
                      case 1:
                        await notifier.addAward({
                          'title': titleCtrl.text,
                          'awardedBy': field2Ctrl.text,
                          'description': field3Ctrl.text,
                          'year': DateTime.now().year,
                          'category': 'academic',
                        });
                      case 2:
                        await notifier.addConference({
                          'name': titleCtrl.text,
                          'location': field2Ctrl.text,
                          'role': field3Ctrl.text,
                        });
                      default:
                        await notifier.addConsultation({
                          'organization': titleCtrl.text,
                          'description': field2Ctrl.text,
                          'status': field3Ctrl.text.isEmpty ? 'active' : field3Ctrl.text,
                        });
                    }
                    if (ctx.mounted) Navigator.pop(ctx);
                  } catch (e) {
                    if (ctx.mounted) {
                      ScaffoldMessenger.of(ctx).showSnackBar(SnackBar(content: Text('Error: $e')));
                    }
                  }
                },
                child: const Text('SAVE'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showEditConferenceDialog(BuildContext context, ConferenceModel item) {
    final nameCtrl = TextEditingController(text: item.name);
    final locationCtrl = TextEditingController(text: item.location ?? '');
    final roleCtrl = TextEditingController(text: item.role ?? '');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.cardDark,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Padding(
        padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(ctx).viewInsets.bottom + 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Edit Conference', style: AppTextStyles.heading3),
            const SizedBox(height: 20),
            TextField(
              controller: nameCtrl,
              style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textPrimary),
              decoration: const InputDecoration(hintText: 'Name'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: locationCtrl,
              style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textPrimary),
              decoration: const InputDecoration(hintText: 'Location'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: roleCtrl,
              style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textPrimary),
              decoration: const InputDecoration(hintText: 'Role'),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () async {
                  try {
                    await ref.read(bioProvider.notifier).updateConference(item.id, {
                      'name': nameCtrl.text,
                      'location': locationCtrl.text,
                      'role': roleCtrl.text,
                    });
                    if (ctx.mounted) Navigator.pop(ctx);
                  } catch (e) {
                    if (ctx.mounted) {
                      ScaffoldMessenger.of(ctx).showSnackBar(SnackBar(content: Text('Error: $e')));
                    }
                  }
                },
                child: const Text('UPDATE'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showEditConsultationDialog(BuildContext context, ConsultationModel item) {
    final orgCtrl = TextEditingController(text: item.organization);
    final descCtrl = TextEditingController(text: item.description ?? '');
    final statusCtrl = TextEditingController(text: item.status);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.cardDark,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Padding(
        padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(ctx).viewInsets.bottom + 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Edit Consultation', style: AppTextStyles.heading3),
            const SizedBox(height: 20),
            TextField(
              controller: orgCtrl,
              style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textPrimary),
              decoration: const InputDecoration(hintText: 'Organization'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: descCtrl,
              style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textPrimary),
              decoration: const InputDecoration(hintText: 'Description'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: statusCtrl,
              style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textPrimary),
              decoration: const InputDecoration(hintText: 'Status'),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () async {
                  try {
                    await ref.read(bioProvider.notifier).updateConsultation(item.id, {
                      'organization': orgCtrl.text,
                      'description': descCtrl.text,
                      'status': statusCtrl.text,
                    });
                    if (ctx.mounted) Navigator.pop(ctx);
                  } catch (e) {
                    if (ctx.mounted) {
                      ScaffoldMessenger.of(ctx).showSnackBar(SnackBar(content: Text('Error: $e')));
                    }
                  }
                },
                child: const Text('UPDATE'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _confirmDelete(
    BuildContext context, {
    required String title,
    required Future<void> Function() onConfirm,
  }) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.cardDark,
        title: Text(title, style: AppTextStyles.heading3),
        content: Text(
          'This action cannot be undone.',
          style: AppTextStyles.bodySmall,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Delete', style: TextStyle(color: AppColors.error)),
          ),
        ],
      ),
    );

    if (ok == true) {
      try {
        await onConfirm();
      } catch (e) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
        }
      }
    }
  }
}

// ── Tabs ──

class _PublicationsTab extends StatelessWidget {
  final List<PublicationModel> items;
  const _PublicationsTab({required this.items});

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return const FacultyEmptyState(title: 'No publications', icon: Icons.book_outlined);
    }
    return ListView.separated(
      padding: const EdgeInsets.all(AppDimensions.md),
      itemCount: items.length,
      separatorBuilder: (_, _) => const SizedBox(height: 10),
      itemBuilder: (_, i) {
        final p = items[i];
        return FacultyCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(p.title, style: AppTextStyles.labelLarge),
              const SizedBox(height: 4),
              if (p.journal != null) Text(p.journal!, style: AppTextStyles.bodySmall),
              const SizedBox(height: 6),
              Row(
                children: [
                  FacultyBadge(label: '${p.year}', variant: BadgeVariant.outline),
                  const SizedBox(width: 6),
                  if (p.citations > 0)
                    FacultyBadge(label: '${p.citations} citations', variant: BadgeVariant.success),
                ],
              ),
              if (p.doi != null && p.doi!.isNotEmpty) ...[
                const SizedBox(height: 8),
                GestureDetector(
                  onTap: () => launchUrl(Uri.parse('https://doi.org/${p.doi}')),
                  child: Text('DOI: ${p.doi}',
                      style: AppTextStyles.caption.copyWith(color: AppColors.info)),
                ),
              ],
            ],
          ),
        );
      },
    );
  }
}

class _AwardsTab extends StatelessWidget {
  final List<AwardModel> items;
  const _AwardsTab({required this.items});

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return const FacultyEmptyState(title: 'No awards', icon: Icons.emoji_events_outlined);
    }
    return ListView.separated(
      padding: const EdgeInsets.all(AppDimensions.md),
      itemCount: items.length,
      separatorBuilder: (_, _) => const SizedBox(height: 10),
      itemBuilder: (_, i) {
        final a = items[i];
        return FacultyCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(children: [
                const Icon(Icons.emoji_events, color: AppColors.gold, size: 18),
                const SizedBox(width: 8),
                Expanded(child: Text(a.title, style: AppTextStyles.labelLarge)),
              ]),
              const SizedBox(height: 4),
              if (a.awardedBy != null) Text('Awarded by ${a.awardedBy}', style: AppTextStyles.bodySmall),
              if (a.description != null) ...[
                const SizedBox(height: 4),
                Text(a.description!, style: AppTextStyles.caption, maxLines: 3, overflow: TextOverflow.ellipsis),
              ],
              const SizedBox(height: 6),
              Row(children: [
                FacultyBadge(label: '${a.year}', variant: BadgeVariant.outline),
                const SizedBox(width: 6),
                FacultyBadge(label: a.category, variant: BadgeVariant.primary),
              ]),
            ],
          ),
        );
      },
    );
  }
}

class _ConferencesTab extends StatelessWidget {
  final List<ConferenceModel> items;
  final ValueChanged<ConferenceModel> onEdit;
  final ValueChanged<String> onDelete;

  const _ConferencesTab({
    required this.items,
    required this.onEdit,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return const FacultyEmptyState(title: 'No conferences', icon: Icons.mic_outlined);
    }
    return ListView.separated(
      padding: const EdgeInsets.all(AppDimensions.md),
      itemCount: items.length,
      separatorBuilder: (_, _) => const SizedBox(height: 10),
      itemBuilder: (_, i) {
        final c = items[i];
        return FacultyCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(c.name, style: AppTextStyles.labelLarge),
              if (c.location != null) ...[
                const SizedBox(height: 4),
                Row(children: [
                  const Icon(Icons.location_on_outlined, size: 14, color: AppColors.textMuted),
                  const SizedBox(width: 4),
                  Text(c.location!, style: AppTextStyles.bodySmall),
                ]),
              ],
              if (c.role != null) ...[
                const SizedBox(height: 6),
                FacultyBadge(label: c.role!, variant: BadgeVariant.primary),
              ],
              const SizedBox(height: 8),
              Row(
                children: [
                  TextButton(
                    onPressed: () => onEdit(c),
                    child: const Text('Edit'),
                  ),
                  TextButton(
                    onPressed: () => onDelete(c.id),
                    child: const Text('Delete', style: TextStyle(color: AppColors.error)),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}

class _ConsultationsTab extends StatelessWidget {
  final List<ConsultationModel> items;
  final ValueChanged<ConsultationModel> onEdit;
  final ValueChanged<String> onDelete;

  const _ConsultationsTab({
    required this.items,
    required this.onEdit,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return const FacultyEmptyState(title: 'No consultations', icon: Icons.business_outlined);
    }
    return ListView.separated(
      padding: const EdgeInsets.all(AppDimensions.md),
      itemCount: items.length,
      separatorBuilder: (_, _) => const SizedBox(height: 10),
      itemBuilder: (_, i) {
        final c = items[i];
        return FacultyCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(c.organization, style: AppTextStyles.labelLarge),
              if (c.description != null) ...[
                const SizedBox(height: 4),
                Text(c.description!, style: AppTextStyles.caption, maxLines: 3, overflow: TextOverflow.ellipsis),
              ],
              const SizedBox(height: 6),
              FacultyBadge(
                label: c.status,
                variant: c.status == 'active' ? BadgeVariant.success : BadgeVariant.secondary,
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  TextButton(
                    onPressed: () => onEdit(c),
                    child: const Text('Edit'),
                  ),
                  TextButton(
                    onPressed: () => onDelete(c.id),
                    child: const Text('Delete', style: TextStyle(color: AppColors.error)),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}
