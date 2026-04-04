import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:latlong2/latlong.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/pec_card.dart';
import '../../../../shared/widgets/pec_error_state.dart';
import '../../data/models/map_model.dart';
import '../providers/map_provider.dart';

// PEC campus coordinates (Chandigarh)
const _campusCenter = LatLng(30.7650, 76.7849);

class CampusMapScreen extends ConsumerWidget {
  const CampusMapScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final regionsAsync = ref.watch(mapRegionsProvider);
    final selected = ref.watch(selectedRegionProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('CAMPUS MAP'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.invalidate(mapRegionsProvider),
          ),
          if (selected != null)
            IconButton(
              icon: const Icon(Icons.close),
              onPressed: () =>
                  ref.read(selectedRegionProvider.notifier).state = null,
            ),
        ],
      ),
      body: Stack(
        children: [
          // ── Map ───────────────────────────────────────────────────────────
          regionsAsync.when(
            loading: () => _MapBase(regions: const [], selected: null, ref: ref),
            error: (e, _) => PecErrorState(
                message: e.toString(),
                onRetry: () => ref.invalidate(mapRegionsProvider)),
            data: (regions) =>
                _MapBase(regions: regions, selected: selected, ref: ref),
          ),

          // ── Selected region detail card ───────────────────────────────────
          if (selected != null)
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: _RegionDetailCard(region: selected),
            ),

          // ── Legend ────────────────────────────────────────────────────────
          if (selected == null)
            Positioned(
              top: AppDimensions.md,
              right: AppDimensions.md,
              child: _Legend(),
            ),
        ],
      ),
    );
  }
}

class _MapBase extends ConsumerWidget {
  final List<MapRegion> regions;
  final MapRegion? selected;
  final WidgetRef ref;
  const _MapBase(
      {required this.regions, required this.selected, required this.ref});

  @override
  Widget build(BuildContext context, WidgetRef r) {
    return FlutterMap(
      options: MapOptions(
        initialCenter: _campusCenter,
        initialZoom: 16.0,
        maxZoom: 19,
        minZoom: 14,
      ),
      children: [
        TileLayer(
          urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          userAgentPackageName: 'com.pec.campus',
        ),
        // Region polygons
        PolygonLayer(
          polygons: regions.map((region) {
            final isSelected = selected?.id == region.id;
            final color = _regionColor(region.type);
            return Polygon(
              points: region.polygon.isNotEmpty
                  ? region.polygon
                  : [_campusCenter],
              color: color.withValues(alpha: isSelected ? 0.45 : 0.25),
              borderColor: isSelected ? AppColors.yellow : color,
              borderStrokeWidth: isSelected ? 3 : 1.5,
            );
          }).toList(),
        ),
        // Region label markers
        MarkerLayer(
          markers: regions.map((region) {
            return Marker(
              point: region.center,
              width: 100,
              height: 40,
              child: GestureDetector(
                onTap: () =>
                    r.read(selectedRegionProvider.notifier).state = region,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 6, vertical: 3),
                  decoration: BoxDecoration(
                    color: selected?.id == region.id
                        ? AppColors.yellow
                        : AppColors.white.withValues(alpha: 0.9),
                    border: Border.all(
                        color: AppColors.black, width: 1.5),
                    boxShadow: const [
                      BoxShadow(
                          offset: Offset(1, 1), color: AppColors.black)
                    ],
                  ),
                  child: Text(
                    region.name,
                    style: AppTextStyles.labelSmall.copyWith(
                        fontSize: 9, color: AppColors.black),
                    textAlign: TextAlign.center,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Color _regionColor(String type) {
    switch (type) {
      case 'academic': return AppColors.blue;
      case 'hostel': return AppColors.green;
      case 'sports': return AppColors.red;
      case 'admin': return AppColors.warning;
      case 'canteen': return AppColors.yellow;
      default: return AppColors.textSecondary;
    }
  }
}

class _RegionDetailCard extends StatelessWidget {
  final MapRegion region;
  const _RegionDetailCard({required this.region});

  @override
  Widget build(BuildContext context) {
    return PecCard(
      color: AppColors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 8, vertical: 3),
                color: AppColors.yellow,
                child: Text(region.type.toUpperCase(),
                    style: AppTextStyles.labelSmall
                        .copyWith(color: AppColors.black, fontSize: 9)),
              ),
              const SizedBox(width: AppDimensions.sm),
              Expanded(
                child: Text(region.name, style: AppTextStyles.labelLarge,
                    maxLines: 1, overflow: TextOverflow.ellipsis),
              ),
            ],
          ),
          if (region.description != null &&
              region.description!.isNotEmpty) ...[
            const SizedBox(height: AppDimensions.xs),
            Text(region.description!,
                style: AppTextStyles.bodySmall,
                maxLines: 2,
                overflow: TextOverflow.ellipsis),
          ],
        ],
      ),
    );
  }
}

class _Legend extends StatelessWidget {
  final _types = const {
    'Academic': AppColors.blue,
    'Hostel': AppColors.green,
    'Sports': AppColors.red,
    'Admin': AppColors.warning,
    'Canteen': AppColors.yellow,
  };

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppDimensions.sm),
      decoration: BoxDecoration(
        color: AppColors.white.withValues(alpha: 0.92),
        border: Border.all(color: AppColors.black, width: 1.5),
        boxShadow: const [
          BoxShadow(offset: Offset(2, 2), color: AppColors.black)
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: _types.entries
            .map((e) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 2),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                          width: 12,
                          height: 12,
                          color: e.value.withValues(alpha: 0.5),
                          margin: const EdgeInsets.only(right: 6)),
                      Text(e.key,
                          style: AppTextStyles.caption
                              .copyWith(fontSize: 9)),
                    ],
                  ),
                ))
            .toList(),
      ),
    );
  }
}
