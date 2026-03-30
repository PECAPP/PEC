'use client';

import { useState } from 'react';
import { X, Upload, Image as ImageIcon, FileText, Mic, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export type MediaType = 'image' | 'audio' | 'video' | 'file';

export interface UploadedMedia {
  id: string;
  name: string;
  kind: MediaType;
  mimeType: string;
  file: File;
  preview?: string;
}

interface MediaUploadProps {
  onMediaAdd: (media: UploadedMedia) => void;
  onMediaRemove: (id: string) => void;
  maxFiles?: number;
  maxSize?: number;
}

export function MediaUpload({
  onMediaAdd,
  onMediaRemove,
  maxFiles = 5,
  maxSize = 50 * 1024 * 1024,
}: MediaUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedMedia[]>([]);

  const getMediaType = (mimeType: string): MediaType => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('video/')) return 'video';
    return 'file';
  };

  const getMediaIcon = (kind: MediaType) => {
    switch (kind) {
      case 'image':
        return <ImageIcon className="w-4 h-4" />;
      case 'audio':
        return <Mic className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (uploadedFiles.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    for (const file of files) {
      if (file.size > maxSize) {
        toast.error(
          `File ${file.name} exceeds maximum size of ${maxSize / 1024 / 1024}MB`,
        );
        continue;
      }

      const kind = getMediaType(file.type);
      const media: UploadedMedia = {
        id: `${Date.now()}-${Math.random()}`,
        name: file.name,
        kind,
        mimeType: file.type,
        file,
        preview: kind === 'image' ? URL.createObjectURL(file) : undefined,
      };

      setUploadedFiles((prev) => [...prev, media]);
      onMediaAdd(media);
    }

    e.target.value = '';
  };

  const handleRemove = (id: string) => {
    setUploadedFiles((prev) => {
      const removed = prev.find((m) => m.id === id);
      if (removed?.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return prev.filter((m) => m.id !== id);
    });
    onMediaRemove(id);
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium text-foreground">
          Media Attachments
          <span className="text-muted-foreground ml-2">
            ({uploadedFiles.length}/{maxFiles})
          </span>
        </label>
        <p className="text-xs text-muted-foreground mt-1">
          Upload images, audio, video, or documents to support your proposal
        </p>
      </div>

      <div className="relative">
        <input
          type="file"
          multiple
          accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt,.xlsx,.csv"
          onChange={handleFileSelect}
          className="hidden"
          id="media-upload"
          disabled={uploadedFiles.length >= maxFiles}
        />
        <label htmlFor="media-upload">
          <Button
            asChild
            variant="outline"
            className="w-full cursor-pointer"
            disabled={uploadedFiles.length >= maxFiles}
          >
            <span>
              <Upload className="w-4 h-4 mr-2" />
              Click to upload or drag files
            </span>
          </Button>
        </label>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          {uploadedFiles.map((media) => (
            <div
              key={media.id}
              className="flex items-center justify-between p-3 bg-muted rounded-lg"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="text-primary">{getMediaIcon(media.kind)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {media.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {media.kind}
                    {media.mimeType && ` | ${media.mimeType.split('/')[1]}`}
                  </p>
                </div>
              </div>
              {media.preview && media.kind === 'image' && (
                <img
                  src={media.preview}
                  alt={media.name}
                  className="w-10 h-10 rounded object-cover"
                />
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(media.id)}
                className="ml-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

