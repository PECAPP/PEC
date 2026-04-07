import 'package:flutter/material.dart';

import '../../../../core/constants/app_colors.dart';

class HostelIssue {
  final String id;
  final String title;
  final String description;
  final String category;
  final String priority;
  final String status;
  final String? imageUrl;
  final String? roomNumber;
  final String? assignedTo;
  final String? reportedBy;
  final DateTime createdAt;
  final DateTime? resolvedAt;

  const HostelIssue({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.priority,
    required this.status,
    this.imageUrl,
    this.roomNumber,
    this.assignedTo,
    this.reportedBy,
    required this.createdAt,
    this.resolvedAt,
  });

  factory HostelIssue.fromJson(Map<String, dynamic> json) {
    return HostelIssue(
      id: _stringValue(json['id']) ?? _stringValue(json['_id']) ?? '',
      title: _stringValue(json['title']) ?? 'Untitled issue',
      description: _stringValue(json['description']) ?? _stringValue(json['details']) ?? '',
      category: _stringValue(json['category']) ?? 'other',
      priority: _stringValue(json['priority']) ?? 'medium',
      status: _normalizeStatus(_stringValue(json['status']) ?? 'open'),
      imageUrl: _stringValue(json['imageUrl']) ?? _stringValue(json['image']),
      roomNumber: _stringValue(json['roomNumber']) ?? _stringValue(json['room']) ?? _stringValue(json['roomNo']),
      assignedTo: _nestedName(json['assignedTo']) ?? _nestedName(json['assignee']) ?? _nestedName(json['assignedUser']),
      reportedBy: _nestedName(json['reportedBy']) ?? _nestedName(json['createdBy']) ?? _nestedName(json['student']) ?? _nestedName(json['submittedBy']),
      createdAt: _dateTimeValue(json['createdAt']) ?? DateTime.now(),
      resolvedAt: _dateTimeValue(json['resolvedAt']),
    );
  }

  static String? _stringValue(dynamic value) {
    if (value is String) {
      return value;
    }
    if (value is num || value is bool) {
      return value.toString();
    }
    return null;
  }

  static String? _nestedName(dynamic value) {
    if (value is String) {
      return value;
    }
    if (value is Map<String, dynamic>) {
      return _stringValue(value['name']) ??
          _stringValue(value['fullName']) ??
          _stringValue(value['displayName']) ??
          _stringValue(value['title']);
    }
    return null;
  }

  static DateTime? _dateTimeValue(dynamic value) {
    if (value is DateTime) {
      return value;
    }
    if (value is String && value.isNotEmpty) {
      return DateTime.tryParse(value);
    }
    return null;
  }

  static String _normalizeStatus(String value) {
    switch (value.toLowerCase()) {
      case 'inprogress':
      case 'in progress':
        return 'in_progress';
      case 'resolved':
      case 'closed':
      case 'open':
        return value.toLowerCase();
      default:
        return 'open';
    }
  }

  Color get priorityColor {
    switch (priority) {
      case 'urgent':
        return AppColors.red;
      case 'high':
        return AppColors.warning;
      case 'medium':
        return AppColors.yellow;
      default:
        return AppColors.textSecondary;
    }
  }

  Color get statusColor {
    switch (status) {
      case 'resolved':
        return AppColors.green;
      case 'in_progress':
        return AppColors.blue;
      case 'closed':
        return AppColors.textSecondary;
      default:
        return AppColors.warning;
    }
  }

  IconData get categoryIcon {
    switch (category) {
      case 'plumbing':
        return Icons.plumbing_outlined;
      case 'electrical':
        return Icons.electrical_services_outlined;
      case 'cleaning':
        return Icons.cleaning_services_outlined;
      case 'furniture':
        return Icons.chair_outlined;
      case 'network':
        return Icons.wifi_outlined;
      default:
        return Icons.report_problem_outlined;
    }
  }

  String get statusLabel {
    switch (status) {
      case 'in_progress':
        return 'In Progress';
      case 'open':
        return 'Open';
      case 'resolved':
        return 'Resolved';
      case 'closed':
        return 'Closed';
      default:
        return status;
    }
  }

  String get priorityLabel {
    return priority.replaceAll('_', ' ');
  }

  int get progressStep {
    switch (status) {
      case 'open':
        return 0;
      case 'in_progress':
        return 1;
      case 'resolved':
        return 2;
      case 'closed':
        return 3;
      default:
        return 0;
    }
  }
}
