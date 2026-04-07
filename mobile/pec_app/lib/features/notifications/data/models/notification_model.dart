import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

class AppNotification {
  final String id;
  final String title;
  final String? body;
  final String type; // fee | attendance | notice | chat | general
  final bool isRead;
  final String? actionRoute; // deep-link route
  final DateTime createdAt;

  const AppNotification({
    required this.id,
    required this.title,
    this.body,
    required this.type,
    required this.isRead,
    this.actionRoute,
    required this.createdAt,
  });

  factory AppNotification.fromJson(Map<String, dynamic> j) {
    return AppNotification(
      id: j['id'] as String,
      title: j['title'] as String,
      body: j['body'] as String? ?? j['message'] as String?,
      type: j['type'] as String? ?? 'general',
      isRead: j['isRead'] as bool? ?? j['read'] as bool? ?? false,
      actionRoute: j['actionRoute'] as String? ?? j['route'] as String?,
      createdAt:
          DateTime.tryParse(j['createdAt'] as String? ?? '') ?? DateTime.now(),
    );
  }

  Color get dotColor {
    switch (type) {
      case 'fee': return AppColors.warning;
      case 'attendance': return AppColors.green;
      case 'notice': return AppColors.blue;
      case 'chat': return AppColors.yellow;
      default: return AppColors.textSecondary;
    }
  }

  IconData get icon {
    switch (type) {
      case 'fee': return Icons.account_balance_wallet_outlined;
      case 'attendance': return Icons.checklist_outlined;
      case 'notice': return Icons.campaign_outlined;
      case 'chat': return Icons.chat_bubble_outline;
      default: return Icons.notifications_outlined;
    }
  }

  AppNotification copyWith({
    String? id,
    String? title,
    String? body,
    String? type,
    bool? isRead,
    String? actionRoute,
    DateTime? createdAt,
  }) {
    return AppNotification(
      id: id ?? this.id,
      title: title ?? this.title,
      body: body ?? this.body,
      type: type ?? this.type,
      isRead: isRead ?? this.isRead,
      actionRoute: actionRoute ?? this.actionRoute,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
