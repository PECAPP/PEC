import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:share_plus/share_plus.dart';
import 'package:path_provider/path_provider.dart';
import 'dart:io';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../features/auth/presentation/providers/auth_provider.dart';
import '../../../../shared/widgets/pec_card.dart';
import '../../../../shared/widgets/pec_error_state.dart';
import '../../../../shared/widgets/pec_shimmer.dart';
import '../../data/models/resume_model.dart';
import '../providers/resume_provider.dart';

class ResumeEditorScreen extends ConsumerStatefulWidget {
  const ResumeEditorScreen({super.key});

  @override
  ConsumerState<ResumeEditorScreen> createState() =>
      _ResumeEditorScreenState();
}

class _ResumeEditorScreenState extends ConsumerState<ResumeEditorScreen> {
  bool _saving = false;
  bool _showPreview = false;

  @override
  Widget build(BuildContext context) {
    final resumeAsync = ref.watch(resumeProvider);
    final user = ref.watch(authNotifierProvider).user;

    return Scaffold(
      appBar: AppBar(
        title: const Text('RESUME'),
        actions: [
          if (!_showPreview)
            IconButton(
              icon: const Icon(Icons.visibility_outlined),
              tooltip: 'Preview PDF',
              onPressed: resumeAsync.value != null
                  ? () => setState(() => _showPreview = true)
                  : null,
            ),
          if (_showPreview)
            IconButton(
              icon: const Icon(Icons.edit_outlined),
              onPressed: () => setState(() => _showPreview = false),
            ),
          IconButton(
            icon: const Icon(Icons.share_outlined),
            onPressed: resumeAsync.value != null && user != null
                ? () => _shareResume(resumeAsync.value!, user.name)
                : null,
          ),
          TextButton(
            onPressed: _saving
                ? null
                : () async {
                    setState(() => _saving = true);
                    final ok =
                        await ref.read(resumeProvider.notifier).save();
                    setState(() => _saving = false);
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                        content: Text(ok
                            ? 'Resume saved'
                            : 'Save failed'),
                        backgroundColor:
                            ok ? AppColors.green : AppColors.red,
                      ));
                    }
                  },
            child: _saving
                ? const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(
                        strokeWidth: 2, color: AppColors.yellow))
                : Text('SAVE',
                    style: AppTextStyles.labelSmall
                        .copyWith(color: AppColors.yellow)),
          ),
        ],
      ),
      body: resumeAsync.when(
        loading: () => ListView.separated(
          padding: const EdgeInsets.all(AppDimensions.md),
          itemCount: 5,
          separatorBuilder: (_, __) =>
              const SizedBox(height: AppDimensions.sm),
          itemBuilder: (_, __) =>
              const PecShimmerBox(height: 80, width: double.infinity),
        ),
        error: (e, _) => PecErrorState(
          message: e.toString(),
          onRetry: () => ref.read(resumeProvider.notifier).reload(),
        ),
        data: (resume) => _showPreview
            ? _PdfPreview(resume: resume, name: user?.name ?? 'Student')
            : _ResumeEditor(
                resume: resume,
                onUpdate: (updater) =>
                    ref.read(resumeProvider.notifier).update(updater),
              ),
      ),
    );
  }

  Future<void> _shareResume(ResumeData resume, String name) async {
    final doc = _buildPdf(resume, name);
    final bytes = await doc.save();
    final dir = await getTemporaryDirectory();
    final file = File('${dir.path}/resume_$name.pdf');
    await file.writeAsBytes(bytes);
    await Share.shareXFiles([XFile(file.path)],
        subject: '$name — Resume');
  }
}

// ── PDF Preview ───────────────────────────────────────────────────────────────
class _PdfPreview extends StatelessWidget {
  final ResumeData resume;
  final String name;
  const _PdfPreview({required this.resume, required this.name});

  @override
  Widget build(BuildContext context) {
    return PdfPreview(
      build: (format) async => _buildPdf(resume, name).save(),
      allowPrinting: true,
      allowSharing: true,
      canChangePageFormat: false,
    );
  }
}

