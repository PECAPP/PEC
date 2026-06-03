import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../features/auth/presentation/providers/auth_provider.dart';
import '../../data/datasources/examinations_remote_datasource.dart';
import '../../data/models/exam_plan_item.dart';

final examinationsDataSourceProvider = Provider((ref) {
  return ExaminationsRemoteDataSource(ref.read(apiClientProvider));
});

class ExaminationsState {
  final bool loading;
  final List<ExamPlanItem> all;
  final String selectedClass;
  final String selectedSubject;
  final String selectedType;
  final bool upcomingOnly;
  final String? error;

  const ExaminationsState({
    this.loading = true,
    this.all = const [],
    this.selectedClass = 'All Classes',
    this.selectedSubject = 'All Subjects',
    this.selectedType = 'All Types',
    this.upcomingOnly = true,
    this.error,
  });

  ExaminationsState copyWith({
    bool? loading,
    List<ExamPlanItem>? all,
    String? selectedClass,
    String? selectedSubject,
    String? selectedType,
    bool? upcomingOnly,
    String? error,
  }) {
    return ExaminationsState(
      loading: loading ?? this.loading,
      all: all ?? this.all,
      selectedClass: selectedClass ?? this.selectedClass,
      selectedSubject: selectedSubject ?? this.selectedSubject,
      selectedType: selectedType ?? this.selectedType,
      upcomingOnly: upcomingOnly ?? this.upcomingOnly,
      error: error,
    );
  }

  List<ExamPlanItem> get filtered {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);

    final filteredList = all.where((item) {
      final byClass = selectedClass == 'All Classes' || item.className == selectedClass;
      final bySubject = selectedSubject == 'All Subjects' || item.subjectCode == selectedSubject;
      final byType = selectedType == 'All Types' || item.examType == selectedType;
      final byUpcoming = !upcomingOnly || !item.date.isBefore(today);
      return byClass && bySubject && byType && byUpcoming;
    }).toList();

    filteredList.sort((a, b) {
      final byDate = a.date.compareTo(b.date);
      if (byDate != 0) return byDate;
      final byCode = a.subjectCode.compareTo(b.subjectCode);
      if (byCode != 0) return byCode;
      return a.className.compareTo(b.className);
    });

    return filteredList;
  }

  List<String> get classOptions {
    final classes = all.map((e) => e.className).toSet().toList()..sort();
    return ['All Classes', ...classes];
  }

  List<String> get subjectOptions {
    final subjects = all.map((e) => e.subjectCode).toSet().toList()..sort();
    return ['All Subjects', ...subjects];
  }

  List<String> get typeOptions {
    final types = all.map((e) => e.examType).toSet().toList()..sort();
    return ['All Types', ...types];
  }
}

class ExaminationsNotifier extends StateNotifier<ExaminationsState> {
  final ExaminationsRemoteDataSource _ds;
  final String? _department;
  final bool _isTestSession;

  ExaminationsNotifier(this._ds, this._department, this._isTestSession)
      : super(const ExaminationsState()) {
    load();
  }

  Future<void> load() async {
    state = state.copyWith(loading: true, error: null);

    if (_isTestSession) {
      state = state.copyWith(loading: false, all: _demoExams(_department));
      return;
    }

    try {
      final rows = await _ds.getAll(department: _department);
      final parsed = rows.map(ExamPlanItem.fromJson).toList();
      if (parsed.isEmpty) {
        state = state.copyWith(
          loading: false,
          all: _demoExams(_department),
          error: 'No examination records from server. Showing demo plan.',
        );
        return;
      }
      state = state.copyWith(loading: false, all: parsed);
    } catch (_) {
      state = state.copyWith(
        loading: false,
        all: _demoExams(_department),
        error: 'Unable to reach examination service. Showing offline plan.',
      );
    }
  }

  void setClassFilter(String value) {
    state = state.copyWith(selectedClass: value, error: state.error);
  }

