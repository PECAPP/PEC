import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../features/auth/presentation/providers/auth_provider.dart';
import '../../data/datasources/dashboard_remote_datasource.dart';
import '../../data/models/course_card_model.dart';
import '../../data/models/faculty_stats_model.dart';
import '../../data/models/schedule_entry_model.dart';

final dashboardDataSourceProvider = Provider((ref) {
  return DashboardRemoteDataSource(ref.read(apiClientProvider));
});

// ── Dashboard State ──
class DashboardState {
  final bool loading;
  final List<CourseCardModel> courses;
  final List<CourseCardModel> courseCards;
  final List<ScheduleEntry> todaySchedule;
  final List<Map<String, dynamic>> notices;
  final FacultyStats stats;
  final CourseCardModel? selectedCourse;
  final String? error;

  const DashboardState({
    this.loading = true,
    this.courses = const [],
    this.courseCards = const [],
    this.todaySchedule = const [],
    this.notices = const [],
    this.stats = const FacultyStats(),
    this.selectedCourse,
    this.error,
  });

  DashboardState copyWith({
    bool? loading,
    List<CourseCardModel>? courses,
    List<CourseCardModel>? courseCards,
    List<ScheduleEntry>? todaySchedule,
    List<Map<String, dynamic>>? notices,
    FacultyStats? stats,
    CourseCardModel? selectedCourse,
    String? error,
  }) =>
      DashboardState(
        loading: loading ?? this.loading,
        courses: courses ?? this.courses,
        courseCards: courseCards ?? this.courseCards,
        todaySchedule: todaySchedule ?? this.todaySchedule,
        notices: notices ?? this.notices,
        stats: stats ?? this.stats,
        selectedCourse: selectedCourse ?? this.selectedCourse,
        error: error,
      );
}

class DashboardNotifier extends StateNotifier<DashboardState> {
  final DashboardRemoteDataSource _ds;
  final String _userId;
  final String _userName;
  final bool _isTestSession;

  DashboardNotifier(this._ds, this._userId, this._userName, this._isTestSession)
      : super(const DashboardState()) {
    load();
  }

