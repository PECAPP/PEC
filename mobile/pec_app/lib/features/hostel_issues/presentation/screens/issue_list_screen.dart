import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/pec_card.dart';
import '../../../../shared/widgets/pec_empty_state.dart';
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
  String? _selectedIssueId;
  final Map<String, List<_LocalIssueNote>> _notesByIssue = {};
  final TextEditingController _noteController = TextEditingController();

  static const _statusFilters = [
    '',
    'open',
    'in_progress',
    'resolved',
    'closed',
  ];

  @override
  void dispose() {
    _noteController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final issuesAsync = ref.watch(myIssuesProvider);

    return Scaffold(
      backgroundColor: AppColors.bgSurface,
      appBar: AppBar(
        title: const Text('HOSTEL ISSUES'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.invalidate(myIssuesProvider),
          ),
          const SizedBox(width: 4),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.yellow,
        foregroundColor: AppColors.black,
        onPressed: () => _showReportSheet(context),
        icon: const Icon(Icons.add),
        label: const Text('REPORT ISSUE'),
      ),
      body: SafeArea(
        child: issuesAsync.when(
          loading: () => _buildLoading(),
          error: (error, _) => Center(
            child: Padding(
              padding: const EdgeInsets.all(AppDimensions.lg),
              child: PecCard(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.error_outline, size: 40),
                    const SizedBox(height: AppDimensions.sm),
                    Text(
                      'Unable to load hostel issues',
                      style: AppTextStyles.labelLarge,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: AppDimensions.xs),
                    Text(
                      error.toString(),
                      style: AppTextStyles.bodySmall,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: AppDimensions.md),
                    ElevatedButton(
                      onPressed: () => ref.invalidate(myIssuesProvider),
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
            ),
          ),
          data: (issues) {
            final filteredIssues = _filteredIssues(issues);
            _ensureSelection(filteredIssues);
            final selectedIssue = _selectedIssue(filteredIssues);
            return LayoutBuilder(
              builder: (context, constraints) {
                final isWide = constraints.maxWidth >= 1050;
                return SingleChildScrollView(
                  child: Padding(
                    padding: EdgeInsets.all(
                      constraints.maxWidth < 700
                          ? AppDimensions.md
                          : AppDimensions.lg,
                    ),
                    child: ConstrainedBox(
                      constraints: BoxConstraints(
                        minHeight: constraints.maxHeight,
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          _buildHeader(context, issues.length, filteredIssues.length),
                          const SizedBox(height: AppDimensions.lg),
                          _buildSummaryRow(filteredIssues),
                          const SizedBox(height: AppDimensions.lg),
                          _buildFilterRow(),
                          const SizedBox(height: AppDimensions.lg),
                          if (filteredIssues.isEmpty)
                            Padding(
                              padding: const EdgeInsets.only(top: AppDimensions.xl),
                              child: PecEmptyState(
                                icon: Icons.home_repair_service_outlined,
                                title: _filterStatus.isEmpty
                                    ? 'No issues reported'
                                    : 'No ${_filterLabel(_filterStatus)} issues',
                                subtitle: 'Use the report button to create a new hostel issue.',
                              ),
                            )
                          else if (isWide)
                            _buildDesktopLayout(filteredIssues, selectedIssue)
                          else
                            _buildMobileLayout(filteredIssues, selectedIssue),
                          const SizedBox(height: 96),
                        ],
                      ),
                    ),
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }

  Widget _buildLoading() {
    return ListView(
      padding: const EdgeInsets.all(AppDimensions.lg),
      children: [
        const PecShimmerBox(height: 120, width: double.infinity),
        const SizedBox(height: AppDimensions.lg),
        Row(
          children: const [
            Expanded(child: PecShimmerBox(height: 100, width: double.infinity)),
            SizedBox(width: AppDimensions.md),
            Expanded(child: PecShimmerBox(height: 100, width: double.infinity)),
            SizedBox(width: AppDimensions.md),
            Expanded(child: PecShimmerBox(height: 100, width: double.infinity)),
          ],
        ),
        const SizedBox(height: AppDimensions.lg),
        const PecShimmerBox(height: 520, width: double.infinity),
      ],
    );
  }

  Widget _buildHeader(BuildContext context, int totalIssues, int filteredCount) {
    return PecCard(
      color: AppColors.white,
      child: LayoutBuilder(
        builder: (context, constraints) {
          final isCompact = constraints.maxWidth < 680;
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (isCompact) ...[
                Text('Hostel Issues', style: AppTextStyles.heading3),
                const SizedBox(height: AppDimensions.xs),
                Text(
                  'Track repairs, assign follow-ups, and keep residents updated from one place.',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
              ] else ...[
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Hostel Issues', style: AppTextStyles.heading1),
                          const SizedBox(height: AppDimensions.xs),
                          Text(
                            'Track repairs, assign follow-ups, and keep residents updated from one place.',
                            style: AppTextStyles.bodyMedium.copyWith(
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: AppDimensions.md),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: AppColors.yellow,
                        border: Border.all(color: AppColors.black, width: 2),
                        boxShadow: const [
                          BoxShadow(offset: Offset(3, 3), color: AppColors.black),
                        ],
                      ),
                      child: Text(
                        '$filteredCount visible',
                        style: AppTextStyles.labelLarge,
                      ),
                    ),
                  ],
                ),
              ],
            ],
          );
        },
      ),
    );
  }

  Widget _buildSummaryRow(List<HostelIssue> issues) {
    final open = issues.where((issue) => issue.status == 'open').length;
    final inProgress = issues.where((issue) => issue.status == 'in_progress').length;
    final resolved = issues.where((issue) => issue.status == 'resolved').length;

    return LayoutBuilder(
      builder: (context, constraints) {
        final cardWidth = constraints.maxWidth >= 900
            ? (constraints.maxWidth - (AppDimensions.md * 2)) / 3
            : constraints.maxWidth;
        return Wrap(
          spacing: AppDimensions.md,
          runSpacing: AppDimensions.md,
          children: [
            _SummaryCard(
              title: 'Total',
              value: issues.length.toString(),
              subtitle: 'Issues in the system',
              color: AppColors.yellow,
              width: cardWidth,
            ),
            _SummaryCard(
              title: 'Open',
              value: open.toString(),
              subtitle: 'Need attention',
              color: AppColors.warning,
              width: cardWidth,
            ),
            _SummaryCard(
              title: 'In Progress',
              value: inProgress.toString(),
              subtitle: 'Being worked on',
              color: AppColors.blue,
              width: cardWidth,
            ),
            if (constraints.maxWidth < 900)
              _SummaryCard(
                title: 'Resolved',
                value: resolved.toString(),
                subtitle: 'Closed successfully',
                color: AppColors.green,
                width: cardWidth,
              )
            else
              _SummaryCard(
                title: 'Resolved',
                value: resolved.toString(),
                subtitle: 'Closed successfully',
                color: AppColors.green,
                width: cardWidth,
              ),
          ],
        );
      },
    );
  }

  Widget _buildFilterRow() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          for (final status in _statusFilters)
            Padding(
              padding: const EdgeInsets.only(right: AppDimensions.sm),
              child: _FilterChip(
                label: _filterLabel(status),
                active: _filterStatus == status,
                onTap: () {
                  setState(() {
                    _filterStatus = status;
                  });
                },
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildDesktopLayout(List<HostelIssue> issues, HostelIssue? selectedIssue) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          flex: 5,
          child: _IssueListPanel(
            issues: issues,
            selectedIssueId: _selectedIssueId,
            onSelect: (issue) {
              setState(() {
                _selectedIssueId = issue.id;
              });
            },
          ),
        ),
        const SizedBox(width: AppDimensions.lg),
        Expanded(
          flex: 6,
          child: _IssueDetailPanel(
            issue: selectedIssue,
            notes: selectedIssue == null
                ? const []
                : _notesByIssue[selectedIssue.id] ?? const [],
            noteController: _noteController,
            onAddNote: selectedIssue == null ? null : () => _addNote(selectedIssue),
          ),
        ),
      ],
    );
  }

  Widget _buildMobileLayout(List<HostelIssue> issues, HostelIssue? selectedIssue) {
    return Column(
      children: [
        _IssueListPanel(
          issues: issues,
          selectedIssueId: _selectedIssueId,
          onSelect: (issue) {
            setState(() {
              _selectedIssueId = issue.id;
            });
          },
        ),
        const SizedBox(height: AppDimensions.lg),
        _IssueDetailPanel(
          issue: selectedIssue,
          notes: selectedIssue == null
              ? const []
              : _notesByIssue[selectedIssue.id] ?? const [],
          noteController: _noteController,
          onAddNote: selectedIssue == null ? null : () => _addNote(selectedIssue),
        ),
      ],
    );
  }

  List<HostelIssue> _filteredIssues(List<HostelIssue> issues) {
    final filtered = issues.where((issue) {
      return _filterStatus.isEmpty || issue.status == _filterStatus;
    }).toList();
    filtered.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return filtered;
  }

  void _ensureSelection(List<HostelIssue> issues) {
    if (issues.isEmpty) {
      _selectedIssueId = null;
      return;
    }
    final containsSelection = issues.any((issue) => issue.id == _selectedIssueId);
    if (!containsSelection) {
      _selectedIssueId = issues.first.id;
    }
  }

  HostelIssue? _selectedIssue(List<HostelIssue> issues) {
    if (_selectedIssueId == null) {
      return null;
    }
    for (final issue in issues) {
      if (issue.id == _selectedIssueId) {
        return issue;
      }
    }
    return null;
  }

  void _addNote(HostelIssue issue) {
    final text = _noteController.text.trim();
    if (text.isEmpty) {
      return;
    }
    setState(() {
      final notes = _notesByIssue.putIfAbsent(issue.id, () => []);
      notes.insert(
        0,
        _LocalIssueNote(
          text: text,
          time: DateTime.now(),
          author: 'You',
        ),
      );
      _noteController.clear();
    });
  }

  String _filterLabel(String status) {
    if (status.isEmpty) {
      return 'All';
    }
    if (status == 'in_progress') {
      return 'Assigned';
    }
    return status.replaceAll('_', ' ').split(' ').map((word) {
      if (word.isEmpty) {
        return word;
      }
      return word[0].toUpperCase() + word.substring(1);
    }).join(' ');
  }

  void _showReportSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) => const _ReportIssueSheet(),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  final String title;
  final String value;
  final String subtitle;
  final Color color;
  final double width;

  const _SummaryCard({
    required this.title,
    required this.value,
    required this.subtitle,
    required this.color,
    required this.width,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: width < 280 ? double.infinity : width,
      child: PecCard(
        color: AppColors.white,
        shadowColor: color,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title.toUpperCase(), style: AppTextStyles.labelSmall),
            const SizedBox(height: AppDimensions.xs),
            Text(value, style: AppTextStyles.heading2),
            const SizedBox(height: AppDimensions.xs),
            Text(subtitle, style: AppTextStyles.bodySmall),
          ],
        ),
      ),
    );
  }
}

