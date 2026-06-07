export type NoticeMedia = {
  id?: string;
  url: string;
  kind: 'image' | 'audio' | 'video' | 'file';
  name?: string;
  mimeType?: string;
  sizeBytes?: number;
};

export type NoticeItem = {
  id: string;
  title: string;
  content: string;
  category: 'news' | 'update' | 'event' | 'alert';
  important: boolean;
  priorityLevel: number;
  pinned: boolean;
  media: NoticeMedia[];
  authorName: string;
  publishedAt: string;
};
