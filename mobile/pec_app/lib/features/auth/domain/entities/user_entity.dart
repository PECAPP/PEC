import 'package:equatable/equatable.dart';

enum UserRole {
  student,
  faculty,
  collegeAdmin,
  superAdmin,
  moderator,
  placementOfficer,
  recruiter,
  user;

  static UserRole fromString(String s) {
    return UserRole.values.firstWhere(
      (r) => r.name == _toCamel(s),
      orElse: () => UserRole.user,
    );
  }

  static String _toCamel(String s) {
    final parts = s.split('_');
    return parts[0] +
        parts.skip(1).map((p) => p[0].toUpperCase() + p.substring(1)).join();
  }

  String get displayName {
    switch (this) {
      case UserRole.student: return 'Student';
      case UserRole.faculty: return 'Faculty';
      case UserRole.collegeAdmin: return 'Admin';
      case UserRole.superAdmin: return 'Super Admin';
      case UserRole.moderator: return 'Moderator';
      case UserRole.placementOfficer: return 'Placement Officer';
      case UserRole.recruiter: return 'Recruiter';
      case UserRole.user: return 'User';
    }
  }
}

class UserEntity extends Equatable {
  final String id;
  final String email;
  final String name;
  final List<UserRole> roles;
  final bool profileComplete;
  final String? avatarUrl;
  final String? phone;

  const UserEntity({
    required this.id,
    required this.email,
    required this.name,
    required this.roles,
    required this.profileComplete,
    this.avatarUrl,
    this.phone,
  });

  bool get isAdmin =>
      roles.contains(UserRole.collegeAdmin) ||
      roles.contains(UserRole.superAdmin);

  bool get isFaculty => roles.contains(UserRole.faculty);
  bool get isStudent => roles.contains(UserRole.student);

  UserRole get primaryRole {
    if (roles.contains(UserRole.superAdmin)) return UserRole.superAdmin;
    if (roles.contains(UserRole.collegeAdmin)) return UserRole.collegeAdmin;
    if (roles.contains(UserRole.faculty)) return UserRole.faculty;
    if (roles.contains(UserRole.student)) return UserRole.student;
    return roles.isNotEmpty ? roles.first : UserRole.user;
  }

  @override
  List<Object?> get props => [id, email, roles, profileComplete];
}
