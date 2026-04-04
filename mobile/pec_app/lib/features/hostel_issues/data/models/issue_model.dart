import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

class HostelIssue {
  final String id;
  final String title;
  final String description;
  final String category; // plumbing | electrical | cleaning | furniture | network | other
  final String priority; // low | medium | high | urgent
  final String status; // open | in_progress | resolved | closed
  final String? imageUrl;
  final String? roomNumber;
  final String? assignedTo;
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
    required this.createdAt,
    this.resolvedAt,
  });

  factory HostelIssue.fromJson(Map<String, dynamic> j) => HostelIssue(
        id: j['id'] as String,
        title: j['title'] as String,
        description: j['description'] as String? ?? '',
        category: j['category'] as String? ?? 'other',
        priority: j['priority'] as String? ?? 'medium',
        status: j['status'] as String? ?? 'open',
        imageUrl: j['imageUrl'] as String?,
        roomNumber: j['roomNumber'] as String?,
        assignedTo: j['assignedTo'] as String? ?? j['assignee']?['name'] as String?,
        createdAt: DateTime.tryParse(j['createdAt'] as String? ?? '') ?? DateTime.now(),
        resolvedAt: j['resolvedAt'] != null
            ? DateTime.tryParse(j['resolvedAt'] as String)
            : null,
      );

  Color get priorityColor {
    switch (priority) {
      case 'urgent': return AppColors.red;
      case 'high': return AppColors.warning;
      case 'medium': return AppColors.yellow;
      default: return AppColors.textSecondary;
    }
  }

  Color get statusColor {
    switch (status) {
      case 'resolved': return AppColors.green;
      case 'in_progress': return AppColors.blue;
      case 'closed': return AppColors.textSecondary;
      default: return AppColors.warning;
    }
  }

  IconData get categoryIcon {
    switch (category) {
      case 'plumbing': return Icons.plumbing_outlined;
      case 'electrical': return Icons.electrical_services_outlined;
      case 'cleaning': return Icons.cleaning_services_outlined;
      case 'furniture': return Icons.chair_outlined;
      case 'network': return Icons.wifi_outlined;
      default: return Icons.report_problem_outlined;
    }
  }

  String get statusLabel {
    switch (status) {
      case 'in_progress': return 'In Progress';
      default: return status[0].toUpperCase() + status.substring(1);
    }
  }

  int get progressStep {
    switch (status) {
      case 'open': return 0;
      case 'in_progress': return 1;
      case 'resolved': return 2;
      case 'closed': return 3;
      default: return 0;
    }
  }
}
