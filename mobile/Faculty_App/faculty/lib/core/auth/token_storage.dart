import 'package:hive_flutter/hive_flutter.dart';

class TokenStorage {
  static const _boxName = 'auth_tokens';
  static const _keyAccessToken = 'KEY_ACCESS_TOKEN';
  static const _keyRefreshToken = 'KEY_REFRESH_TOKEN';

  Future<Box<dynamic>> _box() {
    if (Hive.isBoxOpen(_boxName)) {
      return Future.value(Hive.box(_boxName));
    }
    return Hive.openBox(_boxName);
  }

  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    final box = await _box();
    await Future.wait([
      box.put(_keyAccessToken, accessToken),
      box.put(_keyRefreshToken, refreshToken),
    ]);
  }

  Future<String?> getAccessToken() async {
    final box = await _box();
    return box.get(_keyAccessToken) as String?;
  }

  Future<String?> getRefreshToken() async {
    final box = await _box();
    return box.get(_keyRefreshToken) as String?;
  }

  Future<void> saveAccessToken(String token) async {
    final box = await _box();
    await box.put(_keyAccessToken, token);
  }

  Future<void> clearAll() async {
    final box = await _box();
    await Future.wait([
      box.delete(_keyAccessToken),
      box.delete(_keyRefreshToken),
    ]);
  }
}
