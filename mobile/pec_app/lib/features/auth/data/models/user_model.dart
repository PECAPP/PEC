import 'dart:convert';
import '../../domain/entities/user_entity.dart';

class UserModel extends UserEntity {
  const UserModel({
    required super.id,
    required super.email,
    required super.name,
    required super.roles,
    required super.profileComplete,
    super.avatarUrl,
    super.phone,
    super.department,
    super.semester,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    final rawRoles = (json['roles'] as List<dynamic>? ?? []);
    final roles = rawRoles
        .map((r) {
          final roleName = r is Map ? r['name'] as String? : r as String?;
          return UserRole.fromString(roleName ?? '');
        })
        .toList();

    return UserModel(
      id: json['id'] as String,
      email: json['email'] as String,
      name: '${json['firstName'] ?? ''} ${json['lastName'] ?? ''}'.trim(),
      roles: roles,
      profileComplete: json['profileComplete'] as bool? ?? false,
      avatarUrl: json['avatarUrl'] as String?,
      phone: json['phone'] as String?,
      department: json['department'] as String?,
      semester: json['semester'] is int ? json['semester'] as int : int.tryParse('${json['semester'] ?? ''}'),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'email': email,
        'name': name,
        'roles': roles.map((r) => r.name).toList(),
        'profileComplete': profileComplete,
        'avatarUrl': avatarUrl,
        'phone': phone,
        'department': department,
        'semester': semester,
      };

  String toJsonString() => jsonEncode(toJson());

  factory UserModel.fromJsonString(String jsonStr) =>
      UserModel.fromJson(jsonDecode(jsonStr) as Map<String, dynamic>);
}
