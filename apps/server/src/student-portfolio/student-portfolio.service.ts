import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudentPortfolioService {
  constructor(private readonly prisma: PrismaService) {}

  async getPortfolio(studentId: string) {
    const [resume, projects, skills] = await Promise.all([
      this.prisma.resumeProfile.findUnique({
        where: { userId: studentId }
      }),
      this.prisma.studentProject.findMany({
        where: { studentId }
      }),
      this.prisma.studentSkill.findMany({
        where: { studentId }
      })
    ]);

    return { resume, projects, skills };
  }

  async updateProfile(studentId: string, data: any) {
    // If studentProfile doesn't exist, we might need to upsert or just ignore if it's not strictly necessary.
    // The frontend sends { phone, address }. Let's update studentProfile if it exists.
    try {
      return await this.prisma.studentProfile.update({
        where: { userId: studentId },
        data,
      });
    } catch (e) {
      // If it doesn't exist, that's fine. Return null.
      return null;
    }
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