class _IssueListPanel extends StatelessWidget {
  final List<HostelIssue> issues;
  final String? selectedIssueId;
  final ValueChanged<HostelIssue> onSelect;

  const _IssueListPanel({
    required this.issues,
    required this.selectedIssueId,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    return PecCard(
      color: AppColors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text('Issues', style: AppTextStyles.labelLarge),
              ),
              Text('${issues.length}', style: AppTextStyles.labelLarge),
            ],
          ),
          const SizedBox(height: AppDimensions.md),
          ...List.generate(issues.length, (index) {
            final issue = issues[index];
            final selected = issue.id == selectedIssueId;
            return Padding(
              padding: EdgeInsets.only(
                bottom: index == issues.length - 1 ? 0 : AppDimensions.sm,
              ),
              child: _IssueListTile(
                issue: issue,
                selected: selected,
                onTap: () => onSelect(issue),
              ),
            );
          }),
        ],
      ),
    );
  }
}

class _IssueListTile extends StatelessWidget {
  final HostelIssue issue;
  final bool selected;
  final VoidCallback onTap;

  const _IssueListTile({
    required this.issue,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: selected ? AppColors.yellow.withValues(alpha: 0.22) : AppColors.bgSurface,
      child: InkWell(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(AppDimensions.md),
          decoration: BoxDecoration(
            border: Border.all(
              color: selected ? AppColors.black : AppColors.borderLight,
              width: selected ? 2 : 1.5,
            ),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: issue.priorityColor.withValues(alpha: 0.15),
                  border: Border.all(color: AppColors.black, width: 1.5),
                ),
                child: Icon(issue.categoryIcon, color: issue.priorityColor),
              ),
              const SizedBox(width: AppDimensions.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            issue.title,
                            style: AppTextStyles.labelLarge,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: AppDimensions.sm),
                        _MiniStatusTag(label: issue.statusLabel, color: issue.statusColor),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      issue.description.isEmpty ? 'No description provided' : issue.description,
                      style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: AppDimensions.sm),
                    Wrap(
                      spacing: AppDimensions.sm,
                      runSpacing: AppDimensions.xs,
                      children: [
                        _MiniTag(
                          icon: Icons.schedule_outlined,
                          label: _formatDate(issue.createdAt),
                        ),
                        _MiniTag(
                          icon: Icons.bed_outlined,
                          label: issue.roomNumber == null ? 'No room' : 'Room ${issue.roomNumber}',
                        ),
                        if (issue.assignedTo != null)
                          _MiniTag(
                            icon: Icons.person_outline,
                            label: issue.assignedTo!,
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatDate(DateTime value) {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return '${months[value.month - 1]} ${value.day}';
  }
}

class _IssueDetailPanel extends StatelessWidget {
  final HostelIssue? issue;
  final List<_LocalIssueNote> notes;
  final TextEditingController noteController;
  final VoidCallback? onAddNote;

  const _IssueDetailPanel({
    required this.issue,
    required this.notes,
    required this.noteController,
    required this.onAddNote,
  });

  @override
  Widget build(BuildContext context) {
    return PecCard(
      color: AppColors.white,
      child: issue == null
          ? SizedBox(
              height: 520,
              child: Center(
                child: Text(
                  'Select an issue to view details',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
              ),
            )
          : Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(issue!.title, style: AppTextStyles.heading3),
                          const SizedBox(height: AppDimensions.xs),
                          Text(
                            issue!.description.isEmpty
                                ? 'No description provided.'
                                : issue!.description,
                            style: AppTextStyles.bodyMedium.copyWith(
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: AppDimensions.md),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        _MiniStatusTag(label: issue!.statusLabel, color: issue!.statusColor),
                        const SizedBox(height: AppDimensions.xs),
                        _MiniStatusTag(label: issue!.priorityLabel.toUpperCase(), color: issue!.priorityColor),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: AppDimensions.lg),
                Row(
                  children: [
                    Expanded(
                      child: _DetailStat(label: 'Category', value: issue!.category.toUpperCase()),
                    ),
                    const SizedBox(width: AppDimensions.sm),
                    Expanded(
                      child: _DetailStat(label: 'Room', value: issue!.roomNumber ?? 'N/A'),
                    ),
                    const SizedBox(width: AppDimensions.sm),
                    Expanded(
                      child: _DetailStat(label: 'Assigned To', value: issue!.assignedTo ?? 'Pending'),
                    ),
                  ],
                ),
                const SizedBox(height: AppDimensions.lg),
                Text('Progress', style: AppTextStyles.labelLarge),
                const SizedBox(height: AppDimensions.sm),
                _StatusStepper(step: issue!.progressStep),
                if (issue!.imageUrl != null) ...[
                  const SizedBox(height: AppDimensions.lg),
                  Text('Attached Photo', style: AppTextStyles.labelLarge),
                  const SizedBox(height: AppDimensions.sm),
                  _ImagePreview(imageUrl: issue!.imageUrl!),
                ],
                const SizedBox(height: AppDimensions.lg),
                Text('Activity', style: AppTextStyles.labelLarge),
                const SizedBox(height: AppDimensions.sm),
                if (notes.isEmpty)
                  Text(
                    'No internal notes yet. Add the first update below.',
                    style: AppTextStyles.bodySmall.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  )
                else
                  Column(
                    children: [
                      for (final note in notes)
                        Padding(
                          padding: const EdgeInsets.only(bottom: AppDimensions.sm),
                          child: _NoteCard(note: note),
                        ),
                    ],
                  ),
                const SizedBox(height: AppDimensions.sm),
                PecCard(
                  color: AppColors.bgSurface,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Add internal note', style: AppTextStyles.labelLarge),
                      const SizedBox(height: AppDimensions.sm),
                      TextField(
                        controller: noteController,
                        minLines: 3,
                        maxLines: 5,
                        decoration: const InputDecoration(
                          hintText: 'Write a status update or follow-up note...',
                          border: OutlineInputBorder(),
                        ),
                      ),
                      const SizedBox(height: AppDimensions.sm),
                      Align(
                        alignment: Alignment.centerRight,
                        child: ElevatedButton.icon(
                          onPressed: onAddNote,
                          icon: const Icon(Icons.send_outlined),
                          label: const Text('Send update'),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
    );
  }
}

class _DetailStat extends StatelessWidget {
  final String label;
  final String value;

  const _DetailStat({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return PecCard(
      color: AppColors.bgSurface,
      padding: const EdgeInsets.all(AppDimensions.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label.toUpperCase(), style: AppTextStyles.labelSmall),
          const SizedBox(height: AppDimensions.xs),
          Text(value, style: AppTextStyles.labelLarge),
        ],
      ),
    );
  }
}

class _ImagePreview extends StatelessWidget {
  final String imageUrl;

  const _ImagePreview({required this.imageUrl});

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(minHeight: 160),
      decoration: BoxDecoration(
        border: Border.all(color: AppColors.black, width: 2),
        color: AppColors.bgSurface,
      ),
      child: imageUrl.startsWith('http')
          ? Image.network(
              imageUrl,
              fit: BoxFit.cover,
              width: double.infinity,
              errorBuilder: (_, __, ___) => const _BrokenImagePlaceholder(),
            )
          : const _BrokenImagePlaceholder(),
    );
  }
}

class _BrokenImagePlaceholder extends StatelessWidget {
  const _BrokenImagePlaceholder();

  @override
  Widget build(BuildContext context) {
    return const SizedBox(
      height: 160,
      child: Center(
        child: Icon(Icons.image_not_supported_outlined, size: 40),
      ),
    );
  }
}

class _MiniTag extends StatelessWidget {
  final IconData icon;
  final String label;

  const _MiniTag({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.bgSurface,
        border: Border.all(color: AppColors.borderLight, width: 1.2),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14),
          const SizedBox(width: 4),
          Text(label, style: AppTextStyles.labelSmall),
        ],
      ),
    );
  }
}

class _MiniStatusTag extends StatelessWidget {
  final String label;
  final Color color;

  const _MiniStatusTag({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color,
        border: Border.all(color: AppColors.black, width: 1.5),
      ),
      child: Text(label.toUpperCase(), style: AppTextStyles.labelSmall.copyWith(color: AppColors.black)),
    );
  }
}

class _LocalIssueNote {
  final String text;
  final DateTime time;
  final String author;

