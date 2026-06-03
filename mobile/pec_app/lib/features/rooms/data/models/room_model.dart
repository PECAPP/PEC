import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

class RoomModel {
  final String id;
  final String name;
  final String building;
  final int capacity;
  final String type; // classroom | seminar | lab | auditorium | conference
  final List<String> amenities;
  final bool isAvailable;

  const RoomModel({
    required this.id,
    required this.name,
    required this.building,
    required this.capacity,
    required this.type,
    required this.amenities,
    required this.isAvailable,
  });

  factory RoomModel.fromJson(Map<String, dynamic> j) => RoomModel(
        id: j['id'] as String,
        name: j['name'] as String,
        building: j['building'] as String? ?? '',
        capacity: (j['capacity'] as num?)?.toInt() ?? 30,
        type: j['type'] as String? ?? 'classroom',
        amenities: (j['amenities'] as List<dynamic>?)
                ?.map((e) => e as String)
                .toList() ??
            [],
        isAvailable: j['isAvailable'] as bool? ?? true,
      );

  Color get typeColor {
    switch (type) {
      case 'lab': return AppColors.blue;
      case 'seminar': return AppColors.yellow;
      case 'auditorium': return AppColors.red;
      case 'conference': return AppColors.green;
      default: return AppColors.textSecondary;
    }
  }

  IconData get typeIcon {
    switch (type) {
      case 'lab': return Icons.science_outlined;
      case 'seminar': return Icons.groups_outlined;
      case 'auditorium': return Icons.theater_comedy_outlined;
      case 'conference': return Icons.meeting_room_outlined;
      default: return Icons.door_front_door_outlined;
    }
  }

  String get typeLabel => type[0].toUpperCase() + type.substring(1);
}

class RoomBooking {
  final String id;
  final String roomId;
  final String roomName;
  final String purpose;
  final DateTime startTime;
  final DateTime endTime;
  final String status; // pending | approved | rejected | cancelled
  final DateTime createdAt;

  const RoomBooking({
    required this.id,
    required this.roomId,
    required this.roomName,
    required this.purpose,
    required this.startTime,
    required this.endTime,
    required this.status,
    required this.createdAt,
  });

  factory RoomBooking.fromJson(Map<String, dynamic> j) => RoomBooking(
        id: j['id'] as String,
        roomId: j['roomId'] as String,
        roomName: j['room']?['name'] as String? ?? j['roomName'] as String? ?? '',
        purpose: j['purpose'] as String? ?? '',
        startTime: DateTime.parse(j['startTime'] as String),
        endTime: DateTime.parse(j['endTime'] as String),
        status: j['status'] as String? ?? 'pending',
        createdAt:
            DateTime.tryParse(j['createdAt'] as String? ?? '') ?? DateTime.now(),
      );

  Color get statusColor {
    switch (status) {
      case 'approved': return AppColors.green;
      case 'rejected': return AppColors.red;
      case 'cancelled': return AppColors.textSecondary;
      default: return AppColors.warning;
    }
  }
}