pw.Document _buildPdf(ResumeData r, String name) {
  final doc = pw.Document();
  doc.addPage(pw.MultiPage(
    pageFormat: PdfPageFormat.a4,
    margin: const pw.EdgeInsets.symmetric(horizontal: 40, vertical: 36),
    build: (ctx) => [
      // Header
      pw.Text(name,
          style: pw.TextStyle(
              fontSize: 22, fontWeight: pw.FontWeight.bold)),
      pw.SizedBox(height: 2),
      if (r.objective != null && r.objective!.isNotEmpty) ...[
        pw.SizedBox(height: 8),
        pw.Text(r.objective!,
            style: const pw.TextStyle(fontSize: 10)),
        pw.Divider(),
      ] else
        pw.Divider(),

      // Education
      if (r.education.isNotEmpty) ...[
        _pdfSection('EDUCATION'),
        for (final e in r.education)
          _pdfEntry(
            title: e.degree,
            subtitle: e.institution,
            date: '${e.startYear} – ${e.endYear ?? 'Present'}',
            detail: e.cgpa != null ? 'CGPA: ${e.cgpa}' : null,
          ),
        pw.SizedBox(height: 8),
      ],

      // Experience
      if (r.experience.isNotEmpty) ...[
        _pdfSection('EXPERIENCE'),
        for (final e in r.experience)
          _pdfEntry(
            title: e.role,
            subtitle: e.company,
            date: '${e.startDate} – ${e.endDate ?? 'Present'}',
            detail: e.description,
          ),
        pw.SizedBox(height: 8),
      ],

      // Projects
      if (r.projects.isNotEmpty) ...[
        _pdfSection('PROJECTS'),
        for (final p in r.projects)
          _pdfEntry(
            title: p.title,
            subtitle: p.techStack.join(', '),
            detail: p.description,
          ),
        pw.SizedBox(height: 8),
      ],

      // Skills
      if (r.skills.isNotEmpty) ...[
        _pdfSection('SKILLS'),
        pw.Wrap(
          spacing: 8,
          runSpacing: 4,
          children: r.skills
              .map((s) => pw.Container(
                    padding: const pw.EdgeInsets.symmetric(
                        horizontal: 6, vertical: 2),
                    decoration: pw.BoxDecoration(
                        border: pw.Border.all(width: 0.5)),
                    child: pw.Text(s,
                        style: const pw.TextStyle(fontSize: 9)),
                  ))
              .toList(),
        ),
        pw.SizedBox(height: 8),
      ],

      // Certifications
      if (r.certifications.isNotEmpty) ...[
        _pdfSection('CERTIFICATIONS'),
        for (final c in r.certifications)
          pw.Row(
            children: [
              pw.Text('• ${c.name}',
                  style: const pw.TextStyle(fontSize: 10)),
              if (c.issuer != null)
                pw.Text(' — ${c.issuer}',
                    style: const pw.TextStyle(fontSize: 9)),
              if (c.year != null)
                pw.Text('  (${c.year})',
                    style: const pw.TextStyle(fontSize: 9)),
            ],
          ),
      ],
    ],
  ));
  return doc;
}

pw.Widget _pdfSection(String title) => pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.start,
      children: [
        pw.Text(title,
            style: pw.TextStyle(
                fontSize: 11, fontWeight: pw.FontWeight.bold)),
        pw.Divider(thickness: 0.5),
      ],
    );

pw.Widget _pdfEntry({
  required String title,
  String? subtitle,
  String? date,
  String? detail,
}) =>
    pw.Padding(
      padding: const pw.EdgeInsets.only(bottom: 6),
      child: pw.Column(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          pw.Row(
            mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
            children: [
              pw.Text(title,
                  style: pw.TextStyle(
                      fontSize: 10, fontWeight: pw.FontWeight.bold)),
              if (date != null)
                pw.Text(date,
                    style: const pw.TextStyle(fontSize: 9)),
            ],
          ),
          if (subtitle != null && subtitle.isNotEmpty)
            pw.Text(subtitle,
                style: const pw.TextStyle(
                    fontSize: 9,
                    color: PdfColors.grey700)),
          if (detail != null && detail.isNotEmpty)
            pw.Text(detail,
                style: const pw.TextStyle(fontSize: 9)),
        ],
      ),
    );

