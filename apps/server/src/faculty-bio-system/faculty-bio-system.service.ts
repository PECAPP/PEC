import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatePublicationDto,
  CreateAwardDto,
  CreateConferenceDto,
  CreateConsultationDto,
} from './dto/faculty-bio.dto';

@Injectable()
export class FacultyBioSystemService {
  constructor(private readonly prisma: PrismaService) {}

  async getFullProfile(facultyId: string) {
    const [facultyProfile, publications, awards, conferences, consultations] = await Promise.all([
      this.prisma.facultyProfile.findUnique({
        where: { userId: facultyId },
        include: { user: true },
      }),
      this.prisma.facultyPublication.findMany({ take: 1000, 
        where: { facultyId },
        orderBy: { year: 'desc' },
      }),
      this.prisma.facultyAward.findMany({ take: 1000, 
        where: { facultyId },
        orderBy: { year: 'desc' },
      }),
      this.prisma.facultyConference.findMany({ take: 1000, 
        where: { facultyId },
        orderBy: { startDate: 'desc' },
      }),
      this.prisma.facultyConsultation.findMany({ take: 1000, 
        where: { facultyId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      faculty: facultyProfile,
      publications,
      awards,
      conferences,
      consultations,
      stats: {
        totalPublications: publications.length,
        totalAwards: awards.length,
        totalConferences: conferences.length,
        totalConsultations: consultations.length,
        totalCitations: publications.reduce((sum, p) => sum + (p.citations || 0), 0),
      },
    };
  }

  async getPublications(facultyId: string) {
    return this.prisma.facultyPublication.findMany({ take: 1000, 
      where: { facultyId },
      orderBy: { year: 'desc' },
      take: 50,
    });
  }

  async createPublication(data: CreatePublicationDto) {
    return this.prisma.facultyPublication.create({
      data: {
        ...data,
        citations: data.citations ?? 0,
      },
    });
  }

  async updatePublication(id: string, data: Partial<CreatePublicationDto>) {
    return this.prisma.facultyPublication.update({ where: { id }, data });
  }

  async deletePublication(id: string) {
    return this.prisma.facultyPublication.delete({ where: { id } });
  }

  async getAwards(facultyId: string) {
    return this.prisma.facultyAward.findMany({ take: 1000, 
      where: { facultyId },
      orderBy: { year: 'desc' },
      take: 50,
    });
  }

  async createAward(data: CreateAwardDto) {
    return this.prisma.facultyAward.create({ data });
  }

  async updateAward(id: string, data: Partial<CreateAwardDto>) {
    return this.prisma.facultyAward.update({ where: { id }, data });
  }

  async deleteAward(id: string) {
    return this.prisma.facultyAward.delete({ where: { id } });
  }

  async getConferences(facultyId: string) {
    return this.prisma.facultyConference.findMany({ take: 1000, 
      where: { facultyId },
      orderBy: { startDate: 'desc' },
      take: 50,
    });
  }

  async createConference(data: CreateConferenceDto) {
    return this.prisma.facultyConference.create({ data });
  }

  async updateConference(id: string, data: Partial<CreateConferenceDto>) {
    return this.prisma.facultyConference.update({ where: { id }, data });
  }

  async deleteConference(id: string) {
    return this.prisma.facultyConference.delete({ where: { id } });
  }

  async getConsultations(facultyId: string) {
    return this.prisma.facultyConsultation.findMany({ take: 1000, 
      where: { facultyId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async createConsultation(data: CreateConsultationDto) {
    return this.prisma.facultyConsultation.create({
      data: {
        ...data,
        status: data.status ?? 'active',
      },
    });
  }

  async updateConsultation(id: string, data: Partial<CreateConsultationDto>) {
    return this.prisma.facultyConsultation.update({ where: { id }, data });
  }

  async deleteConsultation(id: string) {
    return this.prisma.facultyConsultation.delete({ where: { id } });
  }
}
