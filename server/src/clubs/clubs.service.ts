import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClubsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.club.findMany({
      include: {
        createdBy: {
          select: { name: true, avatar: true },
        },
        _count: {
          select: { joinRequests: { where: { status: 'approved' } } },
        },
      },
    });
  }

  async findOne(id: string) {
    const club = await this.prisma.club.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { name: true, avatar: true },
        },
        joinRequests: {
          where: { status: 'approved' },
          include: { requester: { select: { name: true, avatar: true } } },
        },
      },
    });
    if (!club) throw new NotFoundException('Club not found');
    return club;
  }

  async createJoinRequest(clubId: string, userId: string, proposalText: string) {
    const club = await this.prisma.club.findUnique({ where: { id: clubId } });
    if (!club) throw new NotFoundException('Club not found');

    return this.prisma.clubJoinRequest.upsert({
      where: { clubId_requesterId: { clubId, requesterId: userId } },
      update: { proposalText, status: 'pending' },
      create: { clubId, requesterId: userId, proposalText },
    });
  }

  async getMyRequests(userId: string) {
    return this.prisma.clubJoinRequest.findMany({
      where: { requesterId: userId },
      include: { club: true },
    });
  }
}
