import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/pec_card.dart';
import '../../../../shared/widgets/pec_empty_state.dart';
import '../../../../shared/widgets/pec_error_state.dart';
import '../../../../shared/widgets/pec_shimmer.dart';
import '../../data/models/score_model.dart';
import '../providers/score_provider.dart';

class ScoreSheetScreen extends ConsumerWidget {
  const ScoreSheetScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cgpaAsync = ref.watch(cgpaProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('SCORE SHEET'),
        actions: [
          cgpaAsync.whenOrNull(
                data: (data) => IconButton(
                  icon: const Icon(Icons.picture_as_pdf_outlined),
                  onPressed: () => _exportPdf(context, data),
                ),
              ) ??
              const SizedBox.shrink(),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.invalidate(cgpaProvider),
          ),
        ],
      ),
      body: cgpaAsync.when(
        loading: () => _Shimmer(),
        error: (e, _) => PecErrorState(
          message: e.toString(),
          onRetry: () => ref.invalidate(cgpaProvider),
        ),
        data: (data) {
          if (data.semesters.isEmpty) {
            return const PecEmptyState(
              icon: Icons.school_outlined,
              title: 'No score data yet',
              subtitle: 'Your grades will appear here after results are published',
            );
          }
          return _CgpaBody(data: data);
        },
      ),
    );
  }

  Future<void> _exportPdf(BuildContext context, CgpaData data) async {
    final doc = pw.Document();
    doc.addPage(pw.MultiPage(
      pageFormat: PdfPageFormat.a4,
      build: (ctx) => [
        pw.Header(
          level: 0,
          child: pw.Text('PEC — Academic Score Sheet',
              style: pw.TextStyle(
                  fontWeight: pw.FontWeight.bold, fontSize: 18)),
        ),
        pw.SizedBox(height: 8),
        pw.Text('CGPA: ${data.cgpaLabel}  |  ${data.classification}',
            style: pw.TextStyle(fontSize: 14)),
        pw.SizedBox(height: 16),
        for (final sem in data.semesters) ...[
          pw.Text('Semester ${sem.semester}  —  SGPA: ${sem.sgpa.toStringAsFixed(2)}',
              style: pw.TextStyle(
                  fontWeight: pw.FontWeight.bold, fontSize: 13)),
          pw.SizedBox(height: 4),
          pw.TableHelper.fromTextArray(
            headers: ['Code', 'Subject', 'Cr', 'Internal', 'External', 'Total', 'Grade', 'GP'],
            data: sem.subjects.map((s) => [
                  s.courseCode,
                  s.courseName,
                  s.credits.toString(),
                  s.internalMarks?.toStringAsFixed(1) ?? '-',
                  s.externalMarks?.toStringAsFixed(1) ?? '-',
                  s.totalMarks?.toStringAsFixed(1) ?? '-',
                  s.grade ?? '-',
                  s.gradePoints?.toStringAsFixed(1) ?? '-',
                ]).toList(),
            cellStyle: const pw.TextStyle(fontSize: 9),
            headerStyle:
                pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 9),
          ),
          pw.SizedBox(height: 12),
        ],
      ],
    ));
    await Printing.layoutPdf(
        onLayout: (format) async => doc.save());
  }
}

class _CgpaBody extends StatelessWidget {
  final CgpaData data;
  const _CgpaBody({required this.data});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppDimensions.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _CgpaHero(data: data),
          const SizedBox(height: AppDimensions.lg),
          if (data.semesters.length > 1) ...[
            _SectionHeader(title: 'CGPA TREND'),
            const SizedBox(height: AppDimensions.sm),
            _SgpaTrendChart(semesters: data.semesters),
            const SizedBox(height: AppDimensions.lg),
          ],
          _SectionHeader(title: 'CREDIT DISTRIBUTION'),
          const SizedBox(height: AppDimensions.sm),
          _CreditPieChart(semesters: data.semesters),
          const SizedBox(height: AppDimensions.lg),
          _SectionHeader(title: 'SEMESTER RESULTS'),
          const SizedBox(height: AppDimensions.sm),
          for (final sem in data.semesters) ...[
            _SemesterCard(sem: sem),
            const SizedBox(height: AppDimensions.md),
          ],
        ],
      ),
    );
  }
}

