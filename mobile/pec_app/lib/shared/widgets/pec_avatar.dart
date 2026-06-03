import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_dimensions.dart';

class PecAvatar extends StatelessWidget {
  final String? imageUrl;
  final String name;
  final double size;
  final Color bgColor;

  const PecAvatar({
    super.key,
    this.imageUrl,
    required this.name,
    this.size = AppDimensions.avatarMd,
    this.bgColor = AppColors.yellow,
  });

  String get _initials {
    final parts = name.trim().split(' ');
    if (parts.isEmpty) return '?';
    if (parts.length == 1) return parts[0][0].toUpperCase();
    return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: bgColor,
        shape: BoxShape.circle,
        border: Border.all(color: AppColors.black, width: 2),
      ),
      clipBehavior: Clip.antiAlias,
      child: imageUrl != null && imageUrl!.isNotEmpty
          ? CachedNetworkImage(
              imageUrl: imageUrl!,
              fit: BoxFit.cover,
              placeholder: (_, __) => _InitialsWidget(initials: _initials, size: size),
              errorWidget: (_, __, ___) =>
                  _InitialsWidget(initials: _initials, size: size),
            )
          : _InitialsWidget(initials: _initials, size: size),
    );
  }
}

class _InitialsWidget extends StatelessWidget {
  final String initials;
  final double size;
  const _InitialsWidget({required this.initials, required this.size});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Text(
        initials,
        style: GoogleFonts.inter(
          fontSize: size * 0.35,
          fontWeight: FontWeight.w800,
          color: AppColors.black,
        ),
      ),
    );
  }
}
