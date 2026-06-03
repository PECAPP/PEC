import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/pec_button.dart';
import '../../../../shared/widgets/pec_card.dart';
import '../../data/models/portfolio_model.dart';
import '../providers/portfolio_provider.dart';

class PortfolioScreen extends ConsumerWidget {
  const PortfolioScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final projectsAsync = ref.watch(portfolioProvider);
    final actions = ref.watch(portfolioActionsProvider);

    return Scaffold(
      backgroundColor: AppColors.black,
      appBar: AppBar(
        backgroundColor: AppColors.black,
        title: Text('MY PORTFOLIO', style: AppTextStyles.heading3),
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppColors.yellow,
        foregroundColor: AppColors.black,
        onPressed: actions.isLoading
            ? null
            : () => _showAddProjectDialog(context, ref),
        child: const Icon(Icons.add),
      ),
      body: projectsAsync.when(
        loading: () =>
            const Center(child: CircularProgressIndicator(color: AppColors.yellow)),
        error: (e, _) => Center(
          child: Text('Error: $e',
              style: AppTextStyles.bodyMedium.copyWith(color: AppColors.red)),
        ),
        data: (projects) {
          if (projects.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.work_outline, color: AppColors.textSecondary, size: 64),
                  const SizedBox(height: AppDimensions.md),
                  Text('No projects yet',
                      style: AppTextStyles.heading3
                          .copyWith(color: AppColors.textSecondary)),
                  const SizedBox(height: AppDimensions.sm),
                  Text('Tap + to add your first project',
                      style: AppTextStyles.bodyMedium
                          .copyWith(color: AppColors.textSecondary)),
                ],
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.fromLTRB(
                AppDimensions.md, AppDimensions.md, AppDimensions.md, 100),
            itemCount: projects.length,
            itemBuilder: (context, i) => _ProjectCard(
              project: projects[i],
              onDelete: () => ref
                  .read(portfolioActionsProvider.notifier)
                  .deleteProject(projects[i].id),
            ),
          );
        },
      ),
    );
  }

  void _showAddProjectDialog(BuildContext context, WidgetRef ref) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _AddProjectSheet(
        onAdd: ({
          required String title,
          String? description,
          required List<String> techStack,
          String? repoUrl,
          String? demoUrl,
        }) {
          ref.read(portfolioActionsProvider.notifier).addProject(
                title: title,
                description: description,
                techStack: techStack,
                repoUrl: repoUrl,
                demoUrl: demoUrl,
              );
        },
      ),
    );
  }
}