class _CgpaHero extends StatelessWidget {
  final CgpaData data;
  const _CgpaHero({required this.data});

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
                Text('CUMULATIVE GPA', style: AppTextStyles.labelSmall),
                const SizedBox(height: 4),
                Text(data.cgpaLabel,
                    style: AppTextStyles.heading1
                        .copyWith(fontSize: 48, color: AppColors.black)),
                const SizedBox(height: AppDimensions.xs),
                Text(data.classification,
                    style: AppTextStyles.labelLarge.copyWith(color: AppColors.black)),
                const SizedBox(height: AppDimensions.sm),
                Text('${data.totalCredits} total credits',
                    style: AppTextStyles.bodySmall.copyWith(color: AppColors.black)),
              ],
            ),
          ),
          Column(
            children: [
              for (final sem in data.semesters.take(4))
                Padding(
                  padding: const EdgeInsets.only(bottom: 4),
                  child: Row(
                    children: [
                      Text('S${sem.semester}',
                          style: AppTextStyles.labelSmall
                              .copyWith(color: AppColors.black, fontSize: 10)),
                      const SizedBox(width: 4),
                      Text(sem.sgpa.toStringAsFixed(2),
                          style: AppTextStyles.labelLarge
                              .copyWith(color: AppColors.black, fontSize: 12)),
                    ],
                  ),
                ),
              if (data.semesters.length > 4)
                Text('+${data.semesters.length - 4} more',
                    style: AppTextStyles.caption.copyWith(color: AppColors.black)),
            ],
          ),
        ],
      ),
    );
  }
}

class _SgpaTrendChart extends StatelessWidget {
  final List<SemesterResult> semesters;
  const _SgpaTrendChart({required this.semesters});

  @override
  Widget build(BuildContext context) {
    final spots = semesters
        .map((s) => FlSpot(s.semester.toDouble(), s.sgpa))
        .toList();

    return PecCard(
      child: SizedBox(
        height: 180,
        child: LineChart(
          LineChartData(
            minY: 0,
            maxY: 10,
            gridData: FlGridData(
              show: true,
              horizontalInterval: 2,
              getDrawingHorizontalLine: (v) =>
                  FlLine(color: AppColors.borderLight, strokeWidth: 1),
              drawVerticalLine: false,
            ),
            titlesData: FlTitlesData(
              leftTitles: AxisTitles(
                sideTitles: SideTitles(
                  showTitles: true,
                  reservedSize: 28,
                  interval: 2,
                  getTitlesWidget: (v, m) => Text(
                    v.toInt().toString(),
                    style: AppTextStyles.caption.copyWith(fontSize: 9),
                  ),
                ),
              ),
              bottomTitles: AxisTitles(
                sideTitles: SideTitles(
                  showTitles: true,
                  getTitlesWidget: (v, m) => Text(
                    'S${v.toInt()}',
                    style: AppTextStyles.caption.copyWith(fontSize: 9),
                  ),
                ),
              ),
              topTitles:
                  const AxisTitles(sideTitles: SideTitles(showTitles: false)),
              rightTitles:
                  const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            ),
            borderData: FlBorderData(
              show: true,
              border: const Border(
                bottom: BorderSide(color: AppColors.black, width: 2),
                left: BorderSide(color: AppColors.black, width: 2),
              ),
            ),
            lineBarsData: [
              LineChartBarData(
                spots: spots,
                isCurved: true,
                color: AppColors.blue,
                barWidth: 2,
                dotData: FlDotData(
                  show: true,
                  getDotPainter: (spot, pct, bar, idx) =>
                      FlDotCirclePainter(
                    radius: 4,
                    color: AppColors.yellow,
                    strokeWidth: 2,
                    strokeColor: AppColors.black,
                  ),
                ),
                belowBarData: BarAreaData(
                  show: true,
                  color: AppColors.blue.withValues(alpha: 0.1),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _CreditPieChart extends StatelessWidget {
  final List<SemesterResult> semesters;
  const _CreditPieChart({required this.semesters});

  @override
  Widget build(BuildContext context) {
    const colors = [
      AppColors.yellow,
      AppColors.blue,
      AppColors.green,
      AppColors.red,
      AppColors.warning,
    ];

    final sections = semesters.asMap().entries.map((e) {
      final color = colors[e.key % colors.length];
      return PieChartSectionData(
        value: e.value.totalCredits.toDouble(),
        color: color,
        title: 'S${e.value.semester}\n${e.value.totalCredits}cr',
        titleStyle:
            AppTextStyles.labelSmall.copyWith(fontSize: 9, color: AppColors.black),
        radius: 80,
        borderSide: const BorderSide(color: AppColors.black, width: 2),
      );
    }).toList();

    return PecCard(
      child: SizedBox(
        height: 200,
        child: PieChart(
          PieChartData(
            sections: sections,
            sectionsSpace: 2,
            centerSpaceRadius: 30,
            borderData: FlBorderData(show: false),
          ),
        ),
      ),
    );
  }
}

class _SemesterCard extends StatefulWidget {
  final SemesterResult sem;
  const _SemesterCard({required this.sem});

  @override
  State<_SemesterCard> createState() => _SemesterCardState();
}

class _SemesterCardState extends State<_SemesterCard> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    return PecCard(
      child: Column(
        children: [
          GestureDetector(
            onTap: () => setState(() => _expanded = !_expanded),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  color: AppColors.yellow,
                  child: Text('SEM ${widget.sem.semester}',
                      style: AppTextStyles.labelLarge
                          .copyWith(color: AppColors.black)),
                ),
                const SizedBox(width: AppDimensions.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                          'SGPA: ${widget.sem.sgpa.toStringAsFixed(2)}',
                          style: AppTextStyles.labelLarge),
                      Text(
                          '${widget.sem.subjects.length} subjects · ${widget.sem.earnedCredits}/${widget.sem.totalCredits} credits',
                          style: AppTextStyles.caption),
                    ],
                  ),
                ),
                Icon(
                    _expanded ? Icons.expand_less : Icons.expand_more,
                    size: 20),
              ],
            ),
          ),
          if (_expanded) ...[
            const SizedBox(height: AppDimensions.sm),
            const Divider(height: 1, color: AppColors.black, thickness: 1),
            const SizedBox(height: AppDimensions.sm),
            // Table header
            _TableRow(
              code: 'CODE',
              name: 'SUBJECT',
              cr: 'CR',
              total: 'TOTAL',
              grade: 'GR',
              gp: 'GP',
              isHeader: true,
            ),
            const Divider(height: 1, color: AppColors.borderLight),
            for (final s in widget.sem.subjects) ...[
              _SubjectRow(score: s),
              const Divider(height: 1, color: AppColors.borderLight),
            ],
          ],
        ],
      ),
    );
  }
}

class _TableRow extends StatelessWidget {
  final String code, name, cr, total, grade, gp;
  final bool isHeader;
  const _TableRow({
    required this.code,
    required this.name,
    required this.cr,
    required this.total,
    required this.grade,
    required this.gp,
    this.isHeader = false,
  });