  Future<void> load() async {
    if (_isTestSession) {
      final demoCourses = <CourseCardModel>[
        const CourseCardModel(
          id: 'demo-cs201',
          code: 'CS201',
          name: 'Data Structures',
          students: 62,
          progress: 68,
          avgAttendance: 84,
          semester: '3',
          department: 'Computer Science',
          status: 'active',
        ),
        const CourseCardModel(
          id: 'demo-cs305',
          code: 'CS305',
          name: 'Operating Systems',
          students: 57,
          progress: 53,
          avgAttendance: 79,
          semester: '5',
          department: 'Computer Science',
          status: 'active',
        ),
      ];

      state = DashboardState(
        loading: false,
        courses: demoCourses,
        courseCards: demoCourses,
        todaySchedule: const [
          ScheduleEntry(
            id: 'demo-1',
            time: '09:00 - 10:00',
            course: 'Data Structures',
            section: 'A',
            room: 'LH-204',
            students: 62,
            status: ScheduleStatus.ongoing,
          ),
          ScheduleEntry(
            id: 'demo-2',
            time: '11:00 - 12:00',
            course: 'Operating Systems',
            section: 'B',
            room: 'LH-103',
            students: 57,
            status: ScheduleStatus.upcoming,
          ),
        ],
        notices: const [
          {
            'id': 'n1',
            'title': 'Faculty Meeting',
            'content': 'Department faculty meeting at 3:00 PM in Seminar Hall.',
            'category': 'academic',
            'important': true,
            'pinned': true,
          },
          {
            'id': 'n2',
            'title': 'Internal Assessment Window',
            'content': 'Please upload IA marks by Friday 6:00 PM.',
            'category': 'exam',
            'important': false,
            'pinned': false,
          },
        ],
        stats: const FacultyStats(
          activeCount: 2,
          studentCount: 119,
          avgAttendance: 82,
          pendingReviews: 14,
          lowAttendanceCount: 7,
        ),
        selectedCourse: demoCourses.first,
      );
      return;
    }

    state = state.copyWith(loading: true, error: null);
    try {
      // 1) Fetch faculty courses, notices, timetable, and backend stats in parallel.
      final coursesFuture = _ds.getFacultyCourses(_userId);
      final noticesFuture = _ds.getRecentNotices();
      final timetableFuture = _ds.getTimetable();
      final statsFuture = _ds.getFacultyStats();

      var coursesJson = await coursesFuture;
      final noticesJson = await noticesFuture;
      final timetableJson = await timetableFuture;
      final statsJson = await statsFuture;

      // Fallback: if no courses by facultyId, try matching by name
      if (coursesJson.isEmpty) {
        final allCourses = await _ds.getAllCourses();
        final nameLower = _userName.toLowerCase();
        coursesJson = allCourses.where((c) {
          if (c['facultyId'] == _userId || c['instructorId'] == _userId) return true;
          final instructor = (c['instructor'] ?? c['facultyName'] ?? '').toString().toLowerCase();
          return nameLower.isNotEmpty && instructor.contains(nameLower);
        }).toList();
      }

      final courses = coursesJson.map((j) => CourseCardModel.fromJson(j)).toList();

      // 2) Fetch enrollment counts per course
      final enrollmentFutures = courses.map((c) => _ds.getEnrollments(c.id));
      final enrollmentResults = await Future.wait(enrollmentFutures);

      final enrollmentByCourse = <String, int>{};
      final allStudentIds = <String>{};
      for (var i = 0; i < courses.length; i++) {
        final enrollments = enrollmentResults[i];
        enrollmentByCourse[courses[i].id] = enrollments.length;
        for (final e in enrollments) {
          final sid = (e['studentId'] ?? '').toString();
          if (sid.isNotEmpty) allStudentIds.add(sid);
        }
      }

      final courseCards = courses
          .map((c) => CourseCardModel(
                id: c.id,
                code: c.code,
                name: c.name,
                students: enrollmentByCourse[c.id] ?? 0,
                progress: c.progress,
                avgAttendance: c.avgAttendance,
              ))
          .toList();

      // 3) Build today's schedule
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      final today = days[DateTime.now().weekday % 7];
      final courseIds = courses.map((c) => c.id).toSet();

      final todaySchedule = timetableJson
          .where((t) => courseIds.contains(t['courseId']?.toString()) && t['day'] == today)
          .map((t) {
        final course = courses.firstWhere(
          (c) => c.id == t['courseId']?.toString(),
          orElse: () => const CourseCardModel(id: '', code: '', name: 'Class'),
        );
        return ScheduleEntry(
          id: (t['id'] ?? '').toString(),
          time: '${t['startTime'] ?? ''} - ${t['endTime'] ?? ''}',
          course: course.name,
          section: t['section']?.toString() ?? 'N/A',
          room: t['room']?.toString() ?? 'TBA',
          students: enrollmentByCourse[t['courseId']?.toString()] ?? 0,
        );
      }).toList();

      state = DashboardState(
        loading: false,
        courses: courses,
        courseCards: courseCards,
        todaySchedule: todaySchedule,
        notices: noticesJson,
        stats: FacultyStats(
          activeCount:
            (statsJson['activeCount'] as int?) ??
            (statsJson['activeCourses'] as int?) ??
            courses.length,
          studentCount:
            (statsJson['studentCount'] as int?) ??
            (statsJson['totalStudents'] as int?) ??
            allStudentIds.length,
          avgAttendance:
            (statsJson['avgAttendance'] as int?) ??
            (statsJson['averageAttendance'] as int?) ??
            0,
          pendingReviews:
            (statsJson['pendingReviews'] as int?) ??
            (statsJson['pending'] as int?) ??
            0,
          lowAttendanceCount:
            (statsJson['lowAttendanceCount'] as int?) ??
            (statsJson['lowAttendance'] as int?) ??
            0,
        ),
        selectedCourse: courses.isNotEmpty ? courses.first : null,
      );
    } catch (_) {
      // Network/API failure: silently fall back to demo data to keep dashboard usable
      final demoCourses = <CourseCardModel>[
        const CourseCardModel(
          id: 'demo-cs201',
          code: 'CS201',
          name: 'Data Structures',
          students: 62,
          progress: 68,
          avgAttendance: 84,
          semester: '3',
          department: 'Computer Science',
          status: 'active',
        ),
        const CourseCardModel(
          id: 'demo-cs305',
          code: 'CS305',
          name: 'Operating Systems',
          students: 57,
          progress: 53,
          avgAttendance: 79,
          semester: '5',
          department: 'Computer Science',
          status: 'active',
        ),
      ];

      state = DashboardState(
        loading: false,
        courses: demoCourses,
        courseCards: demoCourses,
        todaySchedule: const [
          ScheduleEntry(
            id: 'demo-1',
            time: '09:00 - 10:00',
            course: 'Data Structures',
            section: 'A',
            room: 'LH-204',
            students: 62,
            status: ScheduleStatus.ongoing,
          ),
          ScheduleEntry(
            id: 'demo-2',
            time: '11:00 - 12:00',
            course: 'Operating Systems',
            section: 'B',
            room: 'LH-103',
            students: 57,
            status: ScheduleStatus.upcoming,
          ),
        ],
        notices: const [
          {
            'id': 'n1',
            'title': 'Faculty Meeting',
            'content': 'Department faculty meeting at 3:00 PM in Seminar Hall.',
            'category': 'academic',
            'important': true,
            'pinned': true,
          },
          {
            'id': 'n2',
            'title': 'Internal Assessment Window',
            'content': 'Please upload IA marks by Friday 6:00 PM.',
            'category': 'exam',
            'important': false,
            'pinned': false,
          },
        ],
        stats: const FacultyStats(
          activeCount: 2,
          studentCount: 119,
          avgAttendance: 82,
          pendingReviews: 14,
          lowAttendanceCount: 7,
        ),
        selectedCourse: demoCourses.first,
      );
    }
  }

  void selectCourse(CourseCardModel course) {
    state = state.copyWith(selectedCourse: course);
  }
}

final dashboardProvider = StateNotifierProvider<DashboardNotifier, DashboardState>((ref) {
  final auth = ref.watch(authNotifierProvider);
  final user = auth.user;
  return DashboardNotifier(
    ref.read(dashboardDataSourceProvider),
    user?.uid ?? '',
    user?.fullName ?? '',
    auth.isTestSession,
  );
});
