import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/widgets/pec_avatar.dart';
import '../../../../shared/widgets/pec_card.dart';
import '../../../../shared/widgets/pec_empty_state.dart';
import '../../../../shared/widgets/pec_error_state.dart';
import '../../../../shared/widgets/pec_shimmer.dart';
import '../../data/models/chat_models.dart';
import '../providers/chat_provider.dart';

class ChatListScreen extends ConsumerStatefulWidget {
  const ChatListScreen({super.key});

  @override
  ConsumerState<ChatListScreen> createState() => _ChatListScreenState();
}

class _ChatListScreenState extends ConsumerState<ChatListScreen> {
  String _search = '';

  @override
  Widget build(BuildContext context) {
    final roomsAsync = ref.watch(chatRoomsProvider);

    return Scaffold(
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _TopBar(
            onSearchChanged: (v) => setState(() => _search = v.toLowerCase()),
            onPeopleTap: () => context.push('/clubs'),
            onAddTap: () => _showNewChatDialog(context),
          ),
          Expanded(
            child: roomsAsync.when(
              loading: () => ListView.separated(
                padding: const EdgeInsets.symmetric(horizontal: AppDimensions.md),
                itemCount: 5,
                separatorBuilder: (_, __) => const SizedBox(height: AppDimensions.sm),
                itemBuilder: (_, __) => const PecShimmerBox(height: 46, width: double.infinity),
              ),
              error: (e, _) => PecErrorState(
                message: e.toString(),
                onRetry: () => ref.invalidate(chatRoomsProvider),
              ),
              data: (rooms) {
                final filtered = rooms.where((r) {
                  return _search.isEmpty ||
                      r.name.toLowerCase().contains(_search);
                }).toList();

                if (filtered.isEmpty) {
                  return PecEmptyState(
                    icon: Icons.chat_bubble_outline,
                    title: _search.isEmpty ? 'No chats yet' : 'No results',
                    subtitle: _search.isEmpty
                        ? 'Start a conversation by tapping the pencil icon'
                        : null,
                  );
                }

                final community = filtered.where((r) {
                  final n = r.name.toLowerCase();
                  return n.contains('announcement') || n.contains('global') || n.contains('community');
                }).toList();
                final department = filtered.where((r) => !community.contains(r)).toList();

                return ListView(
                  padding: const EdgeInsets.fromLTRB(
                    AppDimensions.md,
                    0,
                    AppDimensions.md,
                    AppDimensions.md,
                  ),
                  children: [
                    if (community.isNotEmpty) ...[
                      const _SectionTitle('Community'),
                      const SizedBox(height: AppDimensions.sm),
                      ...community.map((room) => Padding(
                            padding: const EdgeInsets.only(bottom: AppDimensions.sm),
                            child: _RoomTile(
                              room: room,
                              highlighted: true,
                            ),
                          )),
                      const SizedBox(height: AppDimensions.sm),
                    ],
                    if (department.isNotEmpty) ...[
                      const _SectionTitle('Department Groups'),
                      const SizedBox(height: AppDimensions.sm),
                      ...department.map((room) => Padding(
                            padding: const EdgeInsets.only(bottom: AppDimensions.sm),
                            child: _RoomTile(room: room),
                          )),
                    ],
                  ],
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  void _showNewChatDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => _NewChatDialog(
        onRoomCreated: (roomId) {
          ref.invalidate(chatRoomsProvider);
          context.push('/chat/$roomId');
        },
      ),
    );
  }
}

class _TopBar extends StatelessWidget {
  final ValueChanged<String> onSearchChanged;
  final VoidCallback onPeopleTap;
  final VoidCallback onAddTap;

  const _TopBar({
    required this.onSearchChanged,
    required this.onPeopleTap,
    required this.onAddTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppDimensions.md,
        AppDimensions.md,
        AppDimensions.md,
        AppDimensions.md,
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              onChanged: onSearchChanged,
              decoration: InputDecoration(
                hintText: 'Search chats...',
                hintStyle: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondaryDark),
                prefixIcon: const Icon(Icons.search, size: 20),
                border: const OutlineInputBorder(
                    borderSide: BorderSide(color: AppColors.black, width: 2)),
                enabledBorder: const OutlineInputBorder(
                    borderSide: BorderSide(color: AppColors.black, width: 2)),
                focusedBorder: const OutlineInputBorder(
                    borderSide: BorderSide(color: AppColors.yellow, width: 2)),
                filled: true,
                fillColor: AppColors.black,
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              ),
            ),
          ),
          const SizedBox(width: AppDimensions.sm),
          _TopIconButton(icon: Icons.group_outlined, onTap: onPeopleTap),
          const SizedBox(width: AppDimensions.sm),
          _TopIconButton(icon: Icons.add, onTap: onAddTap, highlighted: true),
        ],
      ),
    );
  }
}

