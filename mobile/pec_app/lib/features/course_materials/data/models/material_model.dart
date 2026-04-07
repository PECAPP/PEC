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
    final id = (j['id'] ?? j['_id'] ?? '').toString();
    final url = (j['fileUrl'] ?? j['url'] ?? j['file'] ?? '').toString();
    final ext = url.split('.').last.toLowerCase().split('?').first;
    String type = (j['fileType'] ?? j['type'] ?? '').toString();
    if (type.isEmpty) {
      if (['pdf'].contains(ext))
        type = 'pdf';
      else if (['ppt', 'pptx'].contains(ext))
        type = 'ppt';
      else if (['doc', 'docx'].contains(ext))
        type = 'doc';
      else if (['mp4', 'mov', 'avi'].contains(ext))
        type = 'video';
      else
        type = 'other';
    }

    final courseObj = j['course'] is Map<String, dynamic>
        ? j['course'] as Map<String, dynamic>
        : const <String, dynamic>{};
    final facultyObj = j['faculty'] is Map<String, dynamic>
        ? j['faculty'] as Map<String, dynamic>
        : const <String, dynamic>{};

    return CourseMaterialModel(
      id: id,
      title: (j['title'] ?? j['name'] ?? 'Untitled').toString(),
      description: j['description']?.toString(),
      fileUrl: url,
      fileType: type,
      courseId: (j['courseId'] ?? courseObj['id'])?.toString(),
      courseName: (courseObj['name'] ?? j['courseName'])?.toString(),
      courseCode: (courseObj['code'] ?? j['courseCode'])?.toString(),
      uploadedBy: (j['uploadedBy'] ?? facultyObj['name'])?.toString(),
      fileSize: j['fileSize'] != null ? (j['fileSize'] as num).toInt() : null,
      createdAt:
          DateTime.tryParse(j['createdAt'] as String? ?? '') ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'description': description,
        'fileUrl': fileUrl,
        'fileType': fileType,
        'courseId': courseId,
        'courseName': courseName,
        'courseCode': courseCode,
        'uploadedBy': uploadedBy,
        'fileSize': fileSize,
        'createdAt': createdAt.toIso8601String(),
      };

  IconData get fileIcon {
    switch (fileType) {
      case 'pdf':
        return Icons.picture_as_pdf_outlined;
      case 'ppt':
        return Icons.slideshow_outlined;
      case 'doc':
        return Icons.description_outlined;
      case 'video':
        return Icons.play_circle_outline;
      case 'link':
        return Icons.link_outlined;
      default:
        return Icons.insert_drive_file_outlined;
    }
  }

  Color get fileColor {
    switch (fileType) {
      case 'pdf':
        return AppColors.red;
      case 'ppt':
        return AppColors.warning;
      case 'doc':
        return AppColors.blue;
      case 'video':
        return AppColors.green;
      default:
        return AppColors.textSecondary;
    }
  }

  String get fileSizeLabel {
    if (fileSize == null) return '';
    if (fileSize! < 1024) return '${fileSize}B';
    if (fileSize! < 1024 * 1024)
      return '${(fileSize! / 1024).toStringAsFixed(1)}KB';
    return '${(fileSize! / (1024 * 1024)).toStringAsFixed(1)}MB';
  }
}