  @override
  Widget build(BuildContext context) {
    final style = isHeader
        ? AppTextStyles.labelSmall.copyWith(fontSize: 9)
        : AppTextStyles.bodySmall.copyWith(fontSize: 10);

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          SizedBox(width: 48, child: Text(code, style: style, overflow: TextOverflow.ellipsis)),
          const SizedBox(width: 4),
          Expanded(child: Text(name, style: style, maxLines: 1, overflow: TextOverflow.ellipsis)),
          SizedBox(width: 24, child: Text(cr, style: style, textAlign: TextAlign.center)),
          SizedBox(width: 40, child: Text(total, style: style, textAlign: TextAlign.center)),
          SizedBox(width: 28, child: Text(grade, style: style, textAlign: TextAlign.center)),
          SizedBox(width: 28, child: Text(gp, style: style, textAlign: TextAlign.center)),
        ],
      ),
    );
  }
}

class _SubjectRow extends StatelessWidget {
  final SubjectScore score;
  const _SubjectRow({required this.score});

  Color _gradeColor() {
    switch (score.gradeColor) {
      case 'green': return AppColors.green;
      case 'blue': return AppColors.blue;
      case 'red': return AppColors.red;
      default: return AppColors.textSecondary;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          SizedBox(
              width: 48,
              child: Text(score.courseCode,
                  style: AppTextStyles.labelSmall.copyWith(fontSize: 9),
                  overflow: TextOverflow.ellipsis)),
          const SizedBox(width: 4),
          Expanded(
              child: Text(score.courseName,
                  style: AppTextStyles.bodySmall.copyWith(fontSize: 10),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis)),
          SizedBox(
              width: 24,
              child: Text('${score.credits}',
                  style: AppTextStyles.bodySmall.copyWith(fontSize: 10),
                  textAlign: TextAlign.center)),
          SizedBox(
              width: 40,
              child: Text(
                  score.totalMarks?.toStringAsFixed(0) ?? '-',
                  style: AppTextStyles.bodySmall.copyWith(fontSize: 10),
                  textAlign: TextAlign.center)),
          SizedBox(
              width: 28,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 3, vertical: 1),
                color: _gradeColor().withValues(alpha: 0.2),
                child: Text(
                    score.grade ?? '-',
                    style: AppTextStyles.labelSmall.copyWith(
                        fontSize: 9, color: _gradeColor()),
                    textAlign: TextAlign.center),
              )),
          SizedBox(
              width: 28,
              child: Text(
                  score.gradePoints?.toStringAsFixed(1) ?? '-',
                  style: AppTextStyles.bodySmall.copyWith(fontSize: 10),
                  textAlign: TextAlign.center)),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(width: 4, height: 20, color: AppColors.yellow),
        const SizedBox(width: AppDimensions.sm),
        Text(title, style: AppTextStyles.labelLarge),
      ],
    );
  }
}

class _Shimmer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppDimensions.md),
      child: Column(
        children: [
          const PecShimmerBox(height: 120, width: double.infinity),
          const SizedBox(height: AppDimensions.md),
          const PecShimmerBox(height: 200, width: double.infinity),
          const SizedBox(height: AppDimensions.md),
          for (var i = 0; i < 3; i++) ...[
            const PecShimmerBox(height: 72, width: double.infinity),
            const SizedBox(height: AppDimensions.sm),
          ],
        ],
      ),
    );
  }
}
