import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../data/datasources/resume_remote_datasource.dart';
import '../../data/models/resume_model.dart';

final resumeDataSourceProvider = Provider<ResumeRemoteDataSource>(
    (ref) => ResumeRemoteDataSource(ref.watch(apiClientProvider)));

// Local editable copy of the resume
class ResumeNotifier extends StateNotifier<AsyncValue<ResumeData>> {
  final ResumeRemoteDataSource _ds;
  ResumeNotifier(this._ds) : super(const AsyncValue.loading()) {
    _load();
  }

  Future<void> _load() async {
    try {
      final data = await _ds.getMyResume();
      state = AsyncValue.data(data ?? const ResumeData());
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  void update(ResumeData Function(ResumeData) updater) {
    state.whenData((current) {
      state = AsyncValue.data(updater(current));
    });
  }

  Future<bool> save() async {
    final current = state.value;
    if (current == null) return false;
    try {
      await _ds.saveResume(current);
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<void> reload() async => _load();
}

final resumeProvider =
    StateNotifierProvider<ResumeNotifier, AsyncValue<ResumeData>>(
        (ref) => ResumeNotifier(ref.watch(resumeDataSourceProvider)));
