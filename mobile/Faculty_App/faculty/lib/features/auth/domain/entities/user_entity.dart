class UserEntity {
  final String uid;
  final String email;
  final String fullName;
  final String? role;
  final List<String> roles;
  final String? avatar;
  final bool verified;
  final bool profileComplete;
  final String? department;
  final String? designation;
  final String? specialization;

  const UserEntity({
    required this.uid,
    required this.email,
    required this.fullName,
    this.role,
    this.roles = const [],
    this.avatar,
    this.verified = false,
    this.profileComplete = false,
    this.department,
    this.designation,
    this.specialization,
  });

  bool get isFaculty => role == 'faculty' || roles.contains('faculty');
  bool get isAdmin => role == 'admin' || role == 'college_admin' || roles.contains('admin');

  String get firstName => fullName.split(' ').first;

  UserEntity copyWith({
    String? uid,
    String? email,
    String? fullName,
    String? role,
    List<String>? roles,
    String? avatar,
    bool? verified,
    bool? profileComplete,
    String? department,
    String? designation,
    String? specialization,
  }) {
    return UserEntity(
      uid: uid ?? this.uid,
      email: email ?? this.email,
      fullName: fullName ?? this.fullName,
      role: role ?? this.role,
      roles: roles ?? this.roles,
      avatar: avatar ?? this.avatar,
      verified: verified ?? this.verified,
      profileComplete: profileComplete ?? this.profileComplete,
      department: department ?? this.department,
      designation: designation ?? this.designation,
      specialization: specialization ?? this.specialization,
    );
  }
}
