import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SocialSyncService {
  constructor(private readonly prisma: PrismaService) {}

  async syncSocialData(userId: string, data: {
    githubUsername?: string;
    linkedinUsername?: string;
  }) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        githubUsername: data.githubUsername,
        linkedinUsername: data.linkedinUsername,
      },
      select: {
        id: true,
        githubUsername: true,
        linkedinUsername: true,
        name: true,
        email: true,
      },
    });
  }

  async getSocialData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        githubUsername: true,
        linkedinUsername: true,
        name: true,
        studentProfile: {
          select: {
            enrollmentNumber: true,
            department: true,
            semester: true,
          },
        },
        facultyProfile: {
          select: {
            employeeId: true,
            department: true,
            designation: true,
          },
        },
      },
    });

    if (!user) return null;

    let githubData: any = null;
    if (user.githubUsername) {
      try {
        const response = await fetch(
          `https://api.github.com/users/${user.githubUsername}`,
          {
            headers: {
              Accept: 'application/vnd.github.v3+json',
              ...(process.env.GITHUB_TOKEN
                ? { Authorization: `token ${process.env.GITHUB_TOKEN}` }
                : {}),
            },
          },
        );
        if (response.ok) {
          githubData = await response.json();
        }
      } catch (error) {
        console.error('Failed to fetch GitHub data:', error);
      }
    }

    return {
      userId: user.id,
      name: user.name,
      github: {
        username: user.githubUsername,
        data: githubData,
        available: !!user.githubUsername,
      },
      linkedin: {
        username: user.linkedinUsername,
        available: !!user.linkedinUsername,
      },
      profile: user.studentProfile || user.facultyProfile,
    };
  }

  async fetchGitHubRepos(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { githubUsername: true },
    });

    if (!user?.githubUsername) {
      return { repos: [], message: 'GitHub username not configured' };
    }

    try {
      const response = await fetch(
        `https://api.github.com/users/${user.githubUsername}/repos?sort=updated&per_page=10`,
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
          url: repo.html_url,
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
