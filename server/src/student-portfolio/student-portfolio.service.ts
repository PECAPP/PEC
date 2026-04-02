import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateStudentProjectDto,
  UpdateStudentProjectDto,
  CreateStudentSkillDto,
  UpdateStudentSkillDto,
} from './dto/student-portfolio.dto';

@Injectable()
export class StudentPortfolioService {
  constructor(private readonly prisma: PrismaService) {}

  async getPortfolio(studentId: string) {
    const [projects, skills] = await Promise.all([
      this.prisma.studentProject.findMany({
        where: { studentId },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.studentSkill.findMany({
        where: { studentId },
        orderBy: [{ category: 'asc' }, { level: 'desc' }],
      }),
    ]);

    const skillsByCategory = skills.reduce((acc, skill) => {
      const cat = skill.category || 'technical';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(skill);
      return acc;
    }, {} as Record<string, typeof skills>);

    return { projects, skills, skillsByCategory };
  }

  async getProjects(studentId: string) {
    return this.prisma.studentProject.findMany({
      where: { studentId },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async createProject(data: CreateStudentProjectDto) {
    return this.prisma.studentProject.create({
      data: {
        ...data,
        techStack: data.techStack ?? '[]',
        isFeatured: data.isFeatured ?? false,
      },
    });
  }

  async updateProject(id: string, data: UpdateStudentProjectDto) {
    return this.prisma.studentProject.update({ where: { id }, data });
  }

  async deleteProject(id: string) {
    return this.prisma.studentProject.delete({ where: { id } });
  }

  async getSkills(studentId: string) {
    return this.prisma.studentSkill.findMany({
      where: { studentId },
      orderBy: [{ category: 'asc' }, { level: 'desc' }],
    });
  }

  async createSkill(data: CreateStudentSkillDto) {
    return this.prisma.studentSkill.create({
      data: {
        ...data,
        level: data.level ?? 50,
        category: data.category ?? 'technical',
      },
    });
  }

  async updateSkill(id: string, data: UpdateStudentSkillDto) {
    return this.prisma.studentSkill.update({ where: { id }, data });
  }

  async deleteSkill(id: string) {
    return this.prisma.studentSkill.delete({ where: { id } });
  }

  async syncGitHubRepos(studentId: string, githubUsername: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: { githubUsername: true },
    });

    const username = githubUsername || user?.githubUsername;
    if (!username) {
      return { repos: [], message: 'GitHub username not configured' };
    }

    try {
      const response = await fetch(
        `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=15`,
        {
          headers: {
            Accept: 'application/vnd.github.v3+json',
            ...(process.env.GITHUB_TOKEN
              ? { Authorization: `token ${process.env.GITHUB_TOKEN}` }
              : {}),
          },
        },
      );

      if (!response.ok) {
        return { repos: [], message: 'Failed to fetch GitHub repos' };
      }

      const repos = await response.json();
      return {
        repos: repos.map((repo: any) => ({
          name: repo.name,
          description: repo.description,
          githubUrl: repo.html_url,
          liveUrl: repo.homepage,
          techStack: repo.language ? JSON.stringify([repo.language]) : '[]',
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          language: repo.language,
          updatedAt: repo.updated_at,
        })),
      };
    } catch (error) {
      return { repos: [], message: 'Failed to fetch GitHub repos' };
    }
  }
}
