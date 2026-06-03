import 'package:flutter/material.dart';

/// Design tokens matching the Next.js PEC Gold accent theme.
class AppColors {
  AppColors._();

  // ── Primary Gold ──
  static const Color gold = Color(0xFFF59E0B);       // Primary accent
  static const Color goldLight = Color(0xFFFBBF24);   // Hover / highlight
  static const Color goldDark = Color(0xFFD97706);     // Pressed state
  static const Color goldSubtle = Color(0x1AF59E0B);   // 10% gold bg

  // ── Neutrals (dark mode) ──
  static const Color bgDark = Color(0xFF0F0D0A);
  static const Color surfaceDark = Color(0xFF1A1713);
  static const Color cardDark = Color(0xFF211E18);
  static const Color cardHoverDark = Color(0xFF2A261F);
  static const Color borderDark = Color(0xFF2E2A23);

  // ── Neutrals (light mode) ──
  static const Color bgLight = Color(0xFFFAF9F7);
  static const Color surfaceLight = Color(0xFFFFFFFF);
  static const Color cardLight = Color(0xFFFFFFFF);
  static const Color borderLight = Color(0xFFE8E3DC);

  // ── Text ──
  static const Color textPrimary = Color(0xFFFAFAF5);
  static const Color textSecondary = Color(0xFFA09882);
  static const Color textMuted = Color(0xFF6B6355);
  static const Color textPrimaryLight = Color(0xFF1A1713);
  static const Color textSecondaryLight = Color(0xFF6B6355);

  // ── Semantic ──
  static const Color success = Color(0xFF22C55E);
  static const Color successBg = Color(0x1A22C55E);
  static const Color warning = Color(0xFFF59E0B);
  static const Color warningBg = Color(0x1AF59E0B);
  static const Color error = Color(0xFFEF4444);
  static const Color errorBg = Color(0x1AEF4444);
  static const Color info = Color(0xFF3B82F6);
  static const Color infoBg = Color(0x1A3B82F6);

  // ── Misc ──
  static const Color white = Color(0xFFFFFFFF);
  static const Color black = Color(0xFF000000);
  static const Color transparent = Colors.transparent;
  static const Color shimmerBase = Color(0xFF1A1713);
  static const Color shimmerHighlight = Color(0xFF2A261F);
}
