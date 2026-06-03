import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../data/datasources/notice_remote_datasource.dart';
import '../../data/models/notice_model.dart';

final noticeDataSourceProvider = Provider<NoticeRemoteDataSource>((ref) {
  return NoticeRemoteDataSource(ref.watch(apiClientProvider));
});

// TODO: replace with real API call once backend noticeboard endpoint is ready
final noticesProvider = FutureProvider<List<NoticeModel>>((ref) async {
  return _dummyNotices;
});

final _dummyNotices = <NoticeModel>[
  NoticeModel(
    id: 'n1',
    title: 'Mid-Semester Examination Schedule Released',
    content:
        'The mid-semester examinations for all departments will be held from 21 April to 28 April 2026. Students are advised to check the detailed schedule on the ERP portal.',
    category: 'exam',
    author: 'Examination Branch',
    createdAt: DateTime(2026, 4, 4),
    isPinned: true,
  ),
  NoticeModel(
    id: 'n2',
    title: 'Last Date for Fee Submission: 10 April 2026',
    content:
        'Students who have not yet paid their semester fee are reminded that the last date is 10 April 2026. A late fine will be charged after this date.',
    category: 'urgent',
    author: 'Accounts Section',
    createdAt: DateTime(2026, 4, 3),
    isPinned: true,
  ),
  NoticeModel(
    id: 'n3',
    title: 'Guest Lecture on Artificial Intelligence & ML',
    content:
        'A guest lecture by Dr. Navdeep Singh (IIT Delhi) on "Advances in Large Language Models" is scheduled for 8 April 2026 at 3:00 PM in Seminar Hall A.',
    category: 'academic',
    author: 'CSE Department',
    createdAt: DateTime(2026, 4, 3),
  ),
  NoticeModel(
    id: 'n4',
    title: 'Hostel Mess Menu Revised — April 2026',
    content:
        'The hostel mess menu has been updated for the month of April. Students can view the updated menu at the mess notice board or on the ERP app.',
    category: 'hostel',
    author: 'Hostel Administration',
    createdAt: DateTime(2026, 4, 2),
  ),
  NoticeModel(
    id: 'n5',
    title: 'Library Timings Extended During Exam Period',
    content:
        'The central library will remain open till 11:00 PM from 15 April to 30 April to facilitate students during the examination period.',
    category: 'academic',
    author: 'Library',
    createdAt: DateTime(2026, 4, 1),
  ),
  NoticeModel(
    id: 'n6',
    title: 'Technical Fest "Aavhan 2026" — Registrations Open',
    content:
        'Registrations for Aavhan 2026, the annual technical festival of PEC, are now open. Visit the fest website or the Student Affairs office for details.',
    category: 'general',
    author: 'Student Affairs',
    createdAt: DateTime(2026, 3, 30),
  ),
  NoticeModel(
    id: 'n7',
    title: 'Campus Placement Drive — Infosys (CSE/ECE)',
    content:
        'Infosys will be conducting a placement drive on 15 April 2026. Eligible students from CSE and ECE branches in their final year should register by 10 April.',
    category: 'general',
    author: 'Training & Placement Cell',
    createdAt: DateTime(2026, 3, 29),
  ),
  NoticeModel(
    id: 'n8',
    title: 'Sports Week 2026 — Schedule Announced',
    content:
        'The annual Sports Week will be held from 12 April to 17 April 2026. Students interested in participating should register with their respective department sports coordinators.',
    category: 'general',
    author: 'Sports Department',
    createdAt: DateTime(2026, 3, 28),
  ),
];
