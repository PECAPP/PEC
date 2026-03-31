import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { SendMessageDto } from './dto/send-message.dto';

type ClubMedia = {
  url: string;
  kind: 'image' | 'audio' | 'video' | 'file';
  name?: string;
  mimeType?: string;
};

@Injectable()
export class ChatService {
  private static readonly CLUB_PREFIX = 'CLUB::';

  constructor(private prisma: PrismaService) {}

  private isAdmin(userRoles: string[] = []) {
    return userRoles.includes('college_admin');
  }

  private toClubRoomName(clubName: string) {
    return `${ChatService.CLUB_PREFIX}${clubName.trim()}`;
  }

  private async ensureParticipant(roomId: string, userId: string) {
    await this.prisma.userChatRoom.upsert({
      where: {
        userId_chatRoomId: {
          userId,
          chatRoomId: roomId,
        },
      },
      update: {},
      create: {
        userId,
        chatRoomId: roomId,
      },
    });
  }

  private async findClubByReference(clubRef: string) {
    const club = await this.prisma.club.findFirst({
      where: {
        OR: [{ id: clubRef }, { chatRoomId: clubRef }],
      },
      include: {
        chatRoom: {
          select: { id: true, name: true },
        },
      },
    });

    if (!club) {
      throw new NotFoundException('Club not found');
    }

    return club;
  }

