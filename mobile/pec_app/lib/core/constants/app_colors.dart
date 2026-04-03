import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  // Primary palette (Neo-Brutalist)
  static const Color black = Color(0xFF000000);
  static const Color white = Color(0xFFFFFFFF);
  static const Color yellow = Color(0xFFFACC15);
  static const Color green = Color(0xFF4ADE80);
  static const Color blue = Color(0xFF3B82F6);
  static const Color red = Color(0xFFEF4444);

  // Background
  static const Color bgDark = Color(0xFF000000);
  static const Color bgLight = Color(0xFFFFFFFF);
  static const Color bgSurface = Color(0xFFF5F5F5);
  static const Color bgSurfaceDark = Color(0xFF111111);

  // Text
  static const Color textPrimary = Color(0xFF000000);
  static const Color textSecondary = Color(0x99000000); // 60% black
  static const Color textPrimaryDark = Color(0xFFFFFFFF);
  static const Color textSecondaryDark = Color(0x99FFFFFF); // 60% white

  // Border
  static const Color border = Color(0xFF000000);
  static const Color borderLight = Color(0xFFE5E7EB);

  // Semantic
  static const Color success = Color(0xFF22C55E);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);
  static const Color info = Color(0xFF3B82F6);

  // Shadow offset colour used for neo-brutal cards
  static const Color shadowYellow = Color(0xFFFACC15);
  static const Color shadowRed = Color(0xFFEF4444);
  static const Color shadowBlue = Color(0xFF3B82F6);
  static const Color shadowGreen = Color(0xFF22C55E);
}
