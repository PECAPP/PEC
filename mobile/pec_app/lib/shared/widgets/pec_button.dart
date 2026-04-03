import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_dimensions.dart';
import '../../core/constants/app_text_styles.dart';

enum PecButtonVariant { filled, outlined, ghost }

class PecButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final PecButtonVariant variant;
  final Color color;
  final Color? textColor;
  final bool fullWidth;
  final bool isLoading;
  final IconData? prefixIcon;
  final double? height;

  const PecButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.variant = PecButtonVariant.filled,
    this.color = AppColors.yellow,
    this.textColor,
    this.fullWidth = false,
    this.isLoading = false,
    this.prefixIcon,
    this.height,
  });

  @override
  Widget build(BuildContext context) {
    final effectiveTextColor = textColor ??
        (variant == PecButtonVariant.filled ? AppColors.black : color);
    final effectiveBg =
        variant == PecButtonVariant.filled ? color : Colors.transparent;

    Widget child = Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (isLoading)
          SizedBox(
            width: 16,
            height: 16,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              valueColor: AlwaysStoppedAnimation<Color>(effectiveTextColor),
            ),
          )
        else ...[
          if (prefixIcon != null) ...[
            Icon(prefixIcon, size: AppDimensions.iconSm, color: effectiveTextColor),
            const SizedBox(width: AppDimensions.sm),
          ],
          Text(label,
              style: AppTextStyles.button.copyWith(color: effectiveTextColor)),
        ],
      ],
    );

    final btn = GestureDetector(
      onTap: (onPressed == null || isLoading) ? null : onPressed,
      child: AnimatedOpacity(
        opacity: onPressed == null ? 0.5 : 1.0,
        duration: const Duration(milliseconds: 150),
        child: Container(
          height: height ?? AppDimensions.minTouchTarget,
          padding: const EdgeInsets.symmetric(horizontal: AppDimensions.lg),
          decoration: BoxDecoration(
            color: effectiveBg,
            border: Border.all(
              color: variant == PecButtonVariant.ghost
                  ? Colors.transparent
                  : AppColors.black,
              width: AppDimensions.borderWidth,
            ),
            boxShadow: variant == PecButtonVariant.filled && onPressed != null
                ? const [
                    BoxShadow(
                      offset: Offset(
                          AppDimensions.shadowOffset, AppDimensions.shadowOffset),
                      color: AppColors.black,
                    ),
                  ]
                : null,
          ),
          alignment: Alignment.center,
          child: child,
        ),
      ),
    );

    return fullWidth ? SizedBox(width: double.infinity, child: btn) : btn;
  }
}