// ── Resume Editor ─────────────────────────────────────────────────────────────
class _ResumeEditor extends StatelessWidget {
  final ResumeData resume;
  final void Function(ResumeData Function(ResumeData)) onUpdate;
  const _ResumeEditor(
      {required this.resume, required this.onUpdate});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(AppDimensions.md),
      children: [
        _SectionCard(
          title: 'OBJECTIVE',
          icon: Icons.short_text_outlined,
          onAdd: null,
          children: [
            _ObjectiveField(
                value: resume.objective ?? '',
                onChanged: (v) => onUpdate((r) => r.copyWith(objective: v))),
          ],
        ),
        const SizedBox(height: AppDimensions.sm),
        _SectionCard(
          title: 'EDUCATION',
          icon: Icons.school_outlined,
          onAdd: () => _showEducationDialog(context, resume, onUpdate),
          children: resume.education
              .asMap()
              .entries
              .map((e) => _EducationTile(
                    item: e.value,
                    onDelete: () => onUpdate((r) {
                      final list = List<ResumeEducation>.from(r.education);
                      list.removeAt(e.key);
                      return r.copyWith(education: list);
                    }),
                  ))
              .toList(),
        ),
        const SizedBox(height: AppDimensions.sm),
        _SectionCard(
          title: 'EXPERIENCE',
          icon: Icons.work_outline,
          onAdd: () => _showExperienceDialog(context, resume, onUpdate),
          children: resume.experience
              .asMap()
              .entries
              .map((e) => _ExperienceTile(
                    item: e.value,
                    onDelete: () => onUpdate((r) {
                      final list = List<ResumeExperience>.from(r.experience);
                      list.removeAt(e.key);
                      return r.copyWith(experience: list);
                    }),
                  ))
              .toList(),
        ),
        const SizedBox(height: AppDimensions.sm),
        _SectionCard(
          title: 'PROJECTS',
          icon: Icons.code_outlined,
          onAdd: () => _showProjectDialog(context, resume, onUpdate),
          children: resume.projects
              .asMap()
              .entries
              .map((e) => _ProjectTile(
                    item: e.value,
                    onDelete: () => onUpdate((r) {
                      final list = List<ResumeProject>.from(r.projects);
                      list.removeAt(e.key);
                      return r.copyWith(projects: list);
                    }),
                  ))
              .toList(),
        ),
        const SizedBox(height: AppDimensions.sm),
        _SectionCard(
          title: 'SKILLS',
          icon: Icons.bolt_outlined,
          onAdd: () => _showSkillDialog(context, resume, onUpdate),
          children: resume.skills.isEmpty
              ? []
              : [
                  Wrap(
                    spacing: 6,
                    runSpacing: 4,
                    children: resume.skills
                        .asMap()
                        .entries
                        .map((e) => _SkillChip(
                              label: e.value,
                              onDelete: () => onUpdate((r) {
                                final list = List<String>.from(r.skills);
                                list.removeAt(e.key);
                                return r.copyWith(skills: list);
                              }),
                            ))
                        .toList(),
                  ),
                ],
        ),
        const SizedBox(height: AppDimensions.sm),
        _SectionCard(
          title: 'CERTIFICATIONS',
          icon: Icons.verified_outlined,
          onAdd: () => _showCertDialog(context, resume, onUpdate),
          children: resume.certifications
              .asMap()
              .entries
              .map((e) => _CertTile(
                    item: e.value,
                    onDelete: () => onUpdate((r) {
                      final list =
                          List<ResumeCertification>.from(r.certifications);
                      list.removeAt(e.key);
                      return r.copyWith(certifications: list);
                    }),
                  ))
              .toList(),
        ),
        const SizedBox(height: AppDimensions.xxl),
      ],
    );
  }
}

// ── Section card ──────────────────────────────────────────────────────────────
class _SectionCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final VoidCallback? onAdd;
  final List<Widget> children;
  const _SectionCard(
      {required this.title,
      required this.icon,
      required this.onAdd,
      required this.children});

  @override
  Widget build(BuildContext context) {
    return PecCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 16, color: AppColors.yellow),
              const SizedBox(width: AppDimensions.xs),
              Text(title, style: AppTextStyles.labelLarge),
              const Spacer(),
              if (onAdd != null)
                GestureDetector(
                  onTap: onAdd,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 3),
                    color: AppColors.yellow,
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.add,
                            size: 14, color: AppColors.black),
                        Text('ADD',
                            style: AppTextStyles.labelSmall
                                .copyWith(
                                    color: AppColors.black,
                                    fontSize: 9)),
                      ],
                    ),
                  ),
                ),
            ],
          ),
          if (children.isNotEmpty) ...[
            const SizedBox(height: AppDimensions.sm),
            const Divider(height: 1, color: AppColors.borderLight),
            const SizedBox(height: AppDimensions.sm),
            ...children,
          ],
        ],
      ),
    );
  }
}

// ── Objective ─────────────────────────────────────────────────────────────────
class _ObjectiveField extends StatefulWidget {
  final String value;
  final ValueChanged<String> onChanged;
  const _ObjectiveField({required this.value, required this.onChanged});

  @override
  State<_ObjectiveField> createState() => _ObjectiveFieldState();
}

class _ObjectiveFieldState extends State<_ObjectiveField> {
  late final TextEditingController _ctrl;

