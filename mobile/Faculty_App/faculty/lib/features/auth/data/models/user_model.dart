import '../../domain/entities/user_entity.dart';

class UserModel extends UserEntity {
  const UserModel({
    required super.uid,
    required super.email,
    required super.fullName,
    super.role,
    super.roles,
    super.avatar,
    super.verified,
    super.profileComplete,
    super.department,
    super.designation,
    super.specialization,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    // The backend may return 'uid' or 'id'
    final uid = (json['uid'] ?? json['id'] ?? '').toString();
    final rawRoles = json['roles'];
    final List<String> roles = rawRoles is List
        ? rawRoles.map((e) => e.toString()).toList()
        : [];

    return UserModel(
      uid: uid,
      email: json['email'] as String? ?? '',
      fullName: json['fullName'] as String? ?? json['name'] as String? ?? '',
      role: json['role'] as String?,
      roles: roles,
      avatar: json['avatar'] as String?,
      verified: json['verified'] as bool? ?? false,
      profileComplete: json['profileComplete'] as bool? ?? false,
      department: json['department'] as String?,
      designation: json['designation'] as String?,
      specialization: json['specialization'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'uid': uid,
        'email': email,
        'fullName': fullName,
        'role': role,
        'roles': roles,
        'avatar': avatar,
        'verified': verified,
        'profileComplete': profileComplete,
        'department': department,
        'designation': designation,
        'specialization': specialization,
      };
}
