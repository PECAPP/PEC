import 'dart:convert';
import 'package:hive_flutter/hive_flutter.dart';

/// Lightweight TTL-aware Hive cache.
/// All values stored as JSON strings with a timestamp envelope.
class HiveCache {
  HiveCache._();

  static const _boxName = 'cache';

  static Future<Box> _box() => Hive.openBox(_boxName);

  static Future<void> put(
    String key,
    dynamic value, {
    Duration ttl = const Duration(hours: 1),
  }) async {
    final box = await _box();
    await box.put(key, jsonEncode({
      'data': value,
      'expiresAt': DateTime.now().add(ttl).toIso8601String(),
    }));
  }

  static Future<T?> get<T>(String key) async {
    final box = await _box();
    final raw = box.get(key) as String?;
    if (raw == null) return null;
    try {
      final envelope = jsonDecode(raw) as Map<String, dynamic>;
      final expiresAt = DateTime.parse(envelope['expiresAt'] as String);
      if (DateTime.now().isAfter(expiresAt)) {
        await box.delete(key);
        return null;
      }
      return envelope['data'] as T?;
    } catch (_) {
      return null;
    }
  }

  static Future<void> delete(String key) async {
    final box = await _box();
    await box.delete(key);
  }

  static Future<void> clear() async {
    final box = await _box();
    await box.clear();
  }
}
