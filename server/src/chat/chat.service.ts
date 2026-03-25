import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  private static readonly COMMUNITY_ROOM_NAME = 'Campus Community';

  constructor(private prisma: PrismaService) {}

  async getChatUsers(requesterId: string, q?: string) {
    return this.prisma.user.findMany({
      where: {
        id: { not: requesterId },
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { email: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: {
        name: 'asc',
      },
      take: 200,
    });
  }

  private async ensureRoomParticipant(chatRoomId: string, userId: string) {
    const participant = await this.prisma.userChatRoom.findUnique({
      where: {
        userId_chatRoomId: {
          userId,
          chatRoomId,
        },
      },
    });

    if (!participant) {
      throw new Error('You are not a participant of this room');
    }
  }

  async createRoom(name: string, isGroup: boolean, userIds: string[]) {
    const uniqueUserIds = Array.from(new Set(userIds.filter(Boolean)));

    if (!isGroup && uniqueUserIds.length === 2) {
      const existing = await this.prisma.chatRoom.findFirst({
        where: {
          isGroup: false,
          participants: {
            every: { userId: { in: uniqueUserIds } },
          },
          AND: uniqueUserIds.map((id) => ({
            participants: {
              some: { userId: id },
            },
          })),
        },
        include: {
          participants: {
            include: {
              user: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
      });

      if (existing) {
        return existing;
      }
    }

    return this.prisma.chatRoom.create({
      data: {
        name,
        isGroup,
        participants: {
          create: uniqueUserIds.map((userId) => ({ userId })),
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });
  }

  async getRoomsForUser(userId: string) {
    await this.ensureCommunityRoomForUser(userId);

    return this.prisma.chatRoom.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      select: {
        id: true,
        name: true,
        isGroup: true,
        createdAt: true,
        participants: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            content: true,
            createdAt: true,
            senderId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async ensureCommunityRoomForUser(userId: string) {
    let communityRoom = await this.prisma.chatRoom.findFirst({
      where: {
        isGroup: true,
        name: ChatService.COMMUNITY_ROOM_NAME,
      },
      select: { id: true },
    });

    if (!communityRoom) {
      try {
        communityRoom = await this.prisma.chatRoom.create({
          data: {
            name: ChatService.COMMUNITY_ROOM_NAME,
            isGroup: true,
          },
          select: { id: true },
        });
      } catch (error) {
        const isUniqueViolation =
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002';

        if (!isUniqueViolation) {
          throw error;
        }

        communityRoom = await this.prisma.chatRoom.findFirst({
          where: {
            isGroup: true,
            name: ChatService.COMMUNITY_ROOM_NAME,
          },
          select: { id: true },
        });
      }
    }

    if (!communityRoom) {
      throw new Error('Unable to ensure community room');
    }

    await this.prisma.userChatRoom.upsert({
      where: {
        userId_chatRoomId: {
          userId,
          chatRoomId: communityRoom.id,
        },
      },
      update: {},
      create: {
        userId,
        chatRoomId: communityRoom.id,
      },
    });
  }

  async getRoomParticipants(chatRoomId: string, requesterId: string) {
    await this.ensureRoomParticipant(chatRoomId, requesterId);

    const participants = await this.prisma.userChatRoom.findMany({
      where: { chatRoomId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        userId: 'asc',
      },
    });

    return participants.map((item) => ({
      uid: item.user.id,
      fullName: item.user.name || item.user.email,
      email: item.user.email,
      role: item.user.role,
    }));
  }

  async updateRoom(
    roomId: string,
    requesterId: string,
    body: { name?: string },
  ) {
    await this.ensureRoomParticipant(roomId, requesterId);

    return this.prisma.chatRoom.update({
      where: { id: roomId },
      data: {
        name: body.name?.trim() || undefined,
      },
    });
  }

  async deleteRoom(roomId: string, requesterId: string) {
    await this.ensureRoomParticipant(roomId, requesterId);

    const room = await this.prisma.chatRoom.findUnique({
      where: { id: roomId },
      select: {
        id: true,
        isGroup: true,
        name: true,
      },
    });

    if (!room) {
      return { success: true };
    }

    if (room.isGroup && room.name === ChatService.COMMUNITY_ROOM_NAME) {
      throw new Error('Default community group cannot be deleted');
    }

    await this.prisma.chatRoom.delete({
      where: { id: roomId },
    });

    return { success: true };
  }

  async addParticipant(roomId: string, requesterId: string, userId: string) {
    await this.ensureRoomParticipant(roomId, requesterId);

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

    return { success: true };
  }

  async removeParticipant(roomId: string, requesterId: string, userId: string) {
    await this.ensureRoomParticipant(roomId, requesterId);

    await this.prisma.userChatRoom.deleteMany({
      where: {
        userId,
        chatRoomId: roomId,
      },
    });

    return { success: true };
  }

  async sendMessage(senderId: string, chatRoomId: string, content: string) {
    await this.ensureRoomParticipant(chatRoomId, senderId);

    return this.prisma.message.create({
      data: {
        senderId,
        chatRoomId,
        content,
      },
      include: { sender: { select: { id: true, name: true, avatar: true } } },
    });
  }

  async getMessages(chatRoomId: string, requesterId: string, limit = 100) {
    await this.ensureRoomParticipant(chatRoomId, requesterId);

    return this.prisma.message.findMany({
      where: { chatRoomId },
      orderBy: { createdAt: 'asc' },
      take: Math.min(Math.max(limit, 1), 200),
      include: { sender: { select: { id: true, name: true, avatar: true } } },
    });
  }

  async deleteMessage(messageId: string, requesterId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      select: { id: true, senderId: true, chatRoomId: true },
    });

    if (!message) {
      return { success: true };
    }

    await this.ensureRoomParticipant(message.chatRoomId, requesterId);

    if (message.senderId !== requesterId) {
      throw new Error('Only the sender can delete this message');
    }

    await this.prisma.message.delete({ where: { id: messageId } });
    return { success: true };
  }
}