  async findAllRooms(userId: string, userRoles: string[] = []) {
    const isCollegeAdmin = this.isAdmin(userRoles);
    const isFaculty = userRoles.includes('faculty');

    if (isCollegeAdmin) {
      return this.findDefaultRoomsForCollegeAdmin(userId);
    }

    const userChatRooms = await this.prisma.userChatRoom.findMany({
      where: { userId },
      include: {
        chatRoom: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const rooms = userChatRooms.map((ucr) => ucr.chatRoom);

    if (isFaculty) {
      const clubs = await this.prisma.club.findMany({
        select: { chatRoomId: true },
      });
      const clubRoomIds = new Set(clubs.map((club) => club.chatRoomId));
      return rooms.filter(
        (room) => !clubRoomIds.has(room.id),
      );
    }

    return rooms;
  }

  private async findDefaultRoomsForCollegeAdmin(userId: string) {
    const departments = await this.prisma.department.findMany({
      select: {
        name: true,
        timetableLabel: true,
      },
    });

    const defaultRoomNames = new Set<string>(['PEC Global Announcements']);
    departments.forEach((department) => {
      if (department.timetableLabel) {
        defaultRoomNames.add(department.timetableLabel);
      } else if (department.name) {
        defaultRoomNames.add(department.name);
      }
    });

    const clubRoomIds = (
      await this.prisma.club.findMany({
        select: { chatRoomId: true },
      })
    ).map((club) => club.chatRoomId);

    const rooms = await this.prisma.chatRoom.findMany({
      where: {
        OR: [
          {
            isGroup: true,
            name: {
              in: Array.from(defaultRoomNames),
            },
          },
          {
            id: {
              in: clubRoomIds,
            },
          },
        ],
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    const roomIds = rooms.map((room) => room.id);
    if (roomIds.length > 0) {
      const existingMemberships = await this.prisma.userChatRoom.findMany({
        where: {
          userId,
          chatRoomId: { in: roomIds },
        },
        select: {
          chatRoomId: true,
        },
      });

      const existingIds = new Set(
        existingMemberships.map((membership) => membership.chatRoomId),
      );
      const missingIds = roomIds.filter((id) => !existingIds.has(id));

      if (missingIds.length > 0) {
        await this.prisma.userChatRoom.createMany({
          data: missingIds.map((chatRoomId) => ({ userId, chatRoomId })),
          skipDuplicates: true,
        });
      }
    }

    return rooms;
  }

  async findMessages(roomId: string, userId: string, limit: number = 50) {
    const participation = await this.prisma.userChatRoom.findFirst({
      where: { userId, chatRoomId: roomId },
    });

    if (!participation) {
      throw new ForbiddenException('You are not a participant of this room');
    }

    return this.prisma.message.findMany({
      where: { chatRoomId: roomId },
      orderBy: { createdAt: 'asc' },
      take: limit,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async createRoom(dto: CreateRoomDto, creatorId: string) {
    const allParticipantIds = Array.from(new Set([...dto.userIds, creatorId]));

    return this.prisma.chatRoom.create({
      data: {
        name: dto.name,
        isGroup: dto.isGroup ?? true,
        participants: {
          create: allParticipantIds.map((id) => ({
            userId: id,
          })),
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async sendMessage(dto: SendMessageDto, senderId: string) {
    const participation = await this.prisma.userChatRoom.findFirst({
      where: { userId: senderId, chatRoomId: dto.chatRoomId },
    });

    if (!participation) {
      throw new ForbiddenException('You are not a participant of this room');
    }

    return this.prisma.message.create({
      data: {
        content: dto.content,
        senderId,
        chatRoomId: dto.chatRoomId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async getChatUsers(query: string) {
    if (!query || query.trim().length === 0) {
      return this.prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
        orderBy: { name: 'asc' },
        take: 20,
      });
    }

    return this.prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      take: 10,
    });
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    return this.prisma.message.delete({
      where: { id: messageId },
    });
  }

  async listClubs(userId: string, userRoles: string[] = []) {
    const isAdmin = this.isAdmin(userRoles);
    const isFaculty = userRoles.includes('faculty');

    if (isFaculty) {
      return [];
    }

    const clubs = await this.prisma.club.findMany({
      include: {
        chatRoom: {
          include: {
            participants: {
              select: {
                userId: true,
              },
            },
          },
        },
        joinRequests: {
          where: {
            OR: [{ requesterId: userId }, ...(isAdmin ? [{ status: 'pending' }] : [])],
          },
          select: {
            id: true,
            requesterId: true,
            status: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    if (isAdmin && clubs.length > 0) {
      await this.prisma.userChatRoom.createMany({
        data: clubs.map((club) => ({ userId, chatRoomId: club.chatRoomId })),
        skipDuplicates: true,
      });
    }

    return clubs.map((club) => {
      const participantIds = club.chatRoom.participants.map((p) => p.userId);
      const ownRequest = club.joinRequests.find(
        (request) => request.requesterId === userId,
      );
      const pendingRequestCount = club.joinRequests.filter(
        (request) => request.status === 'pending',
      ).length;
      return {
        id: club.chatRoomId,
        clubId: club.id,
        name: club.name,
        memberCount: participantIds.length,
        joined: participantIds.includes(userId) || isAdmin,
        requestStatus: ownRequest?.status ?? 'none',
        pendingRequestCount: isAdmin ? pendingRequestCount : undefined,
      };
    });
  }

  async createClub(name: string, requesterId: string, userRoles: string[] = []) {
    if (!this.isAdmin(userRoles)) {
      throw new ForbiddenException('Only admins can create clubs');
    }

    const trimmed = name.trim();
    if (!trimmed) {
      throw new BadRequestException('Club name is required');
    }

    const existing = await this.prisma.club.findFirst({
      where: { name: trimmed },
      select: { id: true },
    });

    if (existing) {
      throw new BadRequestException('Club already exists');
    }

    const adminUsers = await this.prisma.user.findMany({
      where: { role: { in: ['college_admin'] } },
      select: { id: true },
    });

    const participantIds = Array.from(
      new Set([...adminUsers.map((u) => u.id), requesterId]),
    );

    const clubRoom = await this.prisma.chatRoom.create({
      data: {
        name: this.toClubRoomName(trimmed),
        isGroup: true,
        participants: {
          create: participantIds.map((userId) => ({ userId })),
        },
      },
      include: {
        participants: {
          select: {
            userId: true,
          },
        },
      },
    });

    const club = await this.prisma.club.create({
      data: {
        name: trimmed,
        chatRoomId: clubRoom.id,
        createdById: requesterId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    return {
      id: clubRoom.id,
      clubId: club.id,
      name: club.name,
      memberCount: clubRoom.participants.length,
      joined: true,
    };
  }

  async submitClubJoinRequest(
    clubRoomId: string,
    requesterId: string,
    proposalText: string,
    media: ClubMedia[] = [],
    userRoles: string[] = [],
  ) {
    if (userRoles.includes('faculty')) {
      throw new ForbiddenException('Faculty does not have access to clubs');
    }

    if (this.isAdmin(userRoles)) {
      throw new BadRequestException(
        'College admin is already allowed in club chats',
      );
    }

    const club = await this.findClubByReference(clubRoomId);
    const trimmedProposal = proposalText.trim();
    if (trimmedProposal.length < 10) {
      throw new BadRequestException(
        'Proposal must be at least 10 characters long',
      );
    }

    const alreadyMember = await this.prisma.userChatRoom.findUnique({
      where: {
        userId_chatRoomId: {
          userId: requesterId,
          chatRoomId: club.chatRoomId,
        },
      },
      select: { userId: true },
    });

    if (alreadyMember) {
      return { status: 'already_joined', roomId: club.chatRoomId, clubId: club.id };
    }

    const normalizedMedia = (media ?? []).slice(0, 5).map((item) => ({
      url: String(item.url || '').trim(),
      kind: item.kind,
      name: item.name?.trim() || undefined,
      mimeType: item.mimeType?.trim() || undefined,
    }));

    if (normalizedMedia.some((item) => !item.url)) {
      throw new BadRequestException('Each media attachment must include a URL');
    }

    const request = await this.prisma.clubJoinRequest.upsert({
      where: {
        clubId_requesterId: {
          clubId: club.id,
          requesterId,
        },
      },
      update: {
        proposalText: trimmedProposal,
        mediaJson:
          normalizedMedia.length > 0 ? JSON.stringify(normalizedMedia) : null,
        status: 'pending',
        reviewNote: null,
        reviewedById: null,
        reviewedAt: null,
      },
      create: {
        clubId: club.id,
        requesterId,
        proposalText: trimmedProposal,
        mediaJson:
          normalizedMedia.length > 0 ? JSON.stringify(normalizedMedia) : null,
        status: 'pending',
      },
      select: {
        id: true,
        status: true,
        clubId: true,
      },
    });

    const persistedClub = await this.prisma.club.findUnique({
      where: { id: request.clubId },
      select: { chatRoomId: true },
    });

    return {
      requestId: request.id,
      status: request.status,
      roomId: persistedClub?.chatRoomId,
      clubId: request.clubId,
    };
  }

  async listClubJoinRequests(userId: string, userRoles: string[] = []) {
    const isAdmin = this.isAdmin(userRoles);

    if (userRoles.includes('faculty')) {
      return [];
    }

    const requests = await this.prisma.clubJoinRequest.findMany({
      where: isAdmin ? {} : { requesterId: userId },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      include: {
        club: { select: { id: true, name: true, chatRoomId: true } },
        requester: { select: { id: true, name: true, email: true, role: true } },
        reviewedBy: { select: { id: true, name: true } },
      },
    });

    return requests.map((request) => {
      let parsedMedia: ClubMedia[] = [];
      if (request.mediaJson) {
        try {
          const parsed = JSON.parse(request.mediaJson);
          if (Array.isArray(parsed)) {
            parsedMedia = parsed as ClubMedia[];
          }
        } catch {
          parsedMedia = [];
        }
      }

      return {
        id: request.id,
        requesterId: request.requesterId,
        requesterName: request.requester.name,
        requesterEmail: request.requester.email,
        requesterRole: request.requester.role,
        clubId: request.club.id,
        roomId: request.club.chatRoomId,
        clubName: request.club.name,
        proposalText: request.proposalText,
        media: parsedMedia,
        status: request.status,
        reviewNote: request.reviewNote,
        reviewedAt: request.reviewedAt,
        reviewedByName: request.reviewedBy?.name ?? null,
        createdAt: request.createdAt,
      };
    });
  }

  async reviewClubJoinRequest(
    requestId: string,
    reviewerId: string,
    action: 'approve' | 'reject',
    reviewNote: string | undefined,
    userRoles: string[] = [],
  ) {
    if (userRoles.includes('faculty')) {
      throw new ForbiddenException('Faculty does not have access to clubs');
    }

    if (!this.isAdmin(userRoles)) {
      throw new ForbiddenException('Only admins can review join requests');
    }

    const joinRequest = await this.prisma.clubJoinRequest.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        status: true,
        requesterId: true,
        clubId: true,
      },
    });

    if (!joinRequest) {
      throw new NotFoundException('Join request not found');
    }

    if (joinRequest.status !== 'pending') {
      throw new BadRequestException('Join request is already reviewed');
    }

    if (action === 'reject' && !reviewNote?.trim()) {
      throw new BadRequestException('Review note is required to reject request');
    }

    const nextStatus = action === 'approve' ? 'approved' : 'rejected';
    const updated = await this.prisma.clubJoinRequest.update({
      where: { id: requestId },
      data: {
        status: nextStatus,
        reviewNote: reviewNote?.trim() || null,
        reviewedById: reviewerId,
        reviewedAt: new Date(),
      },
      select: {
        id: true,
        status: true,
        requesterId: true,
        clubId: true,
      },
    });

    const updatedClub = await this.prisma.club.findUnique({
      where: { id: updated.clubId },
      select: { chatRoomId: true },
    });

    if (nextStatus === 'approved') {
      if (!updatedClub?.chatRoomId) {
        throw new NotFoundException('Club room not found');
      }
      await this.ensureParticipant(updatedClub.chatRoomId, updated.requesterId);
    }

    return {
      id: updated.id,
      status: updated.status,
      roomId: updatedClub?.chatRoomId,
      clubId: updated.clubId,
      requesterId: updated.requesterId,
    };
  }

  async postToClub(
    clubRoomId: string,
    senderId: string,
    content: string,
    userRoles: string[] = [],
  ) {
    if (!this.isAdmin(userRoles)) {
      throw new ForbiddenException('Only admins can post to clubs');
    }

    const trimmed = content.trim();
    if (!trimmed) {
      throw new BadRequestException('Message content is required');
    }

    const club = await this.findClubByReference(clubRoomId);
    await this.ensureParticipant(club.chatRoomId, senderId);

    return this.prisma.message.create({
      data: {
        content: trimmed,
        senderId,
        chatRoomId: club.chatRoomId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
}
