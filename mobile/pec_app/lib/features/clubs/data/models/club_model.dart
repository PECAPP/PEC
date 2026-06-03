import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

class ClubModel {
  final String id;
  final String name;
  final String? description;
  final String? bannerUrl;
  final String? logoUrl;
  final String category; // technical | cultural | sports | academic | other
  final int memberCount;
  final String? presidentName;
  final String? contactEmail;
  final bool isActive;
  final String? myJoinStatus; // null | pending | approved | rejected

  const ClubModel({
    required this.id,
    required this.name,
    this.description,
    this.bannerUrl,
    this.logoUrl,
    required this.category,
    required this.memberCount,
    this.presidentName,
    this.contactEmail,
    required this.isActive,
    this.myJoinStatus,
  });

  factory ClubModel.fromJson(Map<String, dynamic> j) {
    return ClubModel(
      id: (j['id'] ?? '').toString(),
      name: (j['name'] ?? 'Unnamed Club').toString(),
      description: j['description'] as String?,
      bannerUrl: j['bannerUrl'] as String?,
      logoUrl: j['logoUrl'] as String?,
      category: j['category'] as String? ?? 'other',
      memberCount: (j['memberCount'] as num?)?.toInt() ??
          (j['_count']?['members'] as num?)?.toInt() ??
          0,
      presidentName:
          j['presidentName'] as String? ?? j['president']?['name'] as String?,
      contactEmail: j['contactEmail'] as String?,
      isActive: j['isActive'] as bool? ?? true,
      myJoinStatus: j['myJoinStatus'] as String? ??
          j['joinRequest']?['status'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'bannerUrl': bannerUrl,
      'logoUrl': logoUrl,
      'category': category,
      'memberCount': memberCount,
      'presidentName': presidentName,
      'contactEmail': contactEmail,
      'isActive': isActive,
      'myJoinStatus': myJoinStatus,
    };
  }

  ClubModel copyWith({
    String? id,
    String? name,
    String? description,
    String? bannerUrl,
    String? logoUrl,
    String? category,
    int? memberCount,
    String? presidentName,
    String? contactEmail,
    bool? isActive,
    String? myJoinStatus,
  }) {
    return ClubModel(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      bannerUrl: bannerUrl ?? this.bannerUrl,
      logoUrl: logoUrl ?? this.logoUrl,
      category: category ?? this.category,
      memberCount: memberCount ?? this.memberCount,
      presidentName: presidentName ?? this.presidentName,
      contactEmail: contactEmail ?? this.contactEmail,
      isActive: isActive ?? this.isActive,
      myJoinStatus: myJoinStatus ?? this.myJoinStatus,
    );
  }

  Color get categoryColor {
    switch (category) {
      case 'technical':
        return AppColors.blue;
      case 'cultural':
        return AppColors.warning;
      case 'sports':
        return AppColors.green;
      case 'academic':
        return AppColors.yellow;
      default:
        return AppColors.textSecondary;
    }
  }

  String get categoryLabel => category[0].toUpperCase() + category.substring(1);

  bool get isMember => myJoinStatus == 'approved';
  bool get isPending => myJoinStatus == 'pending';
}
