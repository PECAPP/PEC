import 'package:latlong2/latlong.dart';

class MapRegion {
  final String id;
  final String name;
  final String type; // academic | hostel | sports | admin | canteen | other
  final String? description;
  final List<LatLng> polygon; // GeoJSON ring
  final LatLng center;

  const MapRegion({
    required this.id,
    required this.name,
    required this.type,
    this.description,
    required this.polygon,
    required this.center,
  });

  factory MapRegion.fromJson(Map<String, dynamic> j) {
    List<LatLng> poly = [];
    LatLng center = const LatLng(30.7650, 76.7849); // PEC default

    // GeoJSON polygon: coordinates[0] = outer ring [[lng, lat], ...]
    final geo = j['geometry'] as Map<String, dynamic>?;
    if (geo != null) {
      final coords = (geo['coordinates'] as List<dynamic>?)?.first;
      if (coords != null) {
        poly = (coords as List<dynamic>)
            .map((c) {
              final arr = c as List<dynamic>;
              return LatLng(
                  (arr[1] as num).toDouble(), (arr[0] as num).toDouble());
            })
            .toList();
        if (poly.isNotEmpty) {
          final avgLat = poly.map((p) => p.latitude).reduce((a, b) => a + b) /
              poly.length;
          final avgLng =
              poly.map((p) => p.longitude).reduce((a, b) => a + b) /
                  poly.length;
          center = LatLng(avgLat, avgLng);
        }
      }
    }

    // Fallback flat coordinates list
    if (poly.isEmpty) {
      final flat = j['coordinates'] as List<dynamic>?;
      if (flat != null) {
        poly = flat.map((c) {
          final m = c as Map<String, dynamic>;
          return LatLng(
              (m['lat'] as num).toDouble(), (m['lng'] as num).toDouble());
        }).toList();
        if (poly.isNotEmpty) {
          final avgLat =
              poly.map((p) => p.latitude).reduce((a, b) => a + b) / poly.length;
          final avgLng =
              poly.map((p) => p.longitude).reduce((a, b) => a + b) /
                  poly.length;
          center = LatLng(avgLat, avgLng);
        }
      }
    }

    return MapRegion(
      id: j['id'] as String,
      name: j['name'] as String,
      type: j['type'] as String? ?? 'other',
      description: j['description'] as String?,
      polygon: poly,
      center: center,
    );
  }
}
