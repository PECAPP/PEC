class ResumeData {
  final String? objective;
  final List<ResumeEducation> education;
  final List<ResumeExperience> experience;
  final List<ResumeProject> projects;
  final List<String> skills;
  final List<ResumeAchievement> achievements;
  final List<ResumeCertification> certifications;

  const ResumeData({
    this.objective,
    this.education = const [],
    this.experience = const [],
    this.projects = const [],
    this.skills = const [],
    this.achievements = const [],
    this.certifications = const [],
  });

  ResumeData copyWith({
    String? objective,
    List<ResumeEducation>? education,
    List<ResumeExperience>? experience,
    List<ResumeProject>? projects,
    List<String>? skills,
    List<ResumeAchievement>? achievements,
    List<ResumeCertification>? certifications,
  }) =>
      ResumeData(
        objective: objective ?? this.objective,
        education: education ?? this.education,
        experience: experience ?? this.experience,
        projects: projects ?? this.projects,
        skills: skills ?? this.skills,
        achievements: achievements ?? this.achievements,
        certifications: certifications ?? this.certifications,
      );

  factory ResumeData.fromJson(Map<String, dynamic> j) => ResumeData(
        objective: j['objective'] as String?,
        education: _list(j['education'], ResumeEducation.fromJson),
        experience: _list(j['experience'], ResumeExperience.fromJson),
        projects: _list(j['projects'], ResumeProject.fromJson),
        skills: (j['skills'] as List<dynamic>?)
                ?.map((e) => e as String)
                .toList() ??
            [],
        achievements: _list(j['achievements'], ResumeAchievement.fromJson),
        certifications: _list(j['certifications'], ResumeCertification.fromJson),
      );

  Map<String, dynamic> toJson() => {
        if (objective != null) 'objective': objective,
        'education': education.map((e) => e.toJson()).toList(),
        'experience': experience.map((e) => e.toJson()).toList(),
        'projects': projects.map((e) => e.toJson()).toList(),
        'skills': skills,
        'achievements': achievements.map((e) => e.toJson()).toList(),
        'certifications': certifications.map((e) => e.toJson()).toList(),
      };

  static List<T> _list<T>(
          dynamic raw, T Function(Map<String, dynamic>) fromJson) =>
      (raw as List<dynamic>?)
          ?.map((e) => fromJson(e as Map<String, dynamic>))
          .toList() ??
      [];

  bool get isEmpty =>
      (objective == null || objective!.isEmpty) &&
      education.isEmpty &&
      experience.isEmpty &&
      projects.isEmpty &&
      skills.isEmpty;
}

class ResumeEducation {
  final String institution;
  final String degree;
  final String? fieldOfStudy;
  final String startYear;
  final String? endYear;
  final double? cgpa;

  const ResumeEducation({
    required this.institution,
    required this.degree,
    this.fieldOfStudy,
    required this.startYear,
    this.endYear,
    this.cgpa,
  });

  factory ResumeEducation.fromJson(Map<String, dynamic> j) => ResumeEducation(
        institution: j['institution'] as String,
        degree: j['degree'] as String,
        fieldOfStudy: j['fieldOfStudy'] as String?,
        startYear: j['startYear'] as String,
        endYear: j['endYear'] as String?,
        cgpa: j['cgpa'] != null ? (j['cgpa'] as num).toDouble() : null,
      );

  Map<String, dynamic> toJson() => {
        'institution': institution,
        'degree': degree,
        if (fieldOfStudy != null) 'fieldOfStudy': fieldOfStudy,
        'startYear': startYear,
        if (endYear != null) 'endYear': endYear,
        if (cgpa != null) 'cgpa': cgpa,
      };
}

class ResumeExperience {
  final String company;
  final String role;
  final String startDate;
  final String? endDate;
  final String? description;

  const ResumeExperience({
    required this.company,
    required this.role,
    required this.startDate,
    this.endDate,
    this.description,
  });

  factory ResumeExperience.fromJson(Map<String, dynamic> j) => ResumeExperience(
        company: j['company'] as String,
        role: j['role'] as String,
        startDate: j['startDate'] as String,
        endDate: j['endDate'] as String?,
        description: j['description'] as String?,
      );

  Map<String, dynamic> toJson() => {
        'company': company,
        'role': role,
        'startDate': startDate,
        if (endDate != null) 'endDate': endDate,
        if (description != null) 'description': description,
      };
}

class ResumeProject {
  final String title;
  final String? description;
  final List<String> techStack;
  final String? repoUrl;
  final String? demoUrl;

  const ResumeProject({
    required this.title,
    this.description,
    this.techStack = const [],
    this.repoUrl,
    this.demoUrl,
  });

  factory ResumeProject.fromJson(Map<String, dynamic> j) => ResumeProject(
        title: j['title'] as String,
        description: j['description'] as String?,
        techStack: (j['techStack'] as List<dynamic>?)
                ?.map((e) => e as String)
                .toList() ??
            [],
        repoUrl: j['repoUrl'] as String?,
        demoUrl: j['demoUrl'] as String?,
      );

  Map<String, dynamic> toJson() => {
        'title': title,
        if (description != null) 'description': description,
        'techStack': techStack,
        if (repoUrl != null) 'repoUrl': repoUrl,
        if (demoUrl != null) 'demoUrl': demoUrl,
      };
}

class ResumeAchievement {
  final String title;
  final String? year;
  const ResumeAchievement({required this.title, this.year});
  factory ResumeAchievement.fromJson(Map<String, dynamic> j) =>
      ResumeAchievement(
          title: j['title'] as String, year: j['year'] as String?);
  Map<String, dynamic> toJson() =>
      {'title': title, if (year != null) 'year': year};
}

class ResumeCertification {
  final String name;
  final String? issuer;
  final String? year;
  const ResumeCertification({required this.name, this.issuer, this.year});
  factory ResumeCertification.fromJson(Map<String, dynamic> j) =>
      ResumeCertification(
          name: j['name'] as String,
          issuer: j['issuer'] as String?,
          year: j['year'] as String?);
  Map<String, dynamic> toJson() => {
        'name': name,
        if (issuer != null) 'issuer': issuer,
        if (year != null) 'year': year,
      };
}
