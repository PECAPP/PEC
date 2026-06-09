import React from 'react';
import { Loader2, Check } from 'lucide-react';
import { Button } from '@pec/ui';
import { Input } from '@pec/ui';
import { Textarea } from '@pec/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@pec/ui';
import { Publication } from '../types';

export default function PublicationDialog({
  isOpen,
  onClose,
  editingPublication,
  publicationForm,
  setPublicationForm,
  onSave,
  saving,
}: {
  isOpen: boolean;
  onClose: () => void;
  editingPublication: Publication | null;
  publicationForm: any;
  setPublicationForm: (form: any) => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingPublication ? 'Edit Publication' : 'Add Publication'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title *</label>
            <Input
              value={publicationForm.title}
              onChange={(e) => setPublicationForm({ ...publicationForm, title: e.target.value })}
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Journal</label>
              <Input
                value={publicationForm.journal}
                onChange={(e) =>
                  setPublicationForm({ ...publicationForm, journal: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Conference</label>
              <Input
                value={publicationForm.conference}
                onChange={(e) =>
                  setPublicationForm({ ...publicationForm, conference: e.target.value })
                }
                className="mt-1"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Year</label>
              <Input
                type="number"
                value={publicationForm.year}
                onChange={(e) =>
                  setPublicationForm({ ...publicationForm, year: Number(e.target.value) })
                }
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Citations</label>
              <Input
                type="number"
                value={publicationForm.citations}
                onChange={(e) =>
                  setPublicationForm({ ...publicationForm, citations: Number(e.target.value) })
                }
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">DOI</label>
            <Input
              value={publicationForm.doi}
              onChange={(e) => setPublicationForm({ ...publicationForm, doi: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">URL</label>
            <Input
              value={publicationForm.url}
              onChange={(e) => setPublicationForm({ ...publicationForm, url: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Abstract</label>
            <Textarea
              value={publicationForm.abstract}
              onChange={(e) => setPublicationForm({ ...publicationForm, abstract: e.target.value })}
              className="mt-1"
              rows={3}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Co-Authors (comma-separated)</label>
            <Input
              value={publicationForm.coAuthors}
              onChange={(e) =>
                setPublicationForm({ ...publicationForm, coAuthors: e.target.value })
              }
              className="mt-1"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onSave} disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
