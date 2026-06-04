'use client';

import { useEffect, useState } from 'react';
import { Loader2, Check, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import api from '@/lib/api';

interface ClubJoinRequest {
  id: string;
  requesterName: string;
  requesterEmail: string;
  clubName: string;
  proposalText: string;
  media: Array<{
    url: string;
    kind: 'image' | 'audio' | 'video' | 'file';
    name: string;
    mimeType: string;
  }>;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export function ClubRequestsReview() {
  const [requests, setRequests] = useState<ClubJoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/chat/clubs/requests');
      setRequests(res.data?.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (
    requestId: string,
    action: 'approve' | 'reject',
  ) => {
    const note = reviewNote.trim();

    if (action === 'reject' && !note) {
      toast.error('Rejection requires a note');
      return;
    }

    try {
      setSubmitting(true);
      await api.patch(`/chat/clubs/requests/${requestId}`, {
        action,
        reviewNote: note || undefined,
      });

      toast.success(action === 'approve' ? 'Request approved' : 'Request rejected');
      setReviewingId(null);
      setReviewNote('');
      await loadRequests();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.error?.message || 'Failed to review request');
    } finally {
      setSubmitting(false);
    }
  };

  const renderMediaPreview = (media: ClubJoinRequest['media'][0]) => {
    switch (media.kind) {
      case 'image':
        return (
          <a
            href={media.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-24 h-24 rounded"
          >
            <img
              src={media.url}
              alt={media.name}
              className="w-24 h-24 rounded object-cover"
            />
          </a>
        );
      case 'audio':
        return <audio controls src={media.url} className="w-48" />;
      case 'video':
        return <video controls src={media.url} className="w-48 h-auto rounded" />;
      default:
        return (
          <a
            href={media.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline text-sm"
          >
            Attachment: {media.name}
          </a>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const reviewedRequests = requests.filter((r) => r.status !== 'pending');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Club Join Requests</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Review and approve/reject user proposals to join clubs
        </p>
      </div>

      {pendingRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">
            Pending Requests ({pendingRequests.length})
          </h3>
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <div key={request.id} className="card-elevated ui-card-pad space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">
                        {request.requesterName}
                      </h4>
                      <Badge variant="secondary">{request.clubName}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {request.requesterEmail}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Submitted {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setExpandedId(expandedId === request.id ? null : request.id)
                    }
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        expandedId === request.id ? 'rotate-180' : ''
                      }`}
                    />
                  </Button>
                </div>

                {expandedId === request.id && (
                  <div className="border-t border-border pt-3 space-y-3">
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">Proposal</p>
                      <p className="text-sm text-foreground bg-muted p-3 rounded whitespace-pre-wrap">
                        {request.proposalText}
                      </p>
                    </div>

                    {request.media.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-foreground mb-2">
                          Supporting Media ({request.media.length})
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {request.media.map((m, idx) => (
                            <div key={idx} className="border border-border rounded p-2">
                              {renderMediaPreview(m)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {reviewingId === request.id ? (
                      <div className="border-t border-border pt-3 space-y-3">
                        <div>
                          <label className="text-sm font-medium text-foreground">
                            Review Note
                          </label>
                          <Textarea
                            placeholder="Add a note for the user (optional for approval, required for rejection)"
                            value={reviewNote}
                            onChange={(e) => setReviewNote(e.target.value)}
                            rows={3}
                            disabled={submitting}
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setReviewingId(null);
                              setReviewNote('');
                            }}
                            disabled={submitting}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleReview(request.id, 'reject')}
                            disabled={submitting}
                          >
                            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Reject
                          </Button>
                          <Button
                            onClick={() => handleReview(request.id, 'approve')}
                            disabled={submitting}
                          >
                            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Approve
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2 justify-end border-t border-border pt-3">
                        <Button variant="outline" onClick={() => setReviewingId(request.id)}>
                          <X className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                        <Button onClick={() => setReviewingId(request.id)}>
                          <Check className="w-4 h-4 mr-2" />
                          Review & Approve
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {pendingRequests.length === 0 && (
        <div className="card-elevated ui-card-pad text-center py-8">
          <p className="text-muted-foreground">No pending requests</p>
        </div>
      )}

      {reviewedRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">
            Review History ({reviewedRequests.length})
          </h3>
          <div className="space-y-2">
            {reviewedRequests.map((request) => (
              <div
                key={request.id}
                className="card-elevated ui-card-pad p-3 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-foreground">{request.requesterName}</p>
                  <p className="text-sm text-muted-foreground">{request.clubName}</p>
                </div>
                <Badge
                  variant={request.status === 'approved' ? 'default' : 'destructive'}
                >
                  {request.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

