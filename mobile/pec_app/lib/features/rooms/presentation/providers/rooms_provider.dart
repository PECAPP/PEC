import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../data/datasources/rooms_remote_datasource.dart';
import '../../data/models/room_model.dart';

final roomsDataSourceProvider = Provider<RoomsRemoteDataSource>((ref) =>
    RoomsRemoteDataSource(ref.watch(apiClientProvider)));

final roomsProvider = FutureProvider<List<RoomModel>>((ref) async {
  final ds = ref.watch(roomsDataSourceProvider);
  return ds.getRooms();
});

final myBookingsProvider = FutureProvider<List<RoomBooking>>((ref) async {
  final ds = ref.watch(roomsDataSourceProvider);
  final bookings = await ds.getMyBookings();
  bookings.sort((a, b) => b.createdAt.compareTo(a.createdAt));
  return bookings;
});

class BookingNotifier extends StateNotifier<AsyncValue<RoomBooking?>> {
  final RoomsRemoteDataSource _ds;
  final Ref _ref;
  BookingNotifier(this._ds, this._ref) : super(const AsyncValue.data(null));

  Future<void> book({
    required String roomId,
    required String purpose,
    required DateTime start,
    required DateTime end,
  }) async {
    state = const AsyncValue.loading();
    try {
      final booking = await _ds.createBooking(
        roomId: roomId,
        purpose: purpose,
        startTime: start,
        endTime: end,
      );
      _ref.invalidate(myBookingsProvider);
      state = AsyncValue.data(booking);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> cancel(String id) async {
    state = const AsyncValue.loading();
    try {
      await _ds.cancelBooking(id);
      _ref.invalidate(myBookingsProvider);
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  void reset() => state = const AsyncValue.data(null);
}

final bookingNotifierProvider =
    StateNotifierProvider<BookingNotifier, AsyncValue<RoomBooking?>>(
  (ref) => BookingNotifier(ref.watch(roomsDataSourceProvider), ref),
);
