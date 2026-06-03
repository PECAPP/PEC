import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// ---------------------------------------------------------------------------
// Raw connectivity stream — emits ConnectivityResult list on every change
// ---------------------------------------------------------------------------
final connectivityStreamProvider =
    StreamProvider<List<ConnectivityResult>>((ref) {
  return Connectivity().onConnectivityChanged;
});

// ---------------------------------------------------------------------------
// Boolean convenience — true when at least one non-none result is present
// ---------------------------------------------------------------------------
final isOnlineProvider = Provider<bool>((ref) {
  final result = ref.watch(connectivityStreamProvider);
  return result.when(
    data: (results) =>
        results.isNotEmpty &&
        results.any((r) => r != ConnectivityResult.none),
    loading: () => true, // Assume online until proven otherwise
    error: (_, __) => true,
  );
});
