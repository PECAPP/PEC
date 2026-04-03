import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../constants/app_colors.dart';
import '../constants/app_dimensions.dart';

class AppTheme {
  AppTheme._();

  static ThemeData get light => _buildTheme(Brightness.light);
  static ThemeData get dark => _buildTheme(Brightness.dark);

  static ThemeData _buildTheme(Brightness brightness) {
    final isDark = brightness == Brightness.dark;
    final bg = isDark ? AppColors.bgDark : AppColors.bgLight;
    final surface = isDark ? AppColors.bgSurfaceDark : AppColors.bgSurface;
    final onBg = isDark ? AppColors.textPrimaryDark : AppColors.textPrimary;

    return ThemeData(
      brightness: brightness,
      scaffoldBackgroundColor: bg,
      colorScheme: ColorScheme(
        brightness: brightness,
        primary: AppColors.yellow,
        onPrimary: AppColors.black,
        secondary: AppColors.blue,
        onSecondary: AppColors.white,
        error: AppColors.red,
        onError: AppColors.white,
        surface: surface,
        onSurface: onBg,
      ),
      textTheme: GoogleFonts.interTextTheme().apply(
        bodyColor: onBg,
        displayColor: onBg,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: bg,
        foregroundColor: onBg,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          fontFamily: 'MonumentExtended',
          fontSize: 18,
          fontWeight: FontWeight.w800,
          color: onBg,
        ),
        systemOverlayStyle: isDark
            ? SystemUiOverlayStyle.light
            : SystemUiOverlayStyle.dark,
        shape: Border(
          bottom: BorderSide(color: AppColors.border, width: AppDimensions.borderWidth),
        ),
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: bg,
        selectedItemColor: AppColors.yellow,
        unselectedItemColor: onBg.withValues(alpha: 0.4),
        type: BottomNavigationBarType.fixed,
        elevation: 0,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.yellow,
          foregroundColor: AppColors.black,
          elevation: 0,
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.zero,
            side: BorderSide(color: AppColors.black, width: AppDimensions.borderWidth),
          ),
          minimumSize: const Size.fromHeight(AppDimensions.minTouchTarget),
          textStyle: GoogleFonts.inter(
            fontWeight: FontWeight.w800,
            fontSize: 14,
            letterSpacing: 0.8,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: onBg,
          side: BorderSide(color: onBg, width: AppDimensions.borderWidth),
          shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
          minimumSize: const Size.fromHeight(AppDimensions.minTouchTarget),
          textStyle: GoogleFonts.inter(
            fontWeight: FontWeight.w800,
            fontSize: 14,
            letterSpacing: 0.8,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: bg,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: AppDimensions.md,
          vertical: AppDimensions.md,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppDimensions.radiusSm),
          borderSide: const BorderSide(color: AppColors.border, width: AppDimensions.borderWidth),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppDimensions.radiusSm),
          borderSide: BorderSide(color: onBg, width: AppDimensions.borderWidth),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppDimensions.radiusSm),
          borderSide: const BorderSide(color: AppColors.yellow, width: AppDimensions.borderWidthThick),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppDimensions.radiusSm),
          borderSide: const BorderSide(color: AppColors.red, width: AppDimensions.borderWidth),
        ),
        labelStyle: GoogleFonts.inter(fontWeight: FontWeight.w600, color: onBg),
        hintStyle: GoogleFonts.inter(color: onBg.withValues(alpha: 0.4)),
      ),
      cardTheme: CardThemeData(
        color: surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppDimensions.radiusSm),
          side: const BorderSide(color: AppColors.border, width: AppDimensions.borderWidth),
        ),
        margin: EdgeInsets.zero,
      ),
      chipTheme: ChipThemeData(
        backgroundColor: surface,
        selectedColor: AppColors.yellow,
        side: const BorderSide(color: AppColors.border, width: 2),
        shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
        labelStyle: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 12),
      ),
      dividerTheme: const DividerThemeData(
        color: AppColors.border,
        thickness: 2,
        space: 0,
      ),
      useMaterial3: true,
    );
  }
}
