import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../data/datasources/portfolio_remote_datasource.dart';
import '../../data/models/portfolio_model.dart';

final portfolioDataSourceProvider = Provider<PortfolioRemoteDataSource>(
    (ref) => PortfolioRemoteDataSource(ref.watch(apiClientProvider)));

final portfolioProvider =
    FutureProvider<List<PortfolioProject>>((ref) async {
  final ds = ref.watch(portfolioDataSourceProvider);
  final list = await ds.getMyProjects();
  list.sort((a, b) => b.createdAt.compareTo(a.createdAt));
  return list;
});

class PortfolioActionsNotifier extends StateNotifier<AsyncValue<void>> {
  final PortfolioRemoteDataSource _ds;
  final Ref _ref;
  PortfolioActionsNotifier(this._ds, this._ref)
      : super(const AsyncValue.data(null));

  Future<void> addProject({
    required String title,
    String? description,
    List<String> techStack = const [],
    String? imageUrl,
    String? repoUrl,
    String? demoUrl,
  }) async {
    state = const AsyncValue.loading();
    try {
      await _ds.addProject(
        title: title,
        description: description,
        techStack: techStack,
        imageUrl: imageUrl,
        repoUrl: repoUrl,
        demoUrl: demoUrl,
      );
      _ref.invalidate(portfolioProvider);
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> deleteProject(String id) async {
    state = const AsyncValue.loading();
    try {
      await _ds.deleteProject(id);
      _ref.invalidate(portfolioProvider);
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  void reset() => state = const AsyncValue.data(null);
}

final portfolioActionsProvider =
    StateNotifierProvider<PortfolioActionsNotifier, AsyncValue<void>>(
        (ref) => PortfolioActionsNotifier(
            ref.watch(portfolioDataSourceProvider), ref));