class _TopIconButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  final bool highlighted;

  const _TopIconButton({
    required this.icon,
    required this.onTap,
    this.highlighted = false,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        width: 48,
        height: 48,
        decoration: BoxDecoration(
          color: highlighted ? AppColors.yellow : AppColors.black,
          border: Border.all(color: AppColors.black, width: 2),
        ),
        child: Icon(
          icon,
          size: 20,
          color: highlighted ? AppColors.black : AppColors.white,
        ),
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;
  const _SectionTitle(this.title);

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: AppTextStyles.labelLarge.copyWith(
        color: AppColors.textSecondaryDark,
        fontWeight: FontWeight.w700,
      ),
    );
  }
}

class _RoomTile extends StatelessWidget {
  final ChatRoom room;
  final bool highlighted;
  const _RoomTile({required this.room, this.highlighted = false});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => context.push('/chat/${room.id}'),
      child: Container(
        height: 46,
        decoration: BoxDecoration(
          color: highlighted ? AppColors.yellow : Colors.transparent,
          border: Border.all(
            color: highlighted
                ? AppColors.yellow
                : Colors.transparent,
          ),
        ),
        padding: const EdgeInsets.symmetric(horizontal: AppDimensions.md),
        child: Row(
          children: [
            Icon(
              Icons.group_outlined,
              size: 18,
              color: highlighted ? AppColors.black : AppColors.white.withValues(alpha: 0.75),
            ),
            const SizedBox(width: AppDimensions.md),
            Expanded(
              child: Text(
                room.name,
                style: AppTextStyles.bodyLarge.copyWith(
                  color: highlighted ? AppColors.black : AppColors.white,
                  fontWeight: highlighted ? FontWeight.w700 : FontWeight.w500,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _timeLabel(DateTime dt) {
    final now = DateTime.now();
    final diff = now.difference(dt);
    if (diff.inDays == 0) {
      return '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
    }
    if (diff.inDays < 7) {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return days[dt.weekday - 1];
    }
    return '${dt.day}/${dt.month}';
  }
}

class _NewChatDialog extends ConsumerStatefulWidget {
  final void Function(String roomId) onRoomCreated;
  const _NewChatDialog({required this.onRoomCreated});

  @override
  ConsumerState<_NewChatDialog> createState() => _NewChatDialogState();
}

class _NewChatDialogState extends ConsumerState<_NewChatDialog> {
  final _nameCtrl = TextEditingController();
  bool _isGroup = false;
  bool _loading = false;

  @override
  void dispose() {
    _nameCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('New Chat'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          TextField(
            controller: _nameCtrl,
            decoration: const InputDecoration(
              labelText: 'Name / User ID',
              hintText: 'Enter room name or user ID',
            ),
          ),
          const SizedBox(height: AppDimensions.sm),
          Row(
            children: [
              Switch(
                value: _isGroup,
                onChanged: (v) => setState(() => _isGroup = v),
                activeColor: AppColors.yellow,
              ),
              Text('Group chat', style: AppTextStyles.bodySmall),
            ],
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          style:
              ElevatedButton.styleFrom(backgroundColor: AppColors.yellow),
          onPressed: _loading
              ? null
              : () async {
                  final name = _nameCtrl.text.trim();
                  if (name.isEmpty) return;
                  setState(() => _loading = true);
                  try {
                    final ds = ref.read(chatDataSourceProvider);
                    ChatRoom room;
                    if (_isGroup) {
                      room = await ds.createGroupRoom(name, []);
                    } else {
                      room = await ds.createDirectRoom(name);
                    }
                    if (context.mounted) Navigator.pop(context);
                    widget.onRoomCreated(room.id);
                  } catch (e) {
                    setState(() => _loading = false);
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Error: $e')),
                      );
                    }
                  }
                },
          child: _loading
              ? const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(
                      strokeWidth: 2, color: AppColors.black))
              : Text('Start', style: AppTextStyles.labelSmall),
        ),
      ],
    );
  }
}
