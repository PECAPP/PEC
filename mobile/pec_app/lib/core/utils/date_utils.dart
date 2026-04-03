import 'package:intl/intl.dart';

class AppDateUtils {
  AppDateUtils._();

  static final _dateFormat = DateFormat('dd MMM yyyy');
  static final _timeFormat = DateFormat('hh:mm a');
  static final _dateTimeFormat = DateFormat('dd MMM yyyy, hh:mm a');
  static final _apiDate = DateFormat('yyyy-MM-dd');
  static final _dayFormat = DateFormat('EEEE');
  static final _shortDay = DateFormat('EEE');
  static final _monthYear = DateFormat('MMMM yyyy');

  static DateTime? parseIso(String? s) {
    if (s == null || s.isEmpty) return null;
    try {
      return DateTime.parse(s).toLocal();
    } catch (_) {
      return null;
    }
  }

  static String formatDate(DateTime? dt) =>
      dt == null ? '—' : _dateFormat.format(dt);

  static String formatTime(String? hhmm) {
    if (hhmm == null || hhmm.isEmpty) return '—';
    try {
      final parts = hhmm.split(':');
      final h = int.parse(parts[0]);
      final m = int.parse(parts[1]);
      final dt = DateTime(2000, 1, 1, h, m);
      return _timeFormat.format(dt);
    } catch (_) {
      return hhmm;
    }
  }

  static String formatDateTime(DateTime? dt) =>
      dt == null ? '—' : _dateTimeFormat.format(dt);

  static String formatApiDate(DateTime dt) => _apiDate.format(dt);

  static String dayName(DateTime dt) => _dayFormat.format(dt);
  static String shortDay(DateTime dt) => _shortDay.format(dt);
  static String monthYear(DateTime dt) => _monthYear.format(dt);

  static String relativeTime(DateTime dt) {
    final now = DateTime.now();
    final diff = now.difference(dt);
    if (diff.inSeconds < 60) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return formatDate(dt);
  }

  static String countdown(DateTime target) {
    final now = DateTime.now();
    if (target.isBefore(now)) return 'Past';
    final diff = target.difference(now);
    if (diff.inDays > 0) return '${diff.inDays}d ${diff.inHours % 24}h';
    if (diff.inHours > 0) return '${diff.inHours}h ${diff.inMinutes % 60}m';
    return '${diff.inMinutes}m';
  }

  static String todayDayName() => _dayFormat.format(DateTime.now());
}
