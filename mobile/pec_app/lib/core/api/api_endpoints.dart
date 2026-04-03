class ApiEndpoints {
  ApiEndpoints._();

  // Auth
  static const String signIn = '/auth/sign-in';
  static const String signUp = '/auth/sign-up';
  static const String refresh = '/auth/refresh';
  static const String forgotPassword = '/auth/forgot-password';
  static const String resetPassword = '/auth/reset-password';
  static const String signOut = '/auth/sign-out';

  // Users
  static const String me = '/users/me';
  static const String users = '/users';
  static String user(String id) => '/users/$id';
  static const String meAvatar = '/users/me/avatar';
  static const String meResume = '/users/me/resume';
  static const String meFcmToken = '/users/me/fcm-token';
  static const String bulkUpload = '/users/bulk-upload';

  // Courses
  static const String courses = '/courses';
  static String course(String id) => '/courses/$id';

  // Enrollments
  static const String enrollments = '/enrollments';

  // Departments
  static const String departments = '/departments';
  static String department(String id) => '/departments/$id';

  // Faculty
  static const String faculty = '/faculty';
  static String facultyMember(String id) => '/faculty/$id';

  // Attendance
  static const String attendance = '/attendance';
  static const String attendanceSummary = '/attendance/summary';
  static const String attendanceSession = '/attendance-session';
  static String attendanceSessionById(String id) => '/attendance-session/$id';

  // Timetable
  static const String timetable = '/timetable';
  static String timetableById(String id) => '/timetable/$id';

  // Examinations
  static const String examinations = '/examinations';
  static String examination(String id) => '/examinations/$id';

  // Course Materials
  static const String courseMaterials = '/course-materials';
  static String courseMaterial(String id) => '/course-materials/$id';

  // Academic Calendar
  static const String academicCalendar = '/academic-calendar';
  static String academicCalendarEvent(String id) => '/academic-calendar/$id';

  // Chat
  static const String chatRooms = '/chat/rooms';
  static String chatRoom(String id) => '/chat/rooms/$id';
  static String chatRoomMessages(String id) => '/chat/rooms/$id/messages';
  static String chatRoomMembers(String id) => '/chat/rooms/$id/members';

  // Noticeboard
  static const String noticeboard = '/noticeboard';
  static String notice(String id) => '/noticeboard/$id';

  // Clubs
  static const String clubs = '/clubs';
  static String club(String id) => '/clubs/$id';
  static String clubJoinRequest(String id) => '/clubs/$id/join-request';
  static String clubJoinRequestAction(String clubId, String reqId) =>
      '/clubs/$clubId/join-request/$reqId';

  // Canteen
  static const String canteenItems = '/canteen/items';
  static String canteenItem(String id) => '/canteen/items/$id';
  static const String canteenOrders = '/canteen/orders';
  static String canteenOrder(String id) => '/canteen/orders/$id';
  static String canteenOrderStatus(String id) => '/canteen/orders/$id/status';

  // Rooms
  static const String rooms = '/rooms';
  static String room(String id) => '/rooms/$id';
  static const String roomAvailability = '/rooms/availability';
  static const String roomBooking = '/rooms/booking';
  static String roomBookingById(String id) => '/rooms/booking/$id';

  // Hostel Issues
  static const String hostelIssues = '/hostel-issues';
  static String hostelIssue(String id) => '/hostel-issues/$id';
  static String hostelIssueStatus(String id) => '/hostel-issues/$id/status';

  // Campus Map
  static const String campusMapRegions = '/campus-map/regions';
  static const String campusMapRoads = '/campus-map/roads';

  // Score Sheet / CGPA
  static const String cgpaEntries = '/cgpa-entries';
  static const String examinationScores = '/examinations/scores';

  // Notifications
  static const String notifications = '/notifications';
  static String notificationRead(String id) => '/notifications/$id/read';
  static String notificationDelete(String id) => '/notifications/$id';

  // Student Portfolio
  static const String studentPortfolio = '/student-portfolio';
  static String studentPortfolioItem(String id) => '/student-portfolio/$id';

  // College Settings
  static const String collegeSettings = '/college-settings';
}
