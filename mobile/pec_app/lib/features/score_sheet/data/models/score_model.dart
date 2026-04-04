class SubjectScore {
  final String id;
  final String courseCode;
  final String courseName;
  final int credits;
  final int semester;
  final double? internalMarks; // out of 40
  final double? externalMarks; // out of 60
  final double? totalMarks; // out of 100
  final String? grade; // A+, A, B+, B, C, D, F
  final double? gradePoints; // 10, 9, 8...
  final bool isArrear;

  const SubjectScore({
    required this.id,
    required this.courseCode,
    required this.courseName,
    required this.credits,
    required this.semester,
    this.internalMarks,
    this.externalMarks,
    this.totalMarks,
    this.grade,
    this.gradePoints,
    this.isArrear = false,
  });

  factory SubjectScore.fromJson(Map<String, dynamic> j) {
    final total = j['totalMarks'] != null ? (j['totalMarks'] as num).toDouble() : null;
    final gp = j['gradePoints'] != null ? (j['gradePoints'] as num).toDouble() : null;
    return SubjectScore(
      id: j['id'] as String,
      courseCode: j['courseCode'] as String? ??
          j['course']?['code'] as String? ?? '',
      courseName: j['courseName'] as String? ??
          j['course']?['name'] as String? ?? 'Unknown',
      credits: (j['credits'] as num?)?.toInt() ??
          (j['course']?['credits'] as num?)?.toInt() ?? 3,
      semester: (j['semester'] as num?)?.toInt() ?? 1,
      internalMarks: j['internalMarks'] != null
          ? (j['internalMarks'] as num).toDouble()
          : null,
      externalMarks: j['externalMarks'] != null
          ? (j['externalMarks'] as num).toDouble()
          : null,
      totalMarks: total,
      grade: j['grade'] as String?,
      gradePoints: gp,
      isArrear: j['isArrear'] as bool? ?? false,
    );
  }

  double get earnedPoints => (gradePoints ?? 0) * credits;

  String get gradeColor {
    switch (grade) {
      case 'O':
      case 'A+':
        return 'green';
      case 'A':
        return 'blue';
      case 'B+':
      case 'B':
        return 'yellow';
      case 'C':
        return 'warning';
      case 'F':
        return 'red';
      default:
        return 'secondary';
    }
  }
}

class SemesterResult {
  final int semester;
  final double sgpa;
  final int totalCredits;
  final int earnedCredits;
  final List<SubjectScore> subjects;

  const SemesterResult({
    required this.semester,
    required this.sgpa,
    required this.totalCredits,
    required this.earnedCredits,
    required this.subjects,
  });

  factory SemesterResult.fromScores(int semester, List<SubjectScore> scores) {
    final validScores = scores.where((s) => s.gradePoints != null).toList();
    final totalCr = scores.fold<int>(0, (s, e) => s + e.credits);
    final earnedCr = scores
        .where((s) => (s.gradePoints ?? 0) > 0)
        .fold<int>(0, (s, e) => s + e.credits);
    final totalPoints = validScores.fold<double>(0, (s, e) => s + e.earnedPoints);
    final totalCreditsForGpa =
        validScores.fold<int>(0, (s, e) => s + e.credits);
    final sgpa =
        totalCreditsForGpa > 0 ? totalPoints / totalCreditsForGpa : 0.0;
    return SemesterResult(
      semester: semester,
      sgpa: sgpa,
      totalCredits: totalCr,
      earnedCredits: earnedCr,
      subjects: scores,
    );
  }
}

class CgpaData {
  final double cgpa;
  final int totalCredits;
  final List<SemesterResult> semesters;

  const CgpaData({
    required this.cgpa,
    required this.totalCredits,
    required this.semesters,
  });

  factory CgpaData.fromScores(List<SubjectScore> allScores) {
    final grouped = <int, List<SubjectScore>>{};
    for (final s in allScores) {
      (grouped[s.semester] ??= []).add(s);
    }
    final semesters = grouped.entries
        .map((e) => SemesterResult.fromScores(e.key, e.value))
        .toList()
      ..sort((a, b) => a.semester.compareTo(b.semester));

    final validSems = semesters.where((s) => s.sgpa > 0).toList();
    double cgpa = 0;
    int totalCr = 0;
    double totalPoints = 0;
    for (final sem in validSems) {
      final validSubjects =
          sem.subjects.where((s) => s.gradePoints != null).toList();
      for (final s in validSubjects) {
        totalPoints += s.earnedPoints;
        totalCr += s.credits;
      }
    }
    cgpa = totalCr > 0 ? totalPoints / totalCr : 0.0;

    return CgpaData(
      cgpa: cgpa,
      totalCredits: semesters.fold<int>(0, (s, e) => s + e.totalCredits),
      semesters: semesters,
    );
  }

  String get cgpaLabel => cgpa.toStringAsFixed(2);

  String get classification {
    if (cgpa >= 9.0) return 'Outstanding';
    if (cgpa >= 8.0) return 'Excellent';
    if (cgpa >= 7.0) return 'Very Good';
    if (cgpa >= 6.0) return 'Good';
    if (cgpa >= 5.0) return 'Average';
    return 'Below Average';
  }
}
