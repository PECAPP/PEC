'use client';

import { useState } from 'react';
import { Loader2, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { uploadMedia } from '@/lib/cloudinary.service';
import {
  MediaUpload,
  type UploadedMedia,
} from '@/components/clubs/MediaUpload';

interface ClubProposalDialogProps {
  clubId: string;
  clubName: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

interface UploadedFile {
  url: string;
  kind: 'image' | 'audio' | 'video' | 'file';
  name: string;
  mimeType: string;
}

export function ClubProposalDialog({
  clubId,
  clubName,
  isOpen,
  onClose,
  onSubmitSuccess,
}: ClubProposalDialogProps) {
  const { user } = useAuth();
  const [proposal, setProposal] = useState('');
  const [media, setMedia] = useState<UploadedMedia[]>([]);
  const [loading, setLoading] = useState(false);

  const handleMediaAdd = (newMedia: UploadedMedia) => {
    setMedia((prev) => [...prev, newMedia]);
  };

  const handleMediaRemove = (id: string) => {
    setMedia((prev) => prev.filter((m) => m.id !== id));
  };

  const uploadFile = async (
    file: File,
    kind: 'image' | 'audio' | 'video' | 'file',
  ): Promise<UploadedFile> => {
    if (!user?.uid) {
      throw new Error('You must be signed in to upload media');
    }
    const url = await uploadMedia(file, user.uid);
    return {
      url,
      kind,
      name: file.name,
      mimeType: file.type,
    };
  };

  const handleSubmit = async () => {
    const proposalText = proposal.trim();

    if (!proposalText || proposalText.length < 10) {
      toast.error('Proposal must be at least 10 characters');
      return;
    }

    try {
      setLoading(true);

      // Upload all files
      const uploadedMedia: UploadedFile[] = [];
      for (const m of media) {
        const uploaded = await uploadFile(m.file, m.kind);
        uploadedMedia.push(uploaded);
      }

      // Submit proposal
      await api.post(`/chat/clubs/${clubId}/join-request`, {
        proposalText,
        media: uploadedMedia,
      });

      toast.success('Proposal submitted successfully!');
      setProposal('');
      setMedia([]);
      onSubmitSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.error?.message ||
          'Failed to submit proposal',
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Join Club</h2>
            <p className="text-sm text-muted-foreground mt-1">{clubName}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">
              Write Your Proposal
            </label>
            <p className="text-xs text-muted-foreground mt-1">
              Explain why you want to join this club and what you can contribute
            </p>
            <Textarea
              placeholder="Write a compelling proposal (minimum 10 characters)..."
              value={proposal}
              onChange={(e) => setProposal(e.target.value)}
              rows={4}
              className="mt-2"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {proposal.length} characters
            </p>
          </div>

          <MediaUpload
            onMediaAdd={handleMediaAdd}
            onMediaRemove={handleMediaRemove}
            maxFiles={5}
            maxSize={50 * 1024 * 1024}
          />

          <div className="border-t border-border pt-4 flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? 'Submitting...' : 'Submit Proposal'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
