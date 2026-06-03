import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_dimensions.dart';

class PecCard extends StatelessWidget {
  final Widget child;
  final Color color;
  final Color shadowColor;
  final EdgeInsets padding;
  final VoidCallback? onTap;
  final double borderWidth;
  final double shadowOffset;

  const PecCard({
    super.key,
    required this.child,
    this.color = AppColors.white,
    this.shadowColor = AppColors.black,
    this.padding = const EdgeInsets.all(AppDimensions.md),
    this.onTap,
    this.borderWidth = AppDimensions.borderWidth,
    this.shadowOffset = AppDimensions.shadowOffset,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: padding,
        decoration: BoxDecoration(
          color: color,
          border:
              Border.all(color: AppColors.black, width: borderWidth),
          boxShadow: [
            BoxShadow(
              offset: Offset(shadowOffset, shadowOffset),
              color: shadowColor,
            ),
          ],
        ),
        child: child,
      ),
    );
  }
}
