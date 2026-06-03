import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_dimensions.dart';

class PecBadge extends StatelessWidget {
  final String label;
  final Color color;
  final Color textColor;
  final double fontSize;

  const PecBadge({
    super.key,
    required this.label,
    this.color = AppColors.yellow,
    this.textColor = AppColors.black,
    this.fontSize = 10,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppDimensions.sm,
        vertical: 3,
      ),
      decoration: BoxDecoration(
        color: color,
        border: Border.all(color: AppColors.black, width: 2),
      ),
      child: Text(
        label.toUpperCase(),
        style: GoogleFonts.inter(
          fontSize: fontSize,
          fontWeight: FontWeight.w800,
          letterSpacing: 0.8,
          color: textColor,
        ),
      ),
    );
  }
}