  const _LocalIssueNote({
    required this.text,
    required this.time,
    required this.author,
  });
}

class _NoteCard extends StatelessWidget {
  final _LocalIssueNote note;

  const _NoteCard({required this.note});

  @override
  Widget build(BuildContext context) {
    return PecCard(
      color: AppColors.bgSurface,
      padding: const EdgeInsets.all(AppDimensions.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(note.author, style: AppTextStyles.labelLarge),
              const Spacer(),
              Text(_formatTime(note.time), style: AppTextStyles.labelSmall),
            ],
          ),
          const SizedBox(height: AppDimensions.xs),
          Text(note.text, style: AppTextStyles.bodyMedium),
        ],
      ),
    );
  }

  String _formatTime(DateTime value) {
    final hour = value.hour % 12 == 0 ? 12 : value.hour % 12;
    final minute = value.minute.toString().padLeft(2, '0');
    final period = value.hour >= 12 ? 'PM' : 'AM';
    return '$hour:$minute $period';
  }
}

class _StatusStepper extends StatelessWidget {
  final int step;
  const _StatusStepper({required this.step});

  static const _labels = ['Open', 'In Progress', 'Resolved', 'Closed'];
  static const _colors = [
    AppColors.warning,
    AppColors.blue,
    AppColors.green,
    AppColors.textSecondary,
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
                    width: 1.5,
                  ),
                ),
                child: done
                    ? const Icon(Icons.check, size: 10, color: AppColors.black)
                    : null,
              ),
              if (i < _labels.length - 1)
                Expanded(
                  child: Container(
                    height: 2,
                    color: i < step ? _colors[i] : AppColors.borderLight,
                  ),
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
  ConsumerState<_ReportIssueSheet> createState() => _ReportIssueSheetState();
}