  void setSubjectFilter(String value) {
    state = state.copyWith(selectedSubject: value, error: state.error);
  }

  void setTypeFilter(String value) {
    state = state.copyWith(selectedType: value, error: state.error);
  }

  void setUpcomingOnly(bool value) {
    state = state.copyWith(upcomingOnly: value, error: state.error);
  }
}

final examinationsProvider =
    StateNotifierProvider<ExaminationsNotifier, ExaminationsState>((ref) {
  final auth = ref.watch(authNotifierProvider);
  return ExaminationsNotifier(
    ref.read(examinationsDataSourceProvider),
    auth.user?.department,
    auth.isTestSession,
  );
});

List<ExamPlanItem> _demoExams(String? department) {
  final now = DateTime.now();
  final d = DateTime(now.year, now.month, now.day);
  final dept = (department == null || department.trim().isEmpty)
      ? 'Computer Science'
      : department;

  return [
    ExamPlanItem(
      id: 'ex-1',
      date: d.add(const Duration(days: 2)),
      subjectCode: 'DS101',
      subjectName: 'Engineering Mathematics I',
      className: '$dept - Year 1',
      section: 'A',
      startTime: '10:00',
      endTime: '12:00',
      venue: 'DS-EX-2',
      examType: 'Midterm',
    ),
    ExamPlanItem(
      id: 'ex-2',
      date: d.add(const Duration(days: 2)),
      subjectCode: 'DS102',
      subjectName: 'Applied Physics',
      className: '$dept - Year 1',
      section: 'B',
      startTime: '10:00',
      endTime: '12:00',
      venue: 'DS-EX-2',
      examType: 'Midterm',
    ),
    ExamPlanItem(
      id: 'ex-3',
      date: d.add(const Duration(days: 3)),
      subjectCode: 'DS103',
      subjectName: 'Programming for Problem Solving',
      className: '$dept - Year 1',
      section: 'C',
      startTime: '10:00',
      endTime: '12:00',
      venue: 'DS-EX-2',
      examType: 'Midterm',
    ),
    ExamPlanItem(
      id: 'ex-4',
      date: d.add(const Duration(days: 4)),
      subjectCode: 'DS201',
      subjectName: 'Data Structures',
      className: '$dept - Year 2',
      section: 'A',
      startTime: '09:00',
      endTime: '11:00',
      venue: 'DS-EX-4',
      examType: 'Midterm',
    ),
    ExamPlanItem(
      id: 'ex-5',
      date: d.add(const Duration(days: 5)),
      subjectCode: 'DS305',
      subjectName: 'Operating Systems',
      className: '$dept - Year 3',
      section: 'A',
      startTime: '14:00',
      endTime: '16:00',
      venue: 'DS-EX-6',
      examType: 'Sessional',
    ),
    ExamPlanItem(
      id: 'ex-6',
      date: d.add(const Duration(days: 6)),
      subjectCode: 'DS501',
      subjectName: 'Machine Learning',
      className: '$dept - Year 4',
      section: 'A',
      startTime: '10:00',
      endTime: '13:00',
      venue: 'DS-EX-6',
      examType: 'Endterm',
    ),
    ExamPlanItem(
      id: 'ex-7',
      date: d.add(const Duration(days: 7)),
      subjectCode: 'DS502',
      subjectName: 'Data Mining',
      className: '$dept - Year 4',
      section: 'B',
      startTime: '10:00',
      endTime: '13:00',
      venue: 'DS-EX-6',
      examType: 'Endterm',
    ),
    ExamPlanItem(
      id: 'ex-8',
      date: d.add(const Duration(days: 8)),
      subjectCode: 'DS503',
      subjectName: 'Big Data Systems',
      className: '$dept - Year 4',
      section: 'A',
      startTime: '10:00',
      endTime: '13:00',
      venue: 'DS-EX-7',
      examType: 'Endterm',
    ),
  ];
}