class _ProjectCard extends StatelessWidget {
  final PortfolioProject project;
  final VoidCallback onDelete;
  const _ProjectCard({required this.project, required this.onDelete});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppDimensions.md),
      child: Dismissible(
        key: ValueKey(project.id),
        direction: DismissDirection.endToStart,
        background: Container(
          alignment: Alignment.centerRight,
          padding: const EdgeInsets.only(right: AppDimensions.lg),
          decoration: BoxDecoration(
            color: AppColors.red,
            border: Border.all(color: AppColors.black, width: 2),
          ),
          child: const Icon(Icons.delete_outline, color: AppColors.white),
        ),
        confirmDismiss: (_) async {
          return await showDialog<bool>(
                context: context,
                builder: (ctx) => AlertDialog(
                  backgroundColor: AppColors.surface,
                  title: Text('Delete project?', style: AppTextStyles.heading3),
                  content: Text('This cannot be undone.',
                      style: AppTextStyles.bodyMedium
                          .copyWith(color: AppColors.textSecondary)),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(ctx, false),
                      child: const Text('CANCEL'),
                    ),
                    TextButton(
                      onPressed: () => Navigator.pop(ctx, true),
                      child: Text('DELETE',
                          style: TextStyle(color: AppColors.red)),
                    ),
                  ],
                ),
              ) ??
              false;
        },
        onDismissed: (_) => onDelete(),
        child: PecCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (project.imageUrl != null)
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: Image.network(
                    project.imageUrl!,
                    height: 160,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => const SizedBox.shrink(),
                  ),
                ),
              if (project.imageUrl != null)
                const SizedBox(height: AppDimensions.md),
              Text(project.title,
                  style: AppTextStyles.heading3.copyWith(color: AppColors.yellow)),
              if (project.description != null) ...[
                const SizedBox(height: AppDimensions.xs),
                Text(project.description!,
                    style: AppTextStyles.bodyMedium
                        .copyWith(color: AppColors.textSecondary)),
              ],
              if (project.techStack.isNotEmpty) ...[
                const SizedBox(height: AppDimensions.sm),
                Wrap(
                  spacing: AppDimensions.xs,
                  runSpacing: AppDimensions.xs,
                  children: project.techStack
                      .map((t) => _TechChip(label: t))
                      .toList(),
                ),
              ],
              if (project.repoUrl != null || project.demoUrl != null) ...[
                const SizedBox(height: AppDimensions.md),
                Row(
                  children: [
                    if (project.repoUrl != null)
                      _LinkButton(
                        label: 'GITHUB',
                        icon: Icons.code,
                        url: project.repoUrl!,
                      ),
                    if (project.repoUrl != null && project.demoUrl != null)
                      const SizedBox(width: AppDimensions.sm),
                    if (project.demoUrl != null)
                      _LinkButton(
                        label: 'LIVE DEMO',
                        icon: Icons.open_in_new,
                        url: project.demoUrl!,
                      ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _TechChip extends StatelessWidget {
  final String label;
  const _TechChip({required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        border: Border.all(color: AppColors.yellow, width: 1),
        color: AppColors.yellow.withValues(alpha: 0.1),
      ),
      child: Text(label,
          style: AppTextStyles.caption.copyWith(color: AppColors.yellow)),
    );
  }
}

class _LinkButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final String url;
  const _LinkButton(
      {required this.label, required this.icon, required this.url});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () async {
        final uri = Uri.tryParse(url);
        if (uri != null) await launchUrl(uri, mode: LaunchMode.externalApplication);
      },
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: AppColors.textSecondary),
          const SizedBox(width: 4),
          Text(label,
              style: AppTextStyles.labelSmall
                  .copyWith(color: AppColors.textSecondary,
                      decoration: TextDecoration.underline)),
        ],
      ),
    );
  }
}

class _AddProjectSheet extends StatefulWidget {
  final void Function({
    required String title,
    String? description,
    required List<String> techStack,
    String? repoUrl,
    String? demoUrl,
  }) onAdd;

  const _AddProjectSheet({required this.onAdd});

  @override
  State<_AddProjectSheet> createState() => _AddProjectSheetState();
}

class _AddProjectSheetState extends State<_AddProjectSheet> {
  final _titleCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _techCtrl = TextEditingController();
  final _repoCtrl = TextEditingController();
  final _demoCtrl = TextEditingController();
  final List<String> _techStack = [];
  String? _error;

  @override
  void dispose() {
    _titleCtrl.dispose();
    _descCtrl.dispose();
    _techCtrl.dispose();
    _repoCtrl.dispose();
    _demoCtrl.dispose();
    super.dispose();
  }

  void _addTech() {
    final t = _techCtrl.text.trim();
    if (t.isNotEmpty && !_techStack.contains(t)) {
      setState(() {
        _techStack.add(t);
        _techCtrl.clear();
      });
    }
  }