  @override
  void initState() {
    super.initState();
    _ctrl = TextEditingController(text: widget.value);
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: _ctrl,
      maxLines: 3,
      onChanged: widget.onChanged,
      decoration: const InputDecoration(
        hintText: 'Write a brief professional objective…',
        border: OutlineInputBorder(
            borderSide: BorderSide(color: AppColors.borderLight)),
        enabledBorder: OutlineInputBorder(
            borderSide: BorderSide(color: AppColors.borderLight)),
        focusedBorder: OutlineInputBorder(
            borderSide: BorderSide(color: AppColors.yellow, width: 2)),
        contentPadding: EdgeInsets.all(10),
      ),
    );
  }
}

// ── Tiles ─────────────────────────────────────────────────────────────────────
class _EducationTile extends StatelessWidget {
  final ResumeEducation item;
  final VoidCallback onDelete;
  const _EducationTile({required this.item, required this.onDelete});

  @override
  Widget build(BuildContext context) => _ItemRow(
        primary: item.degree,
        secondary:
            '${item.institution} · ${item.startYear}–${item.endYear ?? 'Present'}',
        onDelete: onDelete,
      );
}

class _ExperienceTile extends StatelessWidget {
  final ResumeExperience item;
  final VoidCallback onDelete;
  const _ExperienceTile({required this.item, required this.onDelete});

  @override
  Widget build(BuildContext context) => _ItemRow(
        primary: item.role,
        secondary:
            '${item.company} · ${item.startDate}–${item.endDate ?? 'Present'}',
        onDelete: onDelete,
      );
}

class _ProjectTile extends StatelessWidget {
  final ResumeProject item;
  final VoidCallback onDelete;
  const _ProjectTile({required this.item, required this.onDelete});

  @override
  Widget build(BuildContext context) => _ItemRow(
        primary: item.title,
        secondary: item.techStack.join(', '),
        onDelete: onDelete,
      );
}

class _CertTile extends StatelessWidget {
  final ResumeCertification item;
  final VoidCallback onDelete;
  const _CertTile({required this.item, required this.onDelete});

  @override
  Widget build(BuildContext context) => _ItemRow(
        primary: item.name,
        secondary:
            '${item.issuer ?? ''}${item.year != null ? ' (${item.year})' : ''}',
        onDelete: onDelete,
      );
}

class _ItemRow extends StatelessWidget {
  final String primary, secondary;
  final VoidCallback onDelete;
  const _ItemRow(
      {required this.primary,
      required this.secondary,
      required this.onDelete});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppDimensions.xs),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(primary, style: AppTextStyles.labelLarge),
                if (secondary.isNotEmpty)
                  Text(secondary,
                      style: AppTextStyles.caption
                          .copyWith(color: AppColors.textSecondary)),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.delete_outline,
                size: 18, color: AppColors.red),
            onPressed: onDelete,
            padding: EdgeInsets.zero,
            constraints:
                const BoxConstraints(minWidth: 28, minHeight: 28),
          ),
        ],
      ),
    );
  }
}

class _SkillChip extends StatelessWidget {
  final String label;
  final VoidCallback onDelete;
  const _SkillChip({required this.label, required this.onDelete});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        border: Border.all(color: AppColors.black, width: 1.5),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(label, style: AppTextStyles.bodySmall),
          const SizedBox(width: 4),
          GestureDetector(
            onTap: onDelete,
            child: const Icon(Icons.close, size: 12, color: AppColors.red),
          ),
        ],
      ),
    );
  }
}

// ── Add dialogs ───────────────────────────────────────────────────────────────
void _showEducationDialog(BuildContext ctx, ResumeData resume,
    void Function(ResumeData Function(ResumeData)) onUpdate) {
  final inst = TextEditingController();
  final deg = TextEditingController();
  final field = TextEditingController();
  final start = TextEditingController();
  final end = TextEditingController();
  final cgpa = TextEditingController();
  showDialog(
    context: ctx,
    builder: (_) => _FormDialog(
      title: 'Add Education',
      fields: [
        _tf(inst, 'Institution *'),
        _tf(deg, 'Degree *'),
        _tf(field, 'Field of Study'),
        _tf(start, 'Start Year *', TextInputType.number),
        _tf(end, 'End Year'),
        _tf(cgpa, 'CGPA', TextInputType.number),
      ],
      onSave: () {
        if (inst.text.isEmpty || deg.text.isEmpty || start.text.isEmpty) return;
        onUpdate((r) => r.copyWith(education: [
              ...r.education,
              ResumeEducation(
                institution: inst.text,
                degree: deg.text,
                fieldOfStudy:
                    field.text.isEmpty ? null : field.text,
                startYear: start.text,
                endYear: end.text.isEmpty ? null : end.text,
                cgpa: double.tryParse(cgpa.text),
              ),
            ]));
      },
    ),
  );
}

