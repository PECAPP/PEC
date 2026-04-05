import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../features/auth/domain/entities/user_entity.dart';
import '../../../../features/auth/presentation/providers/auth_provider.dart';
import '../../../../features/attendance/presentation/providers/attendance_provider.dart';
import '../../../../features/courses/presentation/providers/courses_provider.dart';
import '../../../../features/timetable/presentation/providers/timetable_provider.dart';
import '../../../../features/timetable/data/models/timetable_model.dart';
import '../../../../features/noticeboard/presentation/providers/notice_provider.dart';
import '../../../../features/notifications/presentation/providers/notifications_provider.dart';
import '../../../../shared/widgets/app_drawer.dart';
import '../../../../shared/widgets/pec_avatar.dart';
import '../../../../shared/widgets/pec_badge.dart';
import '../../../../shared/widgets/pec_card.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  static final _scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authNotifierProvider).user;
    if (user == null) return const SizedBox.shrink();

    return Scaffold(
      key: _scaffoldKey,
      drawer: const AppDrawer(),
      appBar: _buildAppBar(context, user, ref),
      body: Stack(
        children: [
          RefreshIndicator(
            color: AppColors.yellow,
            onRefresh: () =>
                ref.read(authNotifierProvider.notifier).refreshUser(),
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(AppDimensions.md),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (user.isStudent) ...[
                    _StudentFirstLookSection(user: user),
                    const SizedBox(height: AppDimensions.lg),
                    const _EnrolledCoursesPreview(),
                    const SizedBox(height: AppDimensions.lg),
                    const _StudentAttendanceOverview(),
                  ],
                  if (user.isFaculty && !user.isAdmin) ...[
                    _GreetingCard(user: user),
                    const SizedBox(height: AppDimensions.lg),
                    _QuickActions(user: user),
                    const SizedBox(height: AppDimensions.lg),
                    _SectionHeader(title: 'TODAY\'S CLASSES'),
                    const SizedBox(height: AppDimensions.sm),
                    const _TimetablePreview(),
                    const SizedBox(height: AppDimensions.lg),
                    _SectionHeader(title: 'PENDING SESSIONS'),
                    const SizedBox(height: AppDimensions.sm),
                    const _PendingSessionsCard(),
                  ],
                  if (user.isAdmin) ...[
                    _GreetingCard(user: user),
                    const SizedBox(height: AppDimensions.lg),
                    _QuickActions(user: user),
                    const SizedBox(height: AppDimensions.lg),
                    _SectionHeader(title: 'QUICK STATS'),
                    const SizedBox(height: AppDimensions.sm),
                    const _AdminStatsGrid(),
                  ],
                  const SizedBox(height: AppDimensions.xxl),
                ],
              ),
            ),
          ),
          const _DraggableAIAssistantWidget(),
        ],
      ),
    );
  }

  AppBar _buildAppBar(BuildContext context, UserEntity user, WidgetRef ref) {
    final unread = ref.watch(unreadCountProvider);

    Widget iconBox({
      required Widget child,
      required VoidCallback onTap,
      Color bg = const Color(0xFF171717),
      Color border = const Color(0xFF2A2A2A),
      double size = 48,
    }) {
      return GestureDetector(
        onTap: onTap,
        child: Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            color: bg,
            border: Border.all(color: border),
            borderRadius: BorderRadius.circular(4),
          ),
          child: child,
        ),
      );
    }

    return AppBar(
      automaticallyImplyLeading: false,
      toolbarHeight: 76,
      backgroundColor: const Color(0xFF101010),
      titleSpacing: AppDimensions.md,
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(2),
        child: Container(
          height: 2,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                AppColors.yellow.withValues(alpha: 0.0),
                AppColors.yellow.withValues(alpha: 0.65),
                AppColors.yellow.withValues(alpha: 0.0),
              ],
            ),
          ),
        ),
      ),
      title: Row(
        children: [
          iconBox(
            onTap: () => _scaffoldKey.currentState?.openDrawer(),
            child: const Center(
              child: Icon(Icons.menu, size: 20, color: AppColors.white),
            ),
          ),
          const SizedBox(width: AppDimensions.sm),
          Container(
            width: 74,
            height: 48,
            decoration: BoxDecoration(
              color: const Color(0xFF151515),
              border: Border.all(color: const Color(0xFF2A2A2A)),
              borderRadius: BorderRadius.circular(4),
            ),
            alignment: Alignment.center,
            child: Image.asset(
              'assets/images/PECLogo.png',
              fit: BoxFit.contain,
            ),
          ),
          const SizedBox(width: AppDimensions.sm),
          Expanded(
            child: Container(
              height: 48,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                color: const Color(0xFF151515),
                border: Border.all(color: const Color(0xFF2A2A2A)),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Row(
                children: [
                  Icon(Icons.search,
                      size: 20, color: AppColors.white.withValues(alpha: 0.7)),
                  const SizedBox(width: AppDimensions.sm),
                  Text(
                    'Search...',
                    style: AppTextStyles.bodyMedium.copyWith(
                        color: AppColors.white.withValues(alpha: 0.75)),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: AppDimensions.sm),
          Stack(
            clipBehavior: Clip.none,
            children: [
              iconBox(
                onTap: () => context.push('/notifications'),
                child: const Center(
                  child: Icon(Icons.notifications_none,
                      size: 20, color: AppColors.white),
                ),
              ),
              if (unread > 0)
                Positioned(
                  right: 7,
                  top: 7,
                  child: Container(
                    width: 7,
                    height: 7,
                    decoration: const BoxDecoration(
                      color: AppColors.red,
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(width: AppDimensions.sm),
          iconBox(
            onTap: () => context.push('/profile'),
            bg: AppColors.yellow,
            border: AppColors.yellow,
            child: const Center(
              child:
                  Icon(Icons.person_outline, size: 22, color: AppColors.black),
            ),
          ),
        ],
      ),
    );
  }
}

class _DraggableAIAssistantWidget extends StatefulWidget {
  const _DraggableAIAssistantWidget();

  @override
  State<_DraggableAIAssistantWidget> createState() =>
      _DraggableAIAssistantWidgetState();
}

class _DraggableAIAssistantWidgetState
    extends State<_DraggableAIAssistantWidget> {
  static const double _size = 64;
  static const double _margin = 12;

  Offset? _position;

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      ignoring: false,
      child: LayoutBuilder(
        builder: (context, constraints) {
          final maxX = (constraints.maxWidth - _size - _margin)
              .clamp(_margin, double.infinity);
          final maxY = (constraints.maxHeight - _size - _margin)
              .clamp(_margin, double.infinity);

          final p = _position ?? Offset(maxX, maxY);
          final left = p.dx.clamp(_margin, maxX);
          final top = p.dy.clamp(_margin, maxY);

          return Stack(
            children: [
              Positioned(
                left: left,
                top: top,
                child: GestureDetector(
                  onPanUpdate: (details) {
                    setState(() {
                      _position = Offset(
                        (left + details.delta.dx).clamp(_margin, maxX),
                        (top + details.delta.dy).clamp(_margin, maxY),
                      );
                    });
                  },
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
                      borderRadius: BorderRadius.circular(8),
                      onTap: () {
                        showModalBottomSheet(
                          context: context,
                          isScrollControlled: true,
                          backgroundColor: Colors.transparent,
                          barrierColor: Colors.black.withValues(alpha: 0.6),
                          builder: (_) => const _AIChatPanel(),
                        );
                      },
                      child: Container(
                        width: _size,
                        height: _size,
                        decoration: BoxDecoration(
                          color: AppColors.yellow,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: AppColors.yellow.withValues(alpha: 0.9),
                          ),
                          boxShadow: const [
                            BoxShadow(
                              color: Color(0xFF141414),
                              offset: Offset(6, 6),
                              blurRadius: 0,
                            ),
                          ],
                        ),
                        child: const Icon(
                          Icons.smart_toy_outlined,
                          color: AppColors.black,
                          size: 28,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

// ── AI Chat Panel ─────────────────────────────────────────────────────────────

class _ChatMessage {
  final String text;
  final bool isUser;
  const _ChatMessage({required this.text, required this.isUser});
}

class _AIChatPanel extends StatefulWidget {
  const _AIChatPanel();

  @override
  State<_AIChatPanel> createState() => _AIChatPanelState();
}

class _AIChatPanelState extends State<_AIChatPanel> {
  final _scrollCtrl = ScrollController();
  final _inputCtrl = TextEditingController();
  final _focusNode = FocusNode();

  final List<_ChatMessage> _messages = [
    const _ChatMessage(
      text: "Hello! I'm your **PEC AI Assistant**. How can I help you today?",
      isUser: false,
    ),
  ];

  bool _isTyping = false;

  @override
  void dispose() {
    _scrollCtrl.dispose();
    _inputCtrl.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _send() {
    final text = _inputCtrl.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _messages.add(_ChatMessage(text: text, isUser: true));
      _inputCtrl.clear();
      _isTyping = true;
    });

    _scrollToBottom();

    // Simulated response delay — replace with real API call
    Future.delayed(const Duration(milliseconds: 1200), () {
      if (!mounted) return;
      setState(() {
        _isTyping = false;
        _messages.add(const _ChatMessage(
          text:
              "I'm connecting to the PEC backend. Full AI responses will be available once the backend link is active.",
          isUser: false,
        ));
      });
      _scrollToBottom();
    });
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(
          _scrollCtrl.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;
    final bottomPad = MediaQuery.of(context).padding.bottom;
    final screenH = MediaQuery.of(context).size.height;

    return Container(
      height: screenH * 0.82,
      decoration: const BoxDecoration(
        color: Color(0xFF0F0E09),
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
        border: Border(
          top: BorderSide(color: Color(0xFF2A2800), width: 1),
          left: BorderSide(color: Color(0xFF1E1E1E), width: 0.5),
          right: BorderSide(color: Color(0xFF1E1E1E), width: 0.5),
        ),
      ),
      child: Column(
        children: [
          // ── Drag handle ─────────────────────────────────────────────────
          const SizedBox(height: 10),
          Container(
            width: 36,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 10),

          // ── Header ──────────────────────────────────────────────────────
          Container(
            padding: const EdgeInsets.fromLTRB(16, 10, 16, 14),
            decoration: BoxDecoration(
              border: Border(
                bottom: BorderSide(
                  color: AppColors.yellow.withValues(alpha: 0.15),
                  width: 1,
                ),
              ),
            ),
            child: Row(
              children: [
                // Bot icon
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: AppColors.yellow,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(
                    Icons.smart_toy_outlined,
                    color: AppColors.black,
                    size: 22,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'PEC AI',
                        style: AppTextStyles.heading3.copyWith(
                          color: AppColors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Row(
                        children: [
                          Container(
                            width: 7,
                            height: 7,
                            decoration: const BoxDecoration(
                              color: Color(0xFF4ADE80),
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 5),
                          Text(
                            'SECURE BACKEND LINK',
                            style: AppTextStyles.labelSmall.copyWith(
                              color: Colors.white.withValues(alpha: 0.45),
                              fontSize: 10,
                              letterSpacing: 1.2,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                // Close button
                GestureDetector(
                  onTap: () => Navigator.of(context).pop(),
                  child: Container(
                    width: 34,
                    height: 34,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.06),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(
                        color: Colors.white.withValues(alpha: 0.10),
                        width: 0.8,
                      ),
                    ),
                    child: Icon(
                      Icons.close_rounded,
                      size: 18,
                      color: Colors.white.withValues(alpha: 0.6),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // ── Messages ─────────────────────────────────────────────────────
          Expanded(
            child: ListView.builder(
              controller: _scrollCtrl,
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
              itemCount: _messages.length + (_isTyping ? 1 : 0),
              itemBuilder: (_, i) {
                if (_isTyping && i == _messages.length) {
                  return const _TypingIndicator();
                }
                return _MessageBubble(msg: _messages[i]);
              },
            ),
          ),

          // ── Input bar ─────────────────────────────────────────────────────
          Container(
            margin: EdgeInsets.fromLTRB(
                12, 8, 12, bottomInset > 0 ? bottomInset + 8 : bottomPad + 16),
            decoration: BoxDecoration(
              color: const Color(0xFF1A1900),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(
                color: AppColors.yellow.withValues(alpha: 0.25),
                width: 1,
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _inputCtrl,
                    focusNode: _focusNode,
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: AppColors.white,
                      fontSize: 14,
                    ),
                    decoration: InputDecoration(
                      hintText: 'Ask me anything about PEC...',
                      hintStyle: AppTextStyles.bodyMedium.copyWith(
                        color: Colors.white.withValues(alpha: 0.30),
                        fontSize: 14,
                      ),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 14),
                    ),
                    onSubmitted: (_) => _send(),
                    textInputAction: TextInputAction.send,
                    maxLines: 3,
                    minLines: 1,
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: GestureDetector(
                    onTap: _send,
                    child: Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: AppColors.yellow,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(
                        Icons.send_rounded,
                        size: 18,
                        color: AppColors.black,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _MessageBubble extends StatelessWidget {
  final _ChatMessage msg;
  const _MessageBubble({required this.msg});

  @override
  Widget build(BuildContext context) {
    final isUser = msg.isUser;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment:
            isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!isUser) ...[
            Container(
              width: 28,
              height: 28,
              margin: const EdgeInsets.only(right: 8, bottom: 2),
              decoration: BoxDecoration(
                color: AppColors.yellow,
                borderRadius: BorderRadius.circular(6),
              ),
              child: const Icon(Icons.smart_toy_outlined,
                  size: 16, color: AppColors.black),
            ),
          ],
          Flexible(
            child: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
              decoration: BoxDecoration(
                color: isUser
                    ? AppColors.yellow.withValues(alpha: 0.14)
                    : const Color(0xFF1C1B10),
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(12),
                  topRight: const Radius.circular(12),
                  bottomLeft: Radius.circular(isUser ? 12 : 2),
                  bottomRight: Radius.circular(isUser ? 2 : 12),
                ),
                border: Border.all(
                  color: isUser
                      ? AppColors.yellow.withValues(alpha: 0.22)
                      : Colors.white.withValues(alpha: 0.07),
                  width: 0.8,
                ),
              ),
              child: _buildText(msg.text),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildText(String text) {
    // Simple bold markdown: **text**
    final spans = <TextSpan>[];
    final regex = RegExp(r'\*\*(.+?)\*\*');
    int last = 0;
    for (final match in regex.allMatches(text)) {
      if (match.start > last) {
        spans.add(TextSpan(
          text: text.substring(last, match.start),
          style: AppTextStyles.bodyMedium.copyWith(
            color: Colors.white.withValues(alpha: 0.85),
            fontSize: 14,
            height: 1.5,
          ),
        ));
      }
      spans.add(TextSpan(
        text: match.group(1),
        style: AppTextStyles.bodyMedium.copyWith(
          color: AppColors.white,
          fontSize: 14,
          fontWeight: FontWeight.w700,
          height: 1.5,
        ),
      ));
      last = match.end;
    }
    if (last < text.length) {
      spans.add(TextSpan(
        text: text.substring(last),
        style: AppTextStyles.bodyMedium.copyWith(
          color: Colors.white.withValues(alpha: 0.85),
          fontSize: 14,
          height: 1.5,
        ),
      ));
    }
    return RichText(text: TextSpan(children: spans));
  }
}

class _TypingIndicator extends StatefulWidget {
  const _TypingIndicator();

  @override
  State<_TypingIndicator> createState() => _TypingIndicatorState();
}

class _TypingIndicatorState extends State<_TypingIndicator>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..repeat();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Container(
            width: 28,
            height: 28,
            margin: const EdgeInsets.only(right: 8, bottom: 2),
            decoration: BoxDecoration(
              color: AppColors.yellow,
              borderRadius: BorderRadius.circular(6),
            ),
            child: const Icon(Icons.smart_toy_outlined,
                size: 16, color: AppColors.black),
          ),
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
            decoration: BoxDecoration(
              color: const Color(0xFF1C1B10),
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(12),
                topRight: Radius.circular(12),
                bottomRight: Radius.circular(12),
                bottomLeft: Radius.circular(2),
              ),
              border: Border.all(
                color: Colors.white.withValues(alpha: 0.07),
                width: 0.8,
              ),
            ),
            child: AnimatedBuilder(
              animation: _ctrl,
              builder: (_, __) {
                return Row(
                  mainAxisSize: MainAxisSize.min,
                  children: List.generate(3, (i) {
                    final delay = i / 3;
                    final v = math.sin(
                            (_ctrl.value - delay) * 2 * math.pi)
                        .clamp(0.0, 1.0);
                    return Container(
                      margin: const EdgeInsets.symmetric(horizontal: 2.5),
                      width: 6,
                      height: 6,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppColors.yellow
                            .withValues(alpha: 0.3 + v * 0.7),
                      ),
                    );
                  }),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _StudentFirstLookSection extends ConsumerWidget {
  final UserEntity user;
  const _StudentFirstLookSection({required this.user});

  String get _greeting {
    final h = DateTime.now().hour;
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final attendanceAsync = ref.watch(overallAttendanceProvider);
    final enrolledAsync = ref.watch(enrolledCoursesProvider);

    final attendancePct = attendanceAsync.maybeWhen(
      data: (stats) => (stats['pct'] as double?)?.round() ?? 0,
      orElse: () => 0,
    );

    final enrolledCount = enrolledAsync.maybeWhen(
      data: (items) => items.length,
      orElse: () => 0,
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(AppDimensions.lg),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: AppColors.yellow.withValues(alpha: 0.15)),
            gradient: LinearGradient(
              colors: [
                AppColors.yellow.withValues(alpha: 0.2),
                AppColors.yellow.withValues(alpha: 0.08),
                const Color(0xFF161616),
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
          child: Stack(
            children: [
              Positioned(
                right: 8,
                top: 8,
                child: Icon(
                  Icons.widgets_outlined,
                  size: 92,
                  color: AppColors.white.withValues(alpha: 0.07),
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.yellow.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      'Institutional Dashboard',
                      style: AppTextStyles.labelSmall.copyWith(
                        color: AppColors.yellow,
                        fontSize: 11,
                        letterSpacing: 0,
                      ),
                    ),
                  ),
                  const SizedBox(height: AppDimensions.md),
                  Text(
                    '$_greeting, ${user.name.trim().isEmpty ? 'Student' : user.name.trim().split(' ').first}!',
                    style: AppTextStyles.heading1.copyWith(
                      color: AppColors.white,
                      fontSize: 20,
                    ),
                  ),
                  const SizedBox(height: AppDimensions.sm),
                  Wrap(
                    spacing: 8,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    children: [
                      Text(
                        user.id,
                        style: AppTextStyles.labelLarge
                            .copyWith(color: AppColors.yellow, fontSize: 11),
                      ),
                      Container(
                          width: 4,
                          height: 4,
                          decoration: BoxDecoration(
                              color:
                                  AppColors.borderLight.withValues(alpha: 0.35),
                              shape: BoxShape.circle)),
                      Text(
                        user.department ?? 'Department',
                        style: AppTextStyles.bodyLarge.copyWith(
                            color: AppColors.white.withValues(alpha: 0.58),
                            fontSize: 12),
                      ),
                    ],
                  ),
                  Text(
                    'Semester ${user.semester ?? 1}',
                    style: AppTextStyles.bodyLarge.copyWith(
                        color: AppColors.white.withValues(alpha: 0.74),
                        fontSize: 12),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: AppDimensions.lg),
        _StudentPrimaryCard(
          accent: AppColors.green,
          icon: Icons.fact_check_outlined,
          title: 'ATTENDANCE',
          value: '$attendancePct%',
          onTap: () => context.go('/attendance'),
        ),
        const SizedBox(height: AppDimensions.md),
        _StudentPrimaryCard(
          accent: AppColors.yellow,
          icon: Icons.menu_book_outlined,
          title: 'ENROLLED',
          value: '$enrolledCount',
          onTap: () => context.go('/courses'),
        ),
        const SizedBox(height: AppDimensions.md),
        _StudentPrimaryCard(
          accent: AppColors.yellow,
          icon: Icons.school_outlined,
          title: 'SCORE SHEET',
          value: 'VIEW',
          onTap: () => context.go('/score-sheet'),
        ),
      ],
    );
  }
}

class _StudentPrimaryCard extends StatelessWidget {
  final Color accent;
  final IconData icon;
  final String title;
  final String value;
  final bool showBadge;
  final IconData? trailingIcon;
  final VoidCallback onTap;

  const _StudentPrimaryCard({
    required this.accent,
    required this.icon,
    required this.title,
    required this.value,
    required this.onTap,
    this.showBadge = false,
    this.trailingIcon,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(0),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(
            horizontal: AppDimensions.md, vertical: AppDimensions.md),
        decoration: BoxDecoration(
          color: AppColors.bgSurfaceDark.withValues(alpha: 0.78),
          border:
              Border.all(color: AppColors.borderLight.withValues(alpha: 0.15)),
          gradient: LinearGradient(
            begin: Alignment.centerLeft,
            end: Alignment.centerRight,
            colors: [
              accent.withValues(alpha: 0.08),
              AppColors.bgSurfaceDark.withValues(alpha: 0.9),
            ],
          ),
        ),
        child: Row(
          children: [
            Container(width: 4, height: 74, color: accent),
            const SizedBox(width: AppDimensions.md),
            Stack(
              clipBehavior: Clip.none,
              children: [
                Container(
                  width: 54,
                  height: 54,
                  decoration: BoxDecoration(
                    color: accent.withValues(alpha: 0.18),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(icon, color: accent, size: 28),
                ),
                if (showBadge)
                  Positioned(
                    right: -8,
                    top: -8,
                    child: Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: AppColors.red,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.black, width: 1),
                      ),
                      child: Center(
                        child: Text('N',
                            style: AppTextStyles.labelLarge
                                .copyWith(color: AppColors.white)),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(width: AppDimensions.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: AppTextStyles.labelSmall.copyWith(
                      color: AppColors.white.withValues(alpha: 0.65),
                      letterSpacing: 2,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    value,
                    style:
                        AppTextStyles.heading2.copyWith(color: AppColors.white),
                  ),
                ],
              ),
            ),
            if (trailingIcon != null)
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: AppColors.yellow,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(trailingIcon, color: AppColors.black, size: 30),
              ),
          ],
        ),
      ),
    );
  }
}

// ── Greeting ──────────────────────────────────────────────────────────────
class _GreetingCard extends StatelessWidget {
  final UserEntity user;
  const _GreetingCard({required this.user});

  String get _greeting {
    final h = DateTime.now().hour;
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  @override
  Widget build(BuildContext context) {
    return PecCard(
      color: AppColors.yellow,
      shadowColor: AppColors.black,
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '$_greeting,',
                  style: AppTextStyles.bodyMedium
                      .copyWith(color: AppColors.black.withValues(alpha: 0.7)),
                ),
                const SizedBox(height: 2),
                Text(
                  user.name.isEmpty ? user.email : user.name,
                  style:
                      AppTextStyles.heading2.copyWith(color: AppColors.black),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: AppDimensions.sm),
                PecBadge(
                  label: user.primaryRole.displayName,
                  color: AppColors.black,
                  textColor: AppColors.yellow,
                ),
              ],
            ),
          ),
          PecAvatar(
            name: user.name,
            imageUrl: user.avatarUrl,
            size: AppDimensions.avatarLg,
          ),
        ],
      ),
    );
  }
}

// ── Quick Actions ─────────────────────────────────────────────────────────
class _QuickActions extends StatelessWidget {
  final UserEntity user;
  const _QuickActions({required this.user});

  @override
  Widget build(BuildContext context) {
    final actions = <_Action>[
      if (user.isFaculty && !user.isAdmin)
        _Action('Generate QR', Icons.qr_code, AppColors.green,
            '/attendance/generate'),
      _Action('Courses', Icons.book_outlined, AppColors.blue, '/courses'),
      _Action('Chat', Icons.chat_bubble_outline, AppColors.yellow, '/chat'),
      _Action(
          'Notices', Icons.campaign_outlined, AppColors.red, '/noticeboard'),
      if (user.isStudent)
        _Action(
            'Timetable', Icons.schedule_outlined, AppColors.blue, '/timetable'),
      if (user.isAdmin)
        _Action('Users', Icons.people_outline, AppColors.red, '/users'),
    ];

    return GridView.count(
      crossAxisCount: 4,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: AppDimensions.sm,
      mainAxisSpacing: AppDimensions.sm,
      childAspectRatio: 0.85,
      children: actions.take(4).map((a) => _ActionTile(action: a)).toList(),
    );
  }
}

class _Action {
  final String label;
  final IconData icon;
  final Color color;
  final String route;
  const _Action(this.label, this.icon, this.color, this.route);
}

class _ActionTile extends StatelessWidget {
  final _Action action;
  const _ActionTile({required this.action});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.go(action.route),
      child: Container(
        decoration: BoxDecoration(
          color: action.color,
          border: Border.all(
              color: AppColors.black, width: AppDimensions.borderWidth),
          boxShadow: const [
            BoxShadow(
              offset: Offset(4, 4),
              color: AppColors.black,
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(action.icon,
                color: AppColors.black, size: AppDimensions.iconLg),
            const SizedBox(height: AppDimensions.xs),
            Text(
              action.label,
              style: AppTextStyles.labelSmall
                  .copyWith(color: AppColors.black, fontSize: 10),
              textAlign: TextAlign.center,
              maxLines: 2,
            ),
          ],
        ),
      ),
    );
  }
}

// ── Section header ────────────────────────────────────────────────────────
class _SectionHeader extends StatelessWidget {
  final String title;
  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(width: 4, height: 20, color: AppColors.yellow),
        const SizedBox(width: AppDimensions.sm),
        Text(title, style: AppTextStyles.labelLarge),
      ],
    );
  }
}

class _EnrolledCoursesPreview extends ConsumerWidget {
  const _EnrolledCoursesPreview();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final enrolledAsync = ref.watch(enrolledCoursesProvider);

    final courses = enrolledAsync.when(
      loading: () => const <_CoursePreviewItem>[],
      error: (_, __) => _demoEnrolledCourses,
      data: (enrollments) {
        if (enrollments.isEmpty) return _demoEnrolledCourses;
        return enrollments
            .map(
              (e) => _CoursePreviewItem(
                courseId: e.courseId,
                code: e.courseCode,
                title: e.courseName,
                credits: _guessCredits(e.courseCode, e.courseName),
                semester: e.semester,
              ),
            )
            .toList();
      },
    );

    final shown = courses.take(4).toList();
    final extra = courses.length - shown.length;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 220),
      width: double.infinity,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(0),
        border: Border.all(color: AppColors.yellow.withValues(alpha: 0.24), width: 1),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            const Color(0xFF201A0F),
            const Color(0xFF17140E),
            const Color(0xFF13110D),
          ],
          stops: const [0.0, 0.52, 1.0],
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(18, 18, 18, 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  Icons.menu_book_outlined,
                  size: 20,
                  color: AppColors.yellow.withValues(alpha: 0.65),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'My Enrolled Courses',
                    style: AppTextStyles.heading3.copyWith(
                      color: AppColors.white.withValues(alpha: 0.92),
                      fontSize: 37 / 2,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
                GestureDetector(
                  onTap: () => context.go('/courses'),
                  child: Row(
                    children: [
                      Text(
                        'View All',
                        style: AppTextStyles.labelLarge.copyWith(
                          color: AppColors.white.withValues(alpha: 0.92),
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Icon(
                        Icons.north_east,
                        size: 15,
                        color: AppColors.white.withValues(alpha: 0.92),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (shown.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 32),
                child: Center(
                  child: CircularProgressIndicator(
                    color: AppColors.yellow,
                    strokeWidth: 2,
                  ),
                ),
              )
            else
              LayoutBuilder(
                builder: (context, constraints) {
                  final compact = constraints.maxWidth < 620;
                  return GridView.builder(
                    itemCount: shown.length,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      mainAxisSpacing: compact ? 10 : 12,
                      crossAxisSpacing: compact ? 10 : 14,
                      childAspectRatio: compact ? 1.55 : 1.85,
                    ),
                    itemBuilder: (_, i) => _EnrolledMiniCard(entry: shown[i]),
                  );
                },
              ),
            if (extra > 0) ...[
              const SizedBox(height: 14),
              Center(
                child: Text(
                  '+$extra more courses',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: AppColors.white.withValues(alpha: 0.72),
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _EnrolledMiniCard extends StatelessWidget {
  final _CoursePreviewItem entry;
  const _EnrolledMiniCard({required this.entry});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.push('/courses/${entry.courseId}'),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final compact = constraints.maxHeight < 136 || constraints.maxWidth < 180;

          return Container(
            padding: EdgeInsets.fromLTRB(
              compact ? 12 : 16,
              compact ? 10 : 13,
              compact ? 10 : 14,
              compact ? 8 : 10,
            ),
            decoration: BoxDecoration(
              color: const Color(0xFF1F1B14),
              border: Border.all(
                color: AppColors.yellow.withValues(alpha: 0.22),
                width: 1,
              ),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: compact ? 8 : 10,
                    vertical: compact ? 3 : 4,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFF201D16),
                    border: Border.all(
                      color: AppColors.yellow.withValues(alpha: 0.30),
                      width: 1,
                    ),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    entry.code,
                    style: AppTextStyles.labelSmall.copyWith(
                      color: AppColors.white.withValues(alpha: 0.9),
                      fontSize: compact ? 11 : 13,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0,
                    ),
                  ),
                ),
                SizedBox(height: compact ? 6 : 8),
                Expanded(
                  child: Align(
                    alignment: Alignment.topLeft,
                    child: Text(
                      entry.title,
                      maxLines: compact ? 1 : 2,
                      overflow: TextOverflow.ellipsis,
                      style: AppTextStyles.heading3.copyWith(
                        color: AppColors.white.withValues(alpha: 0.95),
                        fontSize: compact ? 14 : 17,
                        fontWeight: FontWeight.w700,
                        height: 1.15,
                      ),
                    ),
                  ),
                ),
                Row(
                  children: [
                    Text(
                      '${entry.credits} CREDITS',
                      style: AppTextStyles.labelSmall.copyWith(
                        color: AppColors.white.withValues(alpha: 0.64),
                        fontSize: compact ? 9.5 : 11,
                        letterSpacing: 0.3,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const Spacer(),
                    Text(
                      'SEM ${entry.semester ?? '--'}',
                      style: AppTextStyles.labelSmall.copyWith(
                        color: AppColors.white.withValues(alpha: 0.64),
                        fontSize: compact ? 9.5 : 11,
                        letterSpacing: 0.3,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _StudentAttendanceOverview extends ConsumerWidget {
  const _StudentAttendanceOverview();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final attendanceAsync = ref.watch(overallAttendanceProvider);

    final stats = attendanceAsync.maybeWhen(
      data: (s) => s,
      orElse: () => <String, dynamic>{'present': 0, 'absent': 0, 'pct': 83.0},
    );

    final present = (stats['present'] as int?) ?? 0;
    final absent = (stats['absent'] as int?) ?? 0;
    final pct = ((stats['pct'] as double?) ?? 83.0).clamp(0.0, 100.0);
    final total = present + absent;

    const target = 75.0;
    const milestone = 90.0;

    final neededPct = (target - pct).clamp(0.0, 100.0);
    final statusLabel = pct >= target ? 'On Track' : 'Needs Focus';
    final chipLabel = pct >= target ? 'ON TRACK' : 'BELOW TARGET';

    int requiredClasses = 0;
    if (pct < target && total > 0) {
      final needed = ((target / 100.0) * total - present) / (1 - target / 100.0);
      requiredClasses = needed.ceil().clamp(0, 999);
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppDimensions.lg),
      decoration: BoxDecoration(
        border: Border.all(color: AppColors.yellow.withValues(alpha: 0.2)),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFF1F1A10),
            Color(0xFF18140E),
            Color(0xFF13110C),
          ],
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.assignment_turned_in_outlined,
                  size: 21, color: const Color(0xFF21CDA1)),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  'Attendance Overview',
                  style: AppTextStyles.heading3.copyWith(
                    color: AppColors.white,
                    fontSize: 38 / 2,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                decoration: BoxDecoration(
                  color: const Color(0xFF123C34),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: const Color(0xFF1F9F80)),
                ),
                child: Text(
                  chipLabel,
                  style: AppTextStyles.labelSmall.copyWith(
                    color: const Color(0xFF21CDA1),
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.3,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppDimensions.lg),
          Center(
            child: SizedBox(
              width: 170,
              height: 170,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  SizedBox(
                    width: 130,
                    height: 130,
                    child: CircularProgressIndicator(
                      value: pct / 100,
                      strokeWidth: 11,
                      backgroundColor: const Color(0xFF2C2519),
                      valueColor:
                          const AlwaysStoppedAnimation<Color>(Color(0xFF21CDA1)),
                    ),
                  ),
                  Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        '${pct.round()}%',
                        style: AppTextStyles.heading1.copyWith(
                          color: AppColors.white,
                          fontSize: 54 / 2,
                        ),
                      ),
                      Text(
                        'PRESENT',
                        style: AppTextStyles.labelSmall.copyWith(
                          color: AppColors.white.withValues(alpha: 0.6),
                          fontSize: 11,
                          letterSpacing: 0.8,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: AppDimensions.lg),
          Row(
            children: [
              Text(
                'TARGET ${target.toInt()}%',
                style: AppTextStyles.labelSmall.copyWith(
                  color: AppColors.white.withValues(alpha: 0.62),
                  fontSize: 11,
                ),
              ),
              const Spacer(),
              Text(
                pct >= target ? 'GOAL MET' : 'GOAL PENDING',
                style: AppTextStyles.labelSmall.copyWith(
                  color: AppColors.white.withValues(alpha: 0.62),
                  fontSize: 11,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(5),
            child: SizedBox(
              height: 10,
              child: Stack(
                children: [
                  Container(color: const Color(0xFF2C2519)),
                  FractionallySizedBox(
                    widthFactor: pct / 100,
                    child: Container(color: const Color(0xFF21CDA1)),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: Text(
                  '60% WARNING',
                  style: AppTextStyles.labelSmall.copyWith(
                    color: AppColors.white.withValues(alpha: 0.56),
                    fontSize: 11,
                  ),
                ),
              ),
              Expanded(
                child: Text(
                  '75% SAFE',
                  textAlign: TextAlign.center,
                  style: AppTextStyles.labelSmall.copyWith(
                    color: AppColors.white.withValues(alpha: 0.56),
                    fontSize: 11,
                  ),
                ),
              ),
              Expanded(
                child: Text(
                  '90% GREAT',
                  textAlign: TextAlign.right,
                  style: AppTextStyles.labelSmall.copyWith(
                    color: AppColors.white.withValues(alpha: 0.56),
                    fontSize: 11,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppDimensions.md),
          Row(
            children: [
              Expanded(
                child: _AttendanceMetricTile(
                  title: 'REQUIRED',
                  value: requiredClasses == 0
                      ? '${neededPct.round()}% needed'
                      : '$requiredClasses classes',
                ),
              ),
              const SizedBox(width: AppDimensions.sm),
              Expanded(
                child: _AttendanceMetricTile(
                  title: 'STATUS',
                  value: statusLabel,
                ),
              ),
              const SizedBox(width: AppDimensions.sm),
              Expanded(
                child: _AttendanceMetricTile(
                  title: 'NEXT MILESTONE',
                  value: pct >= milestone ? 'Great Work' : 'Reach ${milestone.toInt()}%',
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _AttendanceMetricTile extends StatelessWidget {
  final String title;
  final String value;

  const _AttendanceMetricTile({required this.title, required this.value});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 86,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF1C1712),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: AppColors.yellow.withValues(alpha: 0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: AppTextStyles.labelSmall.copyWith(
              color: AppColors.white.withValues(alpha: 0.55),
              fontSize: 11,
              letterSpacing: 0.8,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            value,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: AppTextStyles.heading3.copyWith(
              color: AppColors.white,
              fontSize: 32 / 2,
              height: 1.2,
            ),
          ),
        ],
      ),
    );
  }
}

class _CoursePreviewItem {
  final String courseId;
  final String code;
  final String title;
  final int credits;
  final int? semester;

  const _CoursePreviewItem({
    required this.courseId,
    required this.code,
    required this.title,
    required this.credits,
    this.semester,
  });
}

int _guessCredits(String code, String title) {
  final upperCode = code.toUpperCase();
  final upperTitle = title.toUpperCase();
  if (upperCode.contains('DS101') || upperCode.contains('DS102')) return 4;
  if (upperTitle.contains('MATHEMATICS') || upperTitle.contains('PHYSICS')) {
    return 4;
  }
  return 3;
}

const List<_CoursePreviewItem> _demoEnrolledCourses = [
  _CoursePreviewItem(
    courseId: 'demo-ds101',
    code: 'DS101',
    title: 'Engineering Mathematics I',
    credits: 4,
    semester: 1,
  ),
  _CoursePreviewItem(
    courseId: 'demo-ds102',
    code: 'DS102',
    title: 'Applied Physics',
    credits: 4,
    semester: 1,
  ),
  _CoursePreviewItem(
    courseId: 'demo-ds103',
    code: 'DS103',
    title: 'Programming for Problem Solving',
    credits: 3,
    semester: 1,
  ),
  _CoursePreviewItem(
    courseId: 'demo-ds104',
    code: 'DS104',
    title: 'Basic Electrical & Electronics',
    credits: 3,
    semester: 1,
  ),
  _CoursePreviewItem(
    courseId: 'demo-ds105',
    code: 'DS105',
    title: 'Engineering Graphics',
    credits: 3,
    semester: 1,
  ),
  _CoursePreviewItem(
    courseId: 'demo-ds106',
    code: 'DS106',
    title: 'Workshop Practice',
    credits: 2,
    semester: 1,
  ),
  _CoursePreviewItem(
    courseId: 'demo-ds107',
    code: 'DS107',
    title: 'Communication Skills',
    credits: 2,
    semester: 1,
  ),
  _CoursePreviewItem(
    courseId: 'demo-ds108',
    code: 'DS108',
    title: 'Environmental Studies',
    credits: 2,
    semester: 1,
  ),
];

// ── Timetable preview (real data) ────────────────────────────────────────
class _TimetablePreview extends ConsumerWidget {
  const _TimetablePreview();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final todayAsync = ref.watch(todayTimetableProvider);
    return todayAsync.when(
      loading: () => PecCard(
        color: AppColors.bgSurface,
        child: const Center(
            child: CircularProgressIndicator(color: AppColors.yellow)),
      ),
      error: (_, __) => PecCard(
        child: Text('Could not load timetable',
            style: AppTextStyles.bodySmall
                .copyWith(color: AppColors.textSecondary)),
      ),
      data: (entries) {
        if (entries.isEmpty) {
          return PecCard(
            color: AppColors.bgSurface,
            child: Row(
              children: [
                Container(width: 4, height: 40, color: AppColors.yellow),
                const SizedBox(width: AppDimensions.sm),
                Text('No classes today',
                    style: AppTextStyles.bodySmall
                        .copyWith(color: AppColors.textSecondary)),
              ],
            ),
          );
        }
        final shown = entries.take(3).toList();
        return PecCard(
          color: AppColors.bgSurface,
          child: Column(
            children: [
              for (final e in shown)
                Padding(
                  padding: const EdgeInsets.only(bottom: AppDimensions.sm),
                  child: Row(
                    children: [
                      Container(
                        width: 52,
                        padding: const EdgeInsets.all(AppDimensions.xs),
                        color: _isLive(e) ? AppColors.yellow : AppColors.black,
                        child: Text(
                          e.startTime,
                          style: AppTextStyles.labelSmall.copyWith(
                              color: _isLive(e)
                                  ? AppColors.black
                                  : AppColors.white,
                              fontSize: 9),
                          textAlign: TextAlign.center,
                        ),
                      ),
                      const SizedBox(width: AppDimensions.sm),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(e.courseName,
                                style: AppTextStyles.labelSmall,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis),
                            if (e.room != null)
                              Text(e.room!, style: AppTextStyles.caption),
                          ],
                        ),
                      ),
                      if (_isLive(e))
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 4, vertical: 1),
                          color: AppColors.green,
                          child: Text('LIVE',
                              style: AppTextStyles.labelSmall.copyWith(
                                  color: AppColors.black, fontSize: 8)),
                        ),
                    ],
                  ),
                ),
              if (entries.length > 3)
                Text('+${entries.length - 3} more',
                    style: AppTextStyles.caption
                        .copyWith(color: AppColors.textSecondary)),
            ],
          ),
        );
      },
    );
  }

  bool _isLive(TimetableEntry e) {
    final now = DateTime.now();
    final nowMins = now.hour * 60 + now.minute;
    return nowMins >= e.startMinutes && nowMins < e.startMinutes + 60;
  }
}

// ── Attendance summary (real data) ────────────────────────────────────────
class _AttendanceSummary extends ConsumerWidget {
  const _AttendanceSummary();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statsAsync = ref.watch(overallAttendanceProvider);
    return statsAsync.when(
      loading: () => PecCard(
        child: const Center(
            child: CircularProgressIndicator(color: AppColors.yellow)),
      ),
      error: (_, __) => PecCard(
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _StatPill(label: 'PRESENT', value: '--', color: AppColors.green),
            _StatPill(label: 'ABSENT', value: '--', color: AppColors.red),
            _StatPill(label: 'OVERALL', value: '--%', color: AppColors.blue),
          ],
        ),
      ),
      data: (stats) {
        final pct = (stats['pct'] as double).toStringAsFixed(1);
        return PecCard(
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _StatPill(
                  label: 'PRESENT',
                  value: '${stats['present']}',
                  color: AppColors.green),
              _StatPill(
                  label: 'ABSENT',
                  value: '${stats['absent']}',
                  color: AppColors.red),
              _StatPill(
                  label: 'OVERALL',
                  value: '$pct%',
                  color: (stats['pct'] as double) >= 75
                      ? AppColors.green
                      : AppColors.red),
            ],
          ),
        );
      },
    );
  }
}

class _StatPill extends StatelessWidget {
  final String label;
  final String value;
  final Color color;
  const _StatPill(
      {required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: AppTextStyles.heading2.copyWith(color: color)),
        const SizedBox(height: AppDimensions.xs),
        Text(label, style: AppTextStyles.labelSmall),
      ],
    );
  }
}

// ── Pending attendance sessions (faculty) ────────────────────────────────
class _PendingSessionsCard extends StatelessWidget {
  const _PendingSessionsCard();

  @override
  Widget build(BuildContext context) {
    return PecCard(
      child: Text(
        '— Connect backend to load pending sessions —',
        style: AppTextStyles.bodySmall,
      ),
    );
  }
}

// ── Admin stats grid ─────────────────────────────────────────────────────
class _AdminStatsGrid extends StatelessWidget {
  const _AdminStatsGrid();

  @override
  Widget build(BuildContext context) {
    final stats = [
      _Stat('TOTAL USERS', '--', AppColors.yellow),
      _Stat('ACTIVE TODAY', '--', AppColors.green),
      _Stat('COURSES', '--', AppColors.blue),
      _Stat('DEPARTMENTS', '--', AppColors.red),
    ];
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: AppDimensions.sm,
      mainAxisSpacing: AppDimensions.sm,
      childAspectRatio: 2,
      children: stats.map((s) => _AdminStatTile(stat: s)).toList(),
    );
  }
}

class _Stat {
  final String label;
  final String value;
  final Color color;
  const _Stat(this.label, this.value, this.color);
}

class _AdminStatTile extends StatelessWidget {
  final _Stat stat;
  const _AdminStatTile({required this.stat});

  @override
  Widget build(BuildContext context) {
    return PecCard(
      color: stat.color,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(stat.value,
              style: AppTextStyles.heading2.copyWith(color: AppColors.black)),
          Text(stat.label,
              style: AppTextStyles.labelSmall
                  .copyWith(color: AppColors.black, fontSize: 9)),
        ],
      ),
    );
  }
}

// ── Student timetable preview ─────────────────────────────────────────────
class _StudentTimetablePreview extends ConsumerWidget {
  const _StudentTimetablePreview();

  bool _isLive(TimetableEntry e) {
    final now = DateTime.now();
    final nowMins = now.hour * 60 + now.minute;
    return nowMins >= e.startMinutes && nowMins < e.startMinutes + 60;
  }

  bool _isPast(TimetableEntry e) {
    final parts = e.endTime.split(':');
    final endMins = int.parse(parts[0]) * 60 + int.parse(parts[1]);
    final now = DateTime.now();
    return now.hour * 60 + now.minute >= endMins;
  }

  String _dayLabel(List<TimetableEntry> entries) {
    if (entries.isNotEmpty && entries.first.dayOfWeek.trim().isNotEmpty) {
      return entries.first.dayOfWeek.trim();
    }
    switch (DateTime.now().weekday) {
      case DateTime.monday:
        return 'Monday';
      case DateTime.tuesday:
        return 'Tuesday';
      case DateTime.wednesday:
        return 'Wednesday';
      case DateTime.thursday:
        return 'Thursday';
      case DateTime.friday:
        return 'Friday';
      case DateTime.saturday:
        return 'Saturday';
      default:
        return 'Today';
    }
  }

  Widget _shell({required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppDimensions.md),
      decoration: BoxDecoration(
        border: Border.all(color: AppColors.yellow.withValues(alpha: 0.16)),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.yellow.withValues(alpha: 0.12),
            AppColors.bgSurfaceDark.withValues(alpha: 0.96),
          ],
        ),
      ),
      child: child,
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final todayAsync = ref.watch(todayTimetableProvider);
    return todayAsync.when(
      loading: () => _shell(
        child: const Center(
          child: Padding(
            padding: EdgeInsets.symmetric(vertical: AppDimensions.lg),
            child: CircularProgressIndicator(color: AppColors.yellow),
          ),
        ),
      ),
      error: (_, __) => _shell(
        child: Text(
          'Could not load schedule',
          style:
              AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary),
        ),
      ),
      data: (entries) {
        final sorted = [...entries]
          ..sort((a, b) => a.startMinutes.compareTo(b.startMinutes));
        final dayLabel = _dayLabel(sorted);

        if (entries.isEmpty) {
          return _shell(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.calendar_today_outlined,
                        color: AppColors.yellow, size: 20),
                    const SizedBox(width: AppDimensions.sm),
                    Expanded(
                      child: Text(
                        '$dayLabel\'s Schedule',
                        style: AppTextStyles.heading3
                            .copyWith(color: AppColors.white),
                      ),
                    ),
                    GestureDetector(
                      onTap: () => context.go('/timetable'),
                      child: Row(
                        children: [
                          Text(
                            'Full',
                            style: AppTextStyles.labelLarge
                                .copyWith(color: AppColors.white),
                          ),
                          const SizedBox(width: 2),
                          const Icon(Icons.north_east,
                              color: AppColors.white, size: 16),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppDimensions.md),
                Text(
                  'No classes scheduled for today.',
                  style: AppTextStyles.bodySmall
                      .copyWith(color: AppColors.textSecondary),
                ),
              ],
            ),
          );
        }

        return _shell(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(Icons.calendar_today_outlined,
                      color: AppColors.yellow, size: 20),
                  const SizedBox(width: AppDimensions.sm),
                  Expanded(
                    child: Text(
                      '$dayLabel\'s Schedule',
                      style: AppTextStyles.heading3
                          .copyWith(color: AppColors.white),
                    ),
                  ),
                  GestureDetector(
                    onTap: () => context.go('/timetable'),
                    child: Row(
                      children: [
                        Text(
                          'Full',
                          style: AppTextStyles.labelLarge
                              .copyWith(color: AppColors.white),
                        ),
                        const SizedBox(width: 2),
                        const Icon(Icons.north_east,
                            color: AppColors.white, size: 16),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppDimensions.md),
              Container(
                height: 340,
                padding: const EdgeInsets.all(AppDimensions.sm),
                decoration: BoxDecoration(
                  border: Border.all(
                      color: AppColors.borderLight.withValues(alpha: 0.2)),
                  color: AppColors.black.withValues(alpha: 0.25),
                ),
                child: Scrollbar(
                  thumbVisibility: true,
                  child: ListView.separated(
                    itemCount: sorted.length,
                    separatorBuilder: (_, __) =>
                        const SizedBox(height: AppDimensions.sm),
                    itemBuilder: (_, i) {
                      final e = sorted[i];
                      return _ScheduleClassCard(
                        entry: e,
                        isLive: _isLive(e),
                        isPast: _isPast(e),
                      );
                    },
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _ScheduleClassCard extends StatelessWidget {
  final TimetableEntry entry;
  final bool isLive;
  final bool isPast;
  const _ScheduleClassCard(
      {required this.entry, required this.isLive, required this.isPast});

  String get _timeText => '${entry.startTime} - ${entry.endTime}';

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppDimensions.md),
      decoration: BoxDecoration(
        color: AppColors.bgSurfaceDark.withValues(alpha: 0.55),
        border: Border.all(
          color: isLive
              ? AppColors.yellow
              : AppColors.borderLight.withValues(alpha: 0.2),
          width: isLive ? 1.3 : 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Row(
                  children: [
                    Text(
                      entry.courseCode,
                      style: AppTextStyles.heading3.copyWith(
                        color: AppColors.white,
                        fontSize: 30,
                        decoration: isPast ? TextDecoration.lineThrough : null,
                      ),
                    ),
                    const SizedBox(width: AppDimensions.sm),
                    Container(
                      width: 1,
                      height: 20,
                      color: AppColors.borderLight.withValues(alpha: 0.35),
                    ),
                    const SizedBox(width: AppDimensions.sm),
                    Expanded(
                      child: Text(
                        entry.courseName,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: AppTextStyles.bodyLarge.copyWith(
                          color: AppColors.white.withValues(alpha: 0.78),
                          decoration:
                              isPast ? TextDecoration.lineThrough : null,
                        ),
                      ),
                    ),
                    if (isLive) ...[
                      const SizedBox(width: AppDimensions.sm),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.yellow,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          'LIVE',
                          style: AppTextStyles.labelSmall.copyWith(
                            color: AppColors.black,
                            fontSize: 9,
                            letterSpacing: 0,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(width: AppDimensions.sm),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppDimensions.sm,
                  vertical: AppDimensions.xs,
                ),
                decoration: BoxDecoration(
                  color: AppColors.black.withValues(alpha: 0.55),
                  border: Border.all(
                    color: isLive
                        ? AppColors.yellow.withValues(alpha: 0.8)
                        : AppColors.borderLight.withValues(alpha: 0.2),
                  ),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  _timeText,
                  style: AppTextStyles.labelLarge.copyWith(
                    color: isLive
                        ? AppColors.yellow
                        : AppColors.white.withValues(alpha: 0.9),
                    fontSize: 12,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppDimensions.sm),
          Row(
            children: [
              Icon(Icons.person_outline,
                  color: AppColors.white.withValues(alpha: 0.7), size: 15),
              const SizedBox(width: AppDimensions.xs),
              Expanded(
                child: Text(
                  entry.facultyName == null || entry.facultyName!.trim().isEmpty
                      ? 'Faculty TBA'
                      : entry.facultyName!,
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: AppColors.white.withValues(alpha: 0.72),
                    fontSize: 15,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppDimensions.xs),
          Row(
            children: [
              Icon(Icons.location_on_outlined,
                  color: AppColors.white.withValues(alpha: 0.7), size: 15),
              const SizedBox(width: AppDimensions.xs),
              Text(
                entry.room == null || entry.room!.trim().isEmpty
                    ? 'Room TBA'
                    : entry.room!,
                style: AppTextStyles.bodyMedium.copyWith(
                  color: AppColors.white.withValues(alpha: 0.72),
                  fontSize: 15,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ── Recent notices (real data) ────────────────────────────────────────────
class _RecentNotices extends ConsumerWidget {
  const _RecentNotices();

  Widget _shell({required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppDimensions.md),
      decoration: BoxDecoration(
        border: Border.all(color: AppColors.yellow.withValues(alpha: 0.16)),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.yellow.withValues(alpha: 0.1),
            AppColors.bgSurfaceDark.withValues(alpha: 0.96),
          ],
        ),
      ),
      child: child,
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final noticesAsync = ref.watch(noticesProvider);
    return noticesAsync.when(
      loading: () => _shell(
        child: const Center(
          child: Padding(
            padding: EdgeInsets.symmetric(vertical: AppDimensions.md),
            child: CircularProgressIndicator(color: AppColors.yellow),
          ),
        ),
      ),
      error: (_, __) => const SizedBox.shrink(),
      data: (notices) {
        if (notices.isEmpty) {
          return const SizedBox.shrink();
        }
        final shown = notices.take(3).toList();
        return _shell(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              for (final n in shown)
                Padding(
                  padding: const EdgeInsets.only(bottom: AppDimensions.sm),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                          width: 8,
                          height: 8,
                          margin: const EdgeInsets.only(top: 4),
                          color: n.dotColor),
                      const SizedBox(width: AppDimensions.sm),
                      Expanded(
                        child: Text(
                          n.title,
                          style: AppTextStyles.bodySmall.copyWith(
                              color: AppColors.white.withValues(alpha: 0.82),
                              fontSize: 15,
                              height: 1.2),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
              GestureDetector(
                onTap: () => context.push('/noticeboard'),
                child: Text(
                  notices.length > 3
                      ? 'View all ${notices.length} notices →'
                      : 'View noticeboard →',
                  style: AppTextStyles.labelSmall.copyWith(
                      color: AppColors.yellow,
                      fontSize: 12,
                      letterSpacing: 0.2),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