  void _submit() {
    if (_titleCtrl.text.trim().isEmpty) {
      setState(() => _error = 'Title is required');
      return;
    }
    widget.onAdd(
      title: _titleCtrl.text.trim(),
      description: _descCtrl.text.trim().isEmpty
          ? null
          : _descCtrl.text.trim(),
      techStack: List.from(_techStack),
      repoUrl: _repoCtrl.text.trim().isEmpty ? null : _repoCtrl.text.trim(),
      demoUrl: _demoCtrl.text.trim().isEmpty ? null : _demoCtrl.text.trim(),
    );
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final bottom = MediaQuery.of(context).viewInsets.bottom;
    const style = InputDecorationTheme(
      border: OutlineInputBorder(
          borderSide: BorderSide(color: AppColors.white, width: 1.5)),
      enabledBorder: OutlineInputBorder(
          borderSide: BorderSide(color: AppColors.white, width: 1.5)),
      focusedBorder: OutlineInputBorder(
          borderSide: BorderSide(color: AppColors.yellow, width: 2)),
      labelStyle: TextStyle(color: AppColors.white),
    );

    return Container(
      margin: const EdgeInsets.all(AppDimensions.md),
      padding: EdgeInsets.fromLTRB(
          AppDimensions.lg, AppDimensions.lg, AppDimensions.lg,
          AppDimensions.lg + bottom),
      decoration: BoxDecoration(
        color: AppColors.surface,
        border: Border.all(color: AppColors.black, width: 2),
        boxShadow: const [BoxShadow(offset: Offset(4, 4))],
      ),
      child: SingleChildScrollView(
        child: Theme(
          data: ThemeData.dark().copyWith(inputDecorationTheme: style),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('ADD PROJECT', style: AppTextStyles.heading3),
              const SizedBox(height: AppDimensions.lg),
              TextField(
                controller: _titleCtrl,
                style:
                    AppTextStyles.bodyMedium.copyWith(color: AppColors.white),
                decoration: const InputDecoration(labelText: 'Title *'),
              ),
              const SizedBox(height: AppDimensions.md),
              TextField(
                controller: _descCtrl,
                maxLines: 3,
                style:
                    AppTextStyles.bodyMedium.copyWith(color: AppColors.white),
                decoration: const InputDecoration(labelText: 'Description'),
              ),
              const SizedBox(height: AppDimensions.md),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _techCtrl,
                      style: AppTextStyles.bodyMedium
                          .copyWith(color: AppColors.white),
                      decoration:
                          const InputDecoration(labelText: 'Tech Stack'),
                      onSubmitted: (_) => _addTech(),
                    ),
                  ),
                  const SizedBox(width: AppDimensions.sm),
                  IconButton(
                    onPressed: _addTech,
                    icon: const Icon(Icons.add_circle_outline,
                        color: AppColors.yellow),
                  ),
                ],
              ),
              if (_techStack.isNotEmpty) ...[
                const SizedBox(height: AppDimensions.sm),
                Wrap(
                  spacing: AppDimensions.xs,
                  runSpacing: AppDimensions.xs,
                  children: _techStack
                      .map((t) => Chip(
                            label: Text(t,
                                style: AppTextStyles.caption
                                    .copyWith(color: AppColors.black)),
                            backgroundColor: AppColors.yellow,
                            onDeleted: () =>
                                setState(() => _techStack.remove(t)),
                            deleteIconColor: AppColors.black,
                          ))
                      .toList(),
                ),
              ],
              const SizedBox(height: AppDimensions.md),
              TextField(
                controller: _repoCtrl,
                style:
                    AppTextStyles.bodyMedium.copyWith(color: AppColors.white),
                decoration: const InputDecoration(
                    labelText: 'GitHub URL', hintText: 'https://github.com/...'),
              ),
              const SizedBox(height: AppDimensions.md),
              TextField(
                controller: _demoCtrl,
                style:
                    AppTextStyles.bodyMedium.copyWith(color: AppColors.white),
                decoration: const InputDecoration(
                    labelText: 'Demo URL', hintText: 'https://...'),
              ),
              if (_error != null) ...[
                const SizedBox(height: AppDimensions.sm),
                Text(_error!,
                    style:
                        AppTextStyles.bodySmall.copyWith(color: AppColors.red)),
              ],
              const SizedBox(height: AppDimensions.lg),
              PecButton(
                label: 'ADD PROJECT',
                onPressed: _submit,
                fullWidth: true,
                color: AppColors.yellow,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
