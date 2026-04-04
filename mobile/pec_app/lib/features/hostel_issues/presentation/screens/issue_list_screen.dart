import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/pec_card.dart';
import '../../../../shared/widgets/pec_empty_state.dart';
import '../../../../shared/widgets/pec_error_state.dart';
import '../../../../shared/widgets/pec_shimmer.dart';
import '../../data/models/issue_model.dart';
import '../providers/issues_provider.dart';

class IssueListScreen extends ConsumerStatefulWidget {
  const IssueListScreen({super.key});

  @override
  ConsumerState<IssueListScreen> createState() => _IssueListScreenState();
}

class _IssueListScreenState extends ConsumerState<IssueListScreen> {
  String _filterStatus = '';

  @override
  Widget build(BuildContext context) {
    final issuesAsync = ref.watch(myIssuesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('HOSTEL ISSUES'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.invalidate(myIssuesProvider),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppColors.yellow,
        foregroundColor: AppColors.black,
        onPressed: () => _showReportSheet(context),
        child: const Icon(Icons.add),
      ),
      body: Column(
        children: [
          // Status filter
          Padding(
            padding: const EdgeInsets.all(AppDimensions.md),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  for (final s in ['', 'open', 'in_progress', 'resolved', 'closed'])
                    Padding(
                      padding: const EdgeInsets.only(right: AppDimensions.xs),
                      child: _Chip(
                        label: s.isEmpty
                            ? 'ALL'
                            : s == 'in_progress'
                                ? 'IN PROGRESS'
                                : s.toUpperCase(),
                        active: _filterStatus == s,
                        onTap: () =>
                            setState(() => _filterStatus = s),
                      ),
                    ),
                ],
              ),
            ),
          ),
          Expanded(
            child: issuesAsync.when(
              loading: () => ListView.separated(
                padding: const EdgeInsets.symmetric(
                    horizontal: AppDimensions.md),
                itemCount: 5,
                separatorBuilder: (_, __) =>
                    const SizedBox(height: AppDimensions.sm),
                itemBuilder: (_, __) =>
                    const PecShimmerBox(height: 100, width: double.infinity),
              ),
              error: (e, _) => PecErrorState(
                  message: e.toString(),
                  onRetry: () => ref.invalidate(myIssuesProvider)),
              data: (issues) {
                final filtered = issues
                    .where((i) =>
                        _filterStatus.isEmpty ||
                        i.status == _filterStatus)
                    .toList();

                if (filtered.isEmpty) {
                  return PecEmptyState(
                    icon: Icons.home_repair_service_outlined,
                    title: _filterStatus.isEmpty
                        ? 'No issues reported'
                        : 'No ${_filterStatus.replaceAll('_', ' ')} issues',
                    subtitle: _filterStatus.isEmpty
                        ? 'Tap + to report a hostel issue'
                        : null,
                  );
                }

                return ListView.separated(
                  padding: const EdgeInsets.fromLTRB(AppDimensions.md, 0,
                      AppDimensions.md, 100),
                  itemCount: filtered.length,
                  separatorBuilder: (_, __) =>
                      const SizedBox(height: AppDimensions.sm),
                  itemBuilder: (_, i) => _IssueCard(issue: filtered[i]),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  void _showReportSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) => const _ReportIssueSheet(),
    );
  }
}

class _IssueCard extends StatelessWidget {
  final HostelIssue issue;
  const _IssueCard({required this.issue});

  @override
  Widget build(BuildContext context) {
    return PecCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                color: issue.priorityColor.withValues(alpha: 0.15),
                child: Icon(issue.categoryIcon,
                    color: issue.priorityColor, size: 20),
              ),
              const SizedBox(width: AppDimensions.sm),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(issue.title, style: AppTextStyles.labelLarge,
                        maxLines: 1, overflow: TextOverflow.ellipsis),
                    if (issue.roomNumber != null)
                      Text('Room ${issue.roomNumber}',
                          style: AppTextStyles.caption),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 6, vertical: 2),
                    color: issue.priorityColor,
                    child: Text(issue.priority.toUpperCase(),
                        style: AppTextStyles.labelSmall.copyWith(
                            color: AppColors.black, fontSize: 8)),
                  ),
                  const SizedBox(height: 2),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 6, vertical: 2),
                    color: issue.statusColor,
                    child: Text(issue.statusLabel.toUpperCase(),
                        style: AppTextStyles.labelSmall.copyWith(
                            color: AppColors.black, fontSize: 8)),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: AppDimensions.sm),
          // Progress stepper
          _StatusStepper(step: issue.progressStep),
          if (issue.description.isNotEmpty) ...[
            const SizedBox(height: AppDimensions.xs),
            Text(issue.description,
                style:
                    AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary),
                maxLines: 2,
                overflow: TextOverflow.ellipsis),
          ],
          if (issue.assignedTo != null) ...[
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.person_outline, size: 12),
                const SizedBox(width: 2),
                Text('Assigned to ${issue.assignedTo!}',
                    style: AppTextStyles.caption),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

