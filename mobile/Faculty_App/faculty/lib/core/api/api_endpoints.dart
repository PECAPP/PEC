class ApiEndpoints {
  ApiEndpoints._();

  // Auth
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String refresh = '/auth/refresh';
  static const String logout = '/auth/logout';
  static const String profile = '/auth/profile';
  static const String forgotPassword = '/auth/request-password-reset';
  static const String resetPassword = '/auth/reset-password';

  // Users
  static const String users = '/users';
  static String user(String id) => '/users/$id';

  // Courses
  static const String courses = '/courses';
  static String course(String id) => '/courses/$id';

  // Enrollments
  static const String enrollments = '/enrollments';

  // Faculty Bio System
  static String facultyBio(String facultyId) => '/faculty-bio-system/$facultyId';
  static const String publications = '/faculty-bio-system/publications';
  static String publication(String id) => '/faculty-bio-system/publications/$id';
  static const String awards = '/faculty-bio-system/awards';
  static String award(String id) => '/faculty-bio-system/awards/$id';
  static const String conferences = '/faculty-bio-system/conferences';
  static String conference(String id) => '/faculty-bio-system/conferences/$id';
  static const String consultations = '/faculty-bio-system/consultations';
  static String consultation(String id) => '/faculty-bio-system/consultations/$id';

  // Attendance
  static const String attendance = '/attendance';
  static const String attendanceFacultyStats = '/attendance/faculty-stats';
  static const String attendanceSessions = '/attendanceSessions';
  static String attendanceSession(String id) => '/attendanceSessions/$id';

  // Timetable
  static const String timetable = '/timetable';
  static String timetableEntry(String id) => '/timetable/$id';

  // Examinations
  static const String examinations = '/examinations';

  // Course Materials
  static const String courseMaterials = '/course-materials';
  static String courseMaterial(String id) => '/course-materials/$id';

  // Noticeboard
  static const String noticeboard = '/noticeboard';
  static String notice(String id) => '/noticeboard/$id';

  // Finance
  static const String financeFees = '/finance/fees';
  static const String financeTransactions = '/finance/transactions';

  // Marketplace
  static const String marketplaceListings = '/marketplace/listings';

  // Notifications
  static const String notifications = '/notifications';
  static String notificationRead(String id) => '/notifications/$id/read';
  static String notificationDelete(String id) => '/notifications/$id';

  // Chat
  static const String chatRooms = '/chat/rooms';
  static String chatRoom(String id) => '/chat/rooms/$id';
  static String chatMessages(String roomId) => '/chat/rooms/$roomId/messages';

  // Departments
  static const String departments = '/departments';
  static String department(String id) => '/departments/$id';
}
