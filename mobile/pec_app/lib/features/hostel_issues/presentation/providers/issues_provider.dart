import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../data/datasources/issues_remote_datasource.dart';
import '../../data/models/issue_model.dart';

final issuesDataSourceProvider = Provider<IssuesRemoteDataSource>((ref) =>
    IssuesRemoteDataSource(ref.watch(apiClientProvider)));

final myIssuesProvider = FutureProvider<List<HostelIssue>>((ref) async {
  final ds = ref.watch(issuesDataSourceProvider);
  final issues = await ds.getMyIssues();
  issues.sort((a, b) => b.createdAt.compareTo(a.createdAt));
  return issues;
});

class IssueFormNotifier extends StateNotifier<AsyncValue<HostelIssue?>> {
  final IssuesRemoteDataSource _ds;
  final Ref _ref;
  IssueFormNotifier(this._ds, this._ref) : super(const AsyncValue.data(null));

  Future<void> submit({
    required String title,
    required String description,
    required String category,
    required String priority,
    String? roomNumber,
    String? imageUrl,
  }) async {
    state = const AsyncValue.loading();
    try {
      final issue = await _ds.createIssue(
        title: title,
        description: description,
        category: category,
        priority: priority,
        roomNumber: roomNumber,
        imageUrl: imageUrl,
      );
      _ref.invalidate(myIssuesProvider);
      state = AsyncValue.data(issue);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  void reset() => state = const AsyncValue.data(null);
}

final issueFormProvider =
    StateNotifierProvider<IssueFormNotifier, AsyncValue<HostelIssue?>>(
  (ref) => IssueFormNotifier(ref.watch(issuesDataSourceProvider), ref),
);