class _StatusStepper extends StatelessWidget {
  final int step; // 0=open, 1=in_progress, 2=resolved, 3=closed
  const _StatusStepper({required this.step});

  static const _labels = ['Open', 'In Progress', 'Resolved', 'Closed'];
  static const _colors = [
    AppColors.warning, AppColors.blue, AppColors.green, AppColors.textSecondary
  ];

  @override
  Widget build(BuildContext context) {
    return Row(
      children: List.generate(_labels.length, (i) {
        final done = i <= step;
        return Expanded(
          child: Row(
            children: [
              Container(
                width: 16,
                height: 16,
                decoration: BoxDecoration(
                  color: done ? _colors[i] : AppColors.bgSurface,
                  border: Border.all(
                      color: done ? _colors[i] : AppColors.borderLight,
                      width: 1.5),
                ),
                child: done
                    ? const Icon(Icons.check, size: 10, color: AppColors.black)
                    : null,
              ),
              if (i < _labels.length - 1)
                Expanded(
                  child: Container(
                      height: 2,
                      color: i < step
                          ? _colors[i]
                          : AppColors.borderLight),
                ),
            ],
          ),
        );
      }),
    );
  }
}

// ── Report Issue Sheet ────────────────────────────────────────────────────────
class _ReportIssueSheet extends ConsumerStatefulWidget {
  const _ReportIssueSheet();

  @override
  ConsumerState<_ReportIssueSheet> createState() =>
      _ReportIssueSheetState();
}

class _ReportIssueSheetState extends ConsumerState<_ReportIssueSheet> {
  final _titleCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _roomCtrl = TextEditingController();
  String _category = 'plumbing';
  String _priority = 'medium';
  String? _imageUrl;

  static const _categories = [
    'plumbing', 'electrical', 'cleaning', 'furniture', 'network', 'other'
  ];
  static const _priorities = ['low', 'medium', 'high', 'urgent'];