class _ReportIssueSheetState extends ConsumerState<_ReportIssueSheet> {
  final _titleCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _roomCtrl = TextEditingController();
  String _category = 'plumbing';
  String _priority = 'medium';
  String? _imageUrl;

  static const _categories = [
    'plumbing',
    'electrical',
    'cleaning',
    'furniture',
    'network',
    'other',
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
            border: Border(top: BorderSide(color: AppColors.black, width: 2)),
          ),
          child: Column(
            children: [
              Container(
                margin: const EdgeInsets.symmetric(vertical: AppDimensions.sm),
                width: 40,
                height: 4,
                color: AppColors.borderLight,
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppDimensions.md),
                child: Text('REPORT AN ISSUE', style: AppTextStyles.labelLarge),
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
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: AppDimensions.sm),
                    TextField(
                      controller: _descCtrl,
                      maxLines: 3,
                      decoration: const InputDecoration(
                        labelText: 'Description',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: AppDimensions.sm),
                    TextField(
                      controller: _roomCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Room Number (optional)',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: AppDimensions.md),
                    Text('Category', style: AppTextStyles.labelSmall),
                    const SizedBox(height: AppDimensions.xs),
                    Wrap(
                      spacing: 6,
                      children: _categories
                          .map(
                            (category) => GestureDetector(
                              onTap: () => setState(() => _category = category),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                margin: const EdgeInsets.only(bottom: 6),
                                decoration: BoxDecoration(
                                  color: _category == category ? AppColors.yellow : Colors.transparent,
                                  border: Border.all(color: AppColors.black, width: 1.5),
                                ),
                                child: Text(
                                  category.toUpperCase(),
                                  style: AppTextStyles.labelSmall.copyWith(fontSize: 9),
                                ),
                              ),
                            ),
                          )
                          .toList(),
                    ),
                    const SizedBox(height: AppDimensions.sm),
                    Text('Priority', style: AppTextStyles.labelSmall),
                    const SizedBox(height: AppDimensions.xs),
                    Row(
                      children: _priorities
                          .map(
                            (priority) => Expanded(
                              child: GestureDetector(
                                onTap: () => setState(() => _priority = priority),
                                child: Container(
                                  margin: const EdgeInsets.only(right: 4),
                                  padding: const EdgeInsets.symmetric(vertical: 8),
                                  decoration: BoxDecoration(
                                    color: _priority == priority ? AppColors.yellow : Colors.transparent,
                                    border: Border.all(color: AppColors.black, width: 1.5),
                                  ),
                                  child: Text(
                                    priority.toUpperCase(),
                                    style: AppTextStyles.labelSmall.copyWith(fontSize: 8),
                                    textAlign: TextAlign.center,
                                  ),
                                ),
                              ),
                            ),
                          )
                          .toList(),
                    ),
                    const SizedBox(height: AppDimensions.sm),
                    GestureDetector(
                      onTap: _pickImage,
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        decoration: BoxDecoration(
                          border: Border.all(color: AppColors.borderLight, width: 1.5),
                          color: AppColors.bgSurface,
                        ),
                        child: Column(
                          children: [
                            Icon(
                              _imageUrl != null ? Icons.check_circle_outline : Icons.camera_alt_outlined,
                              color: _imageUrl != null ? AppColors.green : AppColors.textSecondary,
                            ),
                            Text(
                              _imageUrl != null ? 'Photo attached' : 'Attach Photo (optional)',
                              style: AppTextStyles.caption,
                            ),
                          ],
                        ),
                      ),
                    ),
                    if (formAsync is AsyncError)
                      Padding(
                        padding: const EdgeInsets.only(top: AppDimensions.sm),
                        child: Text(
                          formAsync.error.toString(),
                          style: AppTextStyles.bodySmall.copyWith(color: AppColors.red),
                        ),
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
                      border: Border.all(color: AppColors.black, width: 2),
                      boxShadow: const [
                        BoxShadow(offset: Offset(4, 4), color: AppColors.black),
                      ],
                    ),
                    child: formAsync.isLoading
                        ? const Center(
                            child: SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: AppColors.black,
                              ),
                            ),
                          )
                        : Text(
                            'SUBMIT ISSUE',
                            style: AppTextStyles.labelLarge.copyWith(color: AppColors.black),
                            textAlign: TextAlign.center,
                          ),
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
    if (file != null) {
      setState(() => _imageUrl = file.path);
    }
  }

  Future<void> _submit() async {
    final title = _titleCtrl.text.trim();
    if (title.isEmpty) {
      return;
    }
    await ref.read(issueFormProvider.notifier).submit(
          title: title,
          description: _descCtrl.text.trim(),
          category: _category,
          priority: _priority,
          roomNumber: _roomCtrl.text.trim().isEmpty ? null : _roomCtrl.text.trim(),
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

class _FilterChip extends StatelessWidget {
  final String label;
  final bool active;
  final VoidCallback onTap;

  const _FilterChip({
    required this.label,
    required this.active,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: active ? AppColors.yellow : AppColors.white,
          border: Border.all(color: AppColors.black, width: 2),
          boxShadow: active
              ? const [BoxShadow(offset: Offset(2, 2), color: AppColors.black)]
              : null,
        ),
        child: Text(
          label.toUpperCase(),
          style: AppTextStyles.labelSmall.copyWith(fontSize: 10),
        ),
      ),
    );
  }
}
