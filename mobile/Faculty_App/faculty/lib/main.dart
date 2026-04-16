import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:path_provider/path_provider.dart';

import 'app.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Status bar style
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
  ));

  // Load .env
  await dotenv.load(fileName: '.env');

  // Hive init
  await _initHive();

  runApp(
    const ProviderScope(
      child: FacultyApp(),
    ),
  );
}

Future<void> _initHive() async {
  final appSupportDir = await getApplicationSupportDirectory();
  await _deleteStaleLockFiles(appSupportDir.path);

  await Hive.initFlutter(appSupportDir.path);

  try {
    await _openRequiredBoxes();
  } on FileSystemException catch (e) {
    if (!_isLockError(e)) rethrow;

    // Another process may be holding Hive box locks; use per-session fallback path
    // so startup does not crash during development/hot-run conflicts.
    final fallbackRoot = await getTemporaryDirectory();
    final fallbackPath = '${fallbackRoot.path}${Platform.pathSeparator}faculty_hive_fallback_${DateTime.now().millisecondsSinceEpoch}';

    await Hive.close();
    await _deleteStaleLockFiles(fallbackPath);
    await Hive.initFlutter(fallbackPath);
    await _openRequiredBoxes();

    debugPrint('Hive lock contention detected. Using fallback storage path: $fallbackPath');
  }
}

Future<void> _openRequiredBoxes() async {
  await _openBoxWithRetry('settings');
  await _openBoxWithRetry('auth');
  await _openBoxWithRetry('auth_tokens');
}

Future<void> _openBoxWithRetry(String name) async {
  if (Hive.isBoxOpen(name)) return;

  const delays = [
    Duration(milliseconds: 120),
    Duration(milliseconds: 260),
    Duration(milliseconds: 520),
  ];

  for (int i = 0; i <= delays.length; i++) {
    try {
      await Hive.openBox(name);
      return;
    } on FileSystemException catch (e) {
      if (!_isLockError(e) || i == delays.length) rethrow;
      await Future.delayed(delays[i]);
    }
  }
}

bool _isLockError(FileSystemException e) {
  final message = (e.osError?.message ?? e.message).toLowerCase();
  return message.contains('lock') ||
      message.contains('being used by another process') ||
      message.contains('cannot access the file');
}

Future<void> _deleteStaleLockFiles(String dirPath) async {
  final names = ['settings.lock', 'auth.lock', 'auth_tokens.lock'];
  for (final name in names) {
    final file = File('$dirPath${Platform.pathSeparator}$name');
    if (!await file.exists()) continue;
    try {
      await file.delete();
    } catch (_) {
      // Ignore lock-file cleanup failures; retries/fallback handle active locks.
    }
  }
}
