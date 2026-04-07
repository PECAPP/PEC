import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

class CalendarEventModel {
  final String id;
  final String title;
  final String description;
  final DateTime date;
  final DateTime? endDate;
  final String
      eventType; // holiday|exam|event|deadline|working-day|orientation|registration|result|recess
  final String category;
  final String importance; // high|medium|low
  final String? location;
  final String? targetAudience;

  const CalendarEventModel({
    required this.id,
    required this.title,
    required this.description,
    required this.date,
    this.endDate,
    required this.eventType,
    required this.category,
    required this.importance,
    this.location,
    this.targetAudience,
  });

  factory CalendarEventModel.fromJson(Map<String, dynamic> j) =>
      CalendarEventModel(
        id: (j['id'] ?? '').toString(),
        title: j['title'] as String? ?? '',
        description: j['description'] as String? ?? '',
        date: DateTime.tryParse((j['date'] ?? '').toString()) ?? DateTime.now(),
        endDate: j['endDate'] != null
            ? DateTime.tryParse(j['endDate'] as String)
            : null,
        eventType: j['eventType'] as String? ?? 'event',
        category: j['category'] as String? ?? 'academic',
        importance: j['importance'] as String? ?? 'medium',
        location: j['location'] as String?,
        targetAudience: j['targetAudience'] as String?,
      );

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'date': date.toIso8601String(),
      'endDate': endDate?.toIso8601String(),
      'eventType': eventType,
      'category': category,
      'importance': importance,
      'location': location,
      'targetAudience': targetAudience,
    };
  }

  Color get dotColor {
    switch (eventType) {
      case 'holiday':
      case 'recess':
        return AppColors.red;
      case 'exam':
      case 'result':
        return AppColors.blue;
      case 'deadline':
      case 'registration':
        return AppColors.warning;
      case 'event':
      case 'orientation':
        return AppColors.green;
      default:
        return AppColors.textSecondary;
    }
  }

  String get typeLabel {
    switch (eventType) {
      case 'holiday':
        return 'HOLIDAY';
      case 'exam':
        return 'EXAM';
      case 'event':
        return 'EVENT';
      case 'deadline':
        return 'DEADLINE';
      case 'result':
        return 'RESULT';
      case 'registration':
        return 'REG';
      case 'orientation':
        return 'ORIENTATION';
      case 'recess':
        return 'RECESS';
      default:
        return eventType.toUpperCase();
    }
  }
}
