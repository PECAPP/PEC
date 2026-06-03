import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

class NoticeModel {
  final String id;
  final String title;
  final String? content;
  final String category; // academic | hostel | exam | general | urgent
  final String? author;
  final DateTime createdAt;
  final bool isPinned;

  const NoticeModel({
    required this.id,
    required this.title,
    this.content,
    required this.category,
    this.author,
    required this.createdAt,
    this.isPinned = false,
  });

  factory NoticeModel.fromJson(Map<String, dynamic> j) {
    return NoticeModel(
      id: j['id'] as String,
      title: j['title'] as String,
      content: j['content'] as String?,
      category: j['category'] as String? ?? 'general',
      author: j['author'] as String? ?? j['createdBy']?['name'] as String?,
      createdAt:
          DateTime.tryParse(j['createdAt'] as String? ?? '') ?? DateTime.now(),
      isPinned: j['isPinned'] as bool? ?? false,
    );
  }

  Color get dotColor {
    switch (category) {
      case 'urgent': return AppColors.red;
      case 'exam': return AppColors.warning;
      case 'academic': return AppColors.blue;
      case 'hostel': return AppColors.green;
      default: return AppColors.textSecondary;
    }
  }

  String get categoryLabel => category[0].toUpperCase() + category.substring(1);
}
