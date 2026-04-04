import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../data/datasources/notice_remote_datasource.dart';
import '../../data/models/notice_model.dart';

final noticeDataSourceProvider = Provider<NoticeRemoteDataSource>((ref) {
  return NoticeRemoteDataSource(ref.watch(apiClientProvider));
});

final noticesProvider = FutureProvider<List<NoticeModel>>((ref) async {
  final ds = ref.watch(noticeDataSourceProvider);
  final notices = await ds.getNotices();
  notices.sort((a, b) {
    if (a.isPinned != b.isPinned) return a.isPinned ? -1 : 1;
    return b.createdAt.compareTo(a.createdAt);
  });
  return notices;
});