void _showExperienceDialog(BuildContext ctx, ResumeData resume,
    void Function(ResumeData Function(ResumeData)) onUpdate) {
  final company = TextEditingController();
  final role = TextEditingController();
  final start = TextEditingController();
  final end = TextEditingController();
  final desc = TextEditingController();
  showDialog(
    context: ctx,
    builder: (_) => _FormDialog(
      title: 'Add Experience',
      fields: [
        _tf(company, 'Company *'),
        _tf(role, 'Role *'),
        _tf(start, 'Start Date *'),
        _tf(end, 'End Date (blank = Present)'),
        _tf(desc, 'Description', null, 3),
      ],
      onSave: () {
        if (company.text.isEmpty || role.text.isEmpty || start.text.isEmpty)
          return;
        onUpdate((r) => r.copyWith(experience: [
              ...r.experience,
              ResumeExperience(
                company: company.text,
                role: role.text,
                startDate: start.text,
                endDate: end.text.isEmpty ? null : end.text,
                description: desc.text.isEmpty ? null : desc.text,
              ),
            ]));
      },
    ),
  );
}

void _showProjectDialog(BuildContext ctx, ResumeData resume,
    void Function(ResumeData Function(ResumeData)) onUpdate) {
  final title = TextEditingController();
  final desc = TextEditingController();
  final tech = TextEditingController();
  final repo = TextEditingController();
  final demo = TextEditingController();
  showDialog(
    context: ctx,
    builder: (_) => _FormDialog(
      title: 'Add Project',
      fields: [
        _tf(title, 'Project Title *'),
        _tf(desc, 'Description', null, 2),
        _tf(tech, 'Tech Stack (comma-separated)'),
        _tf(repo, 'Repo URL'),
        _tf(demo, 'Demo URL'),
      ],
      onSave: () {
        if (title.text.isEmpty) return;
        onUpdate((r) => r.copyWith(projects: [
              ...r.projects,
              ResumeProject(
                title: title.text,
                description: desc.text.isEmpty ? null : desc.text,
                techStack: tech.text.isEmpty
                    ? []
                    : tech.text.split(',').map((s) => s.trim()).toList(),
                repoUrl: repo.text.isEmpty ? null : repo.text,
                demoUrl: demo.text.isEmpty ? null : demo.text,
              ),
            ]));
      },
    ),
  );
}

void _showSkillDialog(BuildContext ctx, ResumeData resume,
    void Function(ResumeData Function(ResumeData)) onUpdate) {
  final skill = TextEditingController();
  showDialog(
    context: ctx,
    builder: (_) => _FormDialog(
      title: 'Add Skill',
      fields: [_tf(skill, 'Skill *')],
      onSave: () {
        if (skill.text.isEmpty) return;
        onUpdate(
            (r) => r.copyWith(skills: [...r.skills, skill.text.trim()]));
      },
    ),
  );
}

void _showCertDialog(BuildContext ctx, ResumeData resume,
    void Function(ResumeData Function(ResumeData)) onUpdate) {
  final name = TextEditingController();
  final issuer = TextEditingController();
  final year = TextEditingController();
  showDialog(
    context: ctx,
    builder: (_) => _FormDialog(
      title: 'Add Certification',
      fields: [
        _tf(name, 'Certification Name *'),
        _tf(issuer, 'Issuer'),
        _tf(year, 'Year', TextInputType.number),
      ],
      onSave: () {
        if (name.text.isEmpty) return;
        onUpdate((r) => r.copyWith(certifications: [
              ...r.certifications,
              ResumeCertification(
                name: name.text,
                issuer: issuer.text.isEmpty ? null : issuer.text,
                year: year.text.isEmpty ? null : year.text,
              ),
            ]));
      },
    ),
  );
}

Widget _tf(TextEditingController ctrl, String label,
    [TextInputType? type, int maxLines = 1]) =>
    Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: TextField(
        controller: ctrl,
        keyboardType: type,
        maxLines: maxLines,
        decoration: InputDecoration(
          labelText: label,
          border: const OutlineInputBorder(),
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        ),
      ),
    );

class _FormDialog extends StatelessWidget {
  final String title;
  final List<Widget> fields;
  final VoidCallback onSave;
  const _FormDialog(
      {required this.title, required this.fields, required this.onSave});

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(title, style: AppTextStyles.labelLarge),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: fields,
        ),
      ),
      actions: [
        TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel')),
        ElevatedButton(
          style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.yellow),
          onPressed: () {
            onSave();
            Navigator.pop(context);
          },
          child:
              Text('ADD', style: AppTextStyles.labelSmall),
        ),
      ],
    );
  }
}
