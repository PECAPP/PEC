import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

class CourseMaterialModel {
  final String id;
  final String title;
  final String? description;
  final String fileUrl;
  final String fileType; // pdf | ppt | doc | video | link | other
  final String? courseId;
  final String? courseName;
  final String? courseCode;
  final String? uploadedBy;
  final int? fileSize; // bytes
  final DateTime createdAt;

  const CourseMaterialModel({
    required this.id,
    required this.title,
    this.description,
    required this.fileUrl,
    required this.fileType,
    this.courseId,
    this.courseName,
    this.courseCode,
    this.uploadedBy,
    this.fileSize,
    required this.createdAt,
  });

  factory CourseMaterialModel.fromJson(Map<String, dynamic> j) {
    final url = j['fileUrl'] as String? ?? j['url'] as String? ?? '';
    final ext = url.split('.').last.toLowerCase().split('?').first;
    String type = j['fileType'] as String? ?? j['type'] as String? ?? '';
    if (type.isEmpty) {
      if (['pdf'].contains(ext)) type = 'pdf';
      else if (['ppt', 'pptx'].contains(ext)) type = 'ppt';
      else if (['doc', 'docx'].contains(ext)) type = 'doc';
      else if (['mp4', 'mov', 'avi'].contains(ext)) type = 'video';
      else type = 'other';
    }
    return CourseMaterialModel(
      id: j['id'] as String,
      title: j['title'] as String? ?? 'Untitled',
      description: j['description'] as String?,
      fileUrl: url,
      fileType: type,
      courseId: j['courseId'] as String?,
      courseName: j['course']?['name'] as String? ?? j['courseName'] as String?,
      courseCode: j['course']?['code'] as String? ?? j['courseCode'] as String?,
      uploadedBy: j['uploadedBy'] as String? ?? j['faculty']?['name'] as String?,
      fileSize: j['fileSize'] != null ? (j['fileSize'] as num).toInt() : null,
      createdAt: DateTime.tryParse(j['createdAt'] as String? ?? '') ?? DateTime.now(),
    );
  }

  IconData get fileIcon {
    switch (fileType) {
      case 'pdf': return Icons.picture_as_pdf_outlined;
      case 'ppt': return Icons.slideshow_outlined;
      case 'doc': return Icons.description_outlined;
      case 'video': return Icons.play_circle_outline;
      case 'link': return Icons.link_outlined;
      default: return Icons.insert_drive_file_outlined;
    }
  }

  Color get fileColor {
    switch (fileType) {
      case 'pdf': return AppColors.red;
      case 'ppt': return AppColors.warning;
      case 'doc': return AppColors.blue;
      case 'video': return AppColors.green;
      default: return AppColors.textSecondary;
    }
  }

  String get fileSizeLabel {
    if (fileSize == null) return '';
    if (fileSize! < 1024) return '${fileSize}B';
    if (fileSize! < 1024 * 1024) return '${(fileSize! / 1024).toStringAsFixed(1)}KB';
    return '${(fileSize! / (1024 * 1024)).toStringAsFixed(1)}MB';
  }
}