  @override
  void dispose() {
    _titleCtrl.dispose();
    _descCtrl.dispose();
    _roomCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final formAsync = ref.watch(issueFormProvider);

    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: DraggableScrollableSheet(
        initialChildSize: 0.75,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        expand: false,
        builder: (_, scrollCtrl) => Container(
          decoration: const BoxDecoration(
            color: AppColors.white,
            border:
                Border(top: BorderSide(color: AppColors.black, width: 2)),
          ),
          child: Column(
            children: [
              Container(
                margin:
                    const EdgeInsets.symmetric(vertical: AppDimensions.sm),
                width: 40,
                height: 4,
                color: AppColors.borderLight,
              ),
              Padding(
                padding: const EdgeInsets.symmetric(
                    horizontal: AppDimensions.md),
                child: Text('REPORT AN ISSUE',
                    style: AppTextStyles.labelLarge),
              ),
              const Divider(color: AppColors.black, height: 1, thickness: 1),
              Expanded(
                child: ListView(
                  controller: scrollCtrl,
                  padding: const EdgeInsets.all(AppDimensions.md),
                  children: [
                    TextField(
                      controller: _titleCtrl,
                      decoration: const InputDecoration(
                          labelText: 'Issue Title *',
                          border: OutlineInputBorder()),
                    ),
                    const SizedBox(height: AppDimensions.sm),
                    TextField(
                      controller: _descCtrl,
                      maxLines: 3,
                      decoration: const InputDecoration(
                          labelText: 'Description',
                          border: OutlineInputBorder()),
                    ),
                    const SizedBox(height: AppDimensions.sm),
                    TextField(
                      controller: _roomCtrl,
                      decoration: const InputDecoration(
                          labelText: 'Room Number (optional)',
                          border: OutlineInputBorder()),
                    ),
                    const SizedBox(height: AppDimensions.md),
                    Text('Category', style: AppTextStyles.labelSmall),
                    const SizedBox(height: AppDimensions.xs),
                    Wrap(
                      spacing: 6,
                      children: _categories
                          .map((c) => GestureDetector(
                                onTap: () =>
                                    setState(() => _category = c),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 10, vertical: 5),
                                  margin: const EdgeInsets.only(
                                      bottom: 6),
                                  decoration: BoxDecoration(
                                    color: _category == c
                                        ? AppColors.yellow
                                        : Colors.transparent,
                                    border: Border.all(
                                        color: AppColors.black,
                                        width: 1.5),
                                  ),
                                  child: Text(c.toUpperCase(),
                                      style: AppTextStyles.labelSmall
                                          .copyWith(fontSize: 9)),
                                ),
                              ))
                          .toList(),
                    ),
                    const SizedBox(height: AppDimensions.sm),
                    Text('Priority', style: AppTextStyles.labelSmall),
                    const SizedBox(height: AppDimensions.xs),
                    Row(
                      children: _priorities
                          .map((p) => Expanded(
                                child: GestureDetector(
                                  onTap: () =>
                                      setState(() => _priority = p),
                                  child: Container(
                                    margin: const EdgeInsets.only(
                                        right: 4),
                                    padding: const EdgeInsets.symmetric(
                                        vertical: 8),
                                    decoration: BoxDecoration(
                                      color: _priority == p
                                          ? AppColors.yellow
                                          : Colors.transparent,
                                      border: Border.all(
                                          color: AppColors.black,
                                          width: 1.5),
                                    ),
                                    child: Text(p.toUpperCase(),
                                        style: AppTextStyles.labelSmall
                                            .copyWith(fontSize: 8),
                                        textAlign: TextAlign.center),
                                  ),
                                ),
                              ))
                          .toList(),
                    ),
                    const SizedBox(height: AppDimensions.sm),
                    GestureDetector(
                      onTap: _pickImage,
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(
                            vertical: 12),
                        decoration: BoxDecoration(
                          border: Border.all(
                              color: AppColors.borderLight, width: 1.5),
                          color: AppColors.bgSurface,
                        ),
                        child: Column(
                          children: [
                            Icon(
                              _imageUrl != null
                                  ? Icons.check_circle_outline
                                  : Icons.camera_alt_outlined,
                              color: _imageUrl != null
                                  ? AppColors.green
                                  : AppColors.textSecondary,
                            ),
                            Text(
                              _imageUrl != null
                                  ? 'Photo attached'
                                  : 'Attach Photo (optional)',
                              style: AppTextStyles.caption,
                            ),
                          ],
                        ),
                      ),
                    ),
                    if (formAsync is AsyncError)
                      Padding(
                        padding:
                            const EdgeInsets.only(top: AppDimensions.sm),
                        child: Text(formAsync.error.toString(),
                            style: AppTextStyles.bodySmall
                                .copyWith(color: AppColors.red)),
                      ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(AppDimensions.md),
                child: GestureDetector(
                  onTap: formAsync.isLoading ? null : _submit,
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    decoration: BoxDecoration(
                      color: AppColors.yellow,
                      border: Border.all(
                          color: AppColors.black, width: 2),
                      boxShadow: const [
                        BoxShadow(
                            offset: Offset(4, 4), color: AppColors.black)
                      ],
                    ),
                    child: formAsync.isLoading
                        ? const Center(
                            child: SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: AppColors.black)))
                        : Text('SUBMIT ISSUE',
                            style: AppTextStyles.labelLarge
                                .copyWith(color: AppColors.black),
                            textAlign: TextAlign.center),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final file = await picker.pickImage(source: ImageSource.camera);
    if (file != null) setState(() => _imageUrl = file.path);
  }

  Future<void> _submit() async {
    final title = _titleCtrl.text.trim();
    if (title.isEmpty) return;
    await ref.read(issueFormProvider.notifier).submit(
          title: title,
          description: _descCtrl.text.trim(),
          category: _category,
          priority: _priority,
          roomNumber: _roomCtrl.text.trim().isEmpty
              ? null
              : _roomCtrl.text.trim(),
          imageUrl: _imageUrl,
        );
    if (mounted && ref.read(issueFormProvider).value != null) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Issue reported successfully')),
      );
    }
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
        padding:
            const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: active ? AppColors.yellow : Colors.transparent,
          border: Border.all(color: AppColors.black, width: 2),
          boxShadow: active
              ? const [
                  BoxShadow(offset: Offset(2, 2), color: AppColors.black)
                ]
              : null,
        ),
        child: Text(label,
            style: AppTextStyles.labelSmall
                .copyWith(fontSize: 10, color: AppColors.black)),
      ),
    );
  }
}
