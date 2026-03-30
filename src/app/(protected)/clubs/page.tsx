'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Send, MessageSquare, Users, FileText } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/features/auth/hooks/useAuth';
import api from '@/lib/api';
import { ClubProposalDialog } from '@/components/clubs/ClubProposalDialog';
import { ClubRequestsReview } from '@/components/clubs/ClubRequestsReview';

type Club = {
  id: string;
  name: string;
  memberCount: number;
  joined: boolean;
  requestStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  pendingRequestCount?: number;
};

const adminRoles = ['college_admin'];

export default function ClubsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [newClubName, setNewClubName] = useState('');
  const [postingByClub, setPostingByClub] = useState<Record<string, string>>({});
  const [selectedClubForProposal, setSelectedClubForProposal] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const isAdmin = useMemo(
    () => adminRoles.includes(user?.role || ''),
    [user?.role],
  );

  const loadClubs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/chat/clubs');
      const rawClubs = (res.data?.data || []) as Club[];
      const uniqueClubs = rawClubs.filter(
        (club, index, arr) => arr.findIndex((c) => c.id === club.id) === index,
      );
      setClubs(uniqueClubs);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load clubs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/auth');
      return;
    }
    if (user.role === 'faculty') {
      toast.error('Clubs are not available for faculty');
      router.replace('/dashboard');
      return;
    }
    void loadClubs();
  }, [authLoading, user, router]);

  const createClub = async () => {
    const name = newClubName.trim();
    if (!name) return;
    try {
      await api.post('/chat/clubs', { name });
      toast.success('Club created');
      setNewClubName('');
      await loadClubs();
      window.dispatchEvent(new Event('chat-rooms-updated'));
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.error?.message || 'Failed to create club');
    }
  };

  const postToClub = async (clubId: string) => {
    const content = (postingByClub[clubId] || '').trim();
    if (!content) return;
    try {
      await api.post(`/chat/clubs/${clubId}/post`, { content });
      toast.success('Posted to club chat');
      setPostingByClub((prev) => ({ ...prev, [clubId]: '' }));
      router.push(`/chat?room=${clubId}`);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.error?.message || 'Failed to post');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Clubs</h1>
        <p className="text-muted-foreground">
          {isAdmin
            ? 'Create and manage clubs, post club-wise updates, and monitor club chats.'
            : 'Join clubs and participate in club-specific discussions.'}
        </p>
      </div>

      {isAdmin && (
        <div className="card-elevated ui-card-pad space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Create New Club</h2>
          <div className="flex gap-2">
            <Input
              placeholder="Enter club name (e.g. Robotics Club)"
              value={newClubName}
              onChange={(e) => setNewClubName(e.target.value)}
            />
            <Button onClick={createClub}>
              <Plus className="w-4 h-4 mr-2" />
              Create
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {clubs.map((club) => (
          <div key={club.id} className="card-elevated ui-card-pad space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{club.name}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {club.memberCount} members
                </p>
              </div>
              <Badge variant={club.joined ? 'default' : 'secondary'}>
                {club.joined ? 'Joined' : 'Not Joined'}
              </Badge>
            </div>

            {!isAdmin && !club.joined && club.requestStatus === 'pending' && (
              <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded px-2 py-1">
                Join request pending admin approval
              </p>
            )}

            {!isAdmin && !club.joined && club.requestStatus === 'rejected' && (
              <p className="text-xs text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded px-2 py-1">
                Last request was rejected. You can submit a new proposal.
              </p>
            )}

            {isAdmin && (club.pendingRequestCount || 0) > 0 && (
              <p className="text-xs text-primary bg-primary/10 border border-primary/20 rounded px-2 py-1">
                {club.pendingRequestCount} pending request
                {(club.pendingRequestCount || 0) > 1 ? 's' : ''}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              {!club.joined && !isAdmin && (
                <Button onClick={() => setSelectedClubForProposal({ id: club.id, name: club.name })}>
                  <FileText className="w-4 h-4 mr-2" />
                  {club.requestStatus === 'pending' ? 'Update Proposal' : 'Submit Proposal'}
                </Button>
              )}
              {(club.joined || isAdmin) && (
                <Button
                  variant="outline"
                  onClick={() => router.push(`/chat?room=${club.id}`)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Open Club Chat
                </Button>
              )}
            </div>

            {isAdmin && (
              <div className="space-y-2 border-t border-border pt-3">
                <p className="text-sm font-medium text-foreground">
                  Post Club-wise Update
                </p>
                <Textarea
                  rows={3}
                  placeholder="Write update / task for this club..."
                  value={postingByClub[club.id] || ''}
                  onChange={(e) =>
                    setPostingByClub((prev) => ({
                      ...prev,
                      [club.id]: e.target.value,
                    }))
                  }
                />
                <Button onClick={() => postToClub(club.id)}>
                  <Send className="w-4 h-4 mr-2" />
                  Post to Club
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {clubs.length === 0 && (
        <p className="text-sm text-muted-foreground">No clubs created yet.</p>
      )}

      {isAdmin && (
        <div className="border-t border-border pt-6">
          <ClubRequestsReview />
        </div>
      )}

      <ClubProposalDialog
        clubId={selectedClubForProposal?.id || ''}
        clubName={selectedClubForProposal?.name || ''}
        isOpen={!!selectedClubForProposal}
        onClose={() => setSelectedClubForProposal(null)}
        onSubmitSuccess={() => loadClubs()}
      />
    </div>
  );
}
