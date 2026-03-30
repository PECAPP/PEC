import { daysAgo, prisma } from './utils';
import { FacultySeed } from './data';

type NoticeSeed = {
  title: string;
  content: string;
  category: 'news' | 'update' | 'event' | 'alert';
  important?: boolean;
  pinned?: boolean;
  mediaJson?: string;
  authorId: string;
  publishedAt?: Date;
};

export async function seedNoticeboard(adminId: string, faculties: FacultySeed[]) {
  const fallbackAuthorId = faculties[0]?.id ?? adminId;

  const notices: NoticeSeed[] = [
    {
      title: 'Semester Kickoff Orientation',
      content:
        'All students are requested to attend the semester orientation in the main auditorium at 10:00 AM on Monday.',
      category: 'news',
      important: true,
      pinned: true,
      authorId: adminId,
      publishedAt: daysAgo(1),
    },
    {
      title: 'Department Lab Timings Updated',
      content:
        'Faculty and students should check revised lab slots before booking project sessions this week.',
      category: 'update',
      important: false,
      pinned: false,
      authorId: fallbackAuthorId,
      publishedAt: daysAgo(2),
    },
    {
      title: 'Inter-Department Tech Event',
      content:
        'Registrations are open for the annual tech event. Teams can submit entries through their department coordinators.',
      category: 'event',
      important: false,
      pinned: false,
      authorId: adminId,
      publishedAt: daysAgo(3),
    },
    {
      title: 'Server Maintenance Window',
      content:
        'A brief maintenance window is planned on Sunday from 01:00 AM to 03:00 AM. Some modules may be temporarily unavailable.',
      category: 'alert',
      important: true,
      pinned: false,
      mediaJson: JSON.stringify([
        {
          url: 'https://example.com/notices/maintenance-checklist.pdf',
          kind: 'file',
          name: 'maintenance-checklist.pdf',
          mimeType: 'application/pdf',
        },
      ]),
      authorId: adminId,
      publishedAt: daysAgo(0),
    },
  ];

  const prismaAny = prisma as any;
  await prismaAny.notice.createMany({
    data: notices.map((notice) => ({
      title: notice.title,
      content: notice.content,
      category: notice.category,
      important: !!notice.important,
      pinned: !!notice.pinned,
      mediaJson: notice.mediaJson ?? null,
      authorId: notice.authorId,
      publishedAt: notice.publishedAt ?? new Date(),
    })),
  });
}
