import React from 'react';
import { Trash2, Save } from 'lucide-react';
import { Button, Dialog, DialogContent, DialogTitle, Input } from '@pec/ui';
import { MapRegion } from './mapConfig';

export default function EditRegionModal({
  editingRegion,
  setEditingRegion,
  onSave,
  onDelete,
  categories,
}: {
  editingRegion: MapRegion | null;
  setEditingRegion: (region: MapRegion | null) => void;
  onSave: () => void;
  onDelete: (id: string) => void;
  categories: { id: string; label: string }[];
}) {
  if (!editingRegion) return null;

  return (
    <Dialog open={!!editingRegion} onOpenChange={(open) => !open && setEditingRegion(null)}>
      <DialogContent className=" w-full p-5">
        <DialogTitle className="font-bold text-lg mb-4">
          {editingRegion.id ? 'Edit Building' : 'New Building'}
        </DialogTitle>

        <div className="space-y-3">
          <div>
            <label className="text-sm text-muted-foreground">Name *</label>
            <Input
              value={editingRegion.name}
              onChange={(e) => setEditingRegion({ ...editingRegion, name: e.target.value })}
              placeholder="e.g., ECE Department"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Description</label>
            <Input
              value={editingRegion.description}
              onChange={(e) => setEditingRegion({ ...editingRegion, description: e.target.value })}
              placeholder="Brief description..."
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Category</label>
            <select
              value={editingRegion.category}
              onChange={(e) => setEditingRegion({ ...editingRegion, category: e.target.value })}
              className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          {editingRegion.id && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(editingRegion.id)}
              className="gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="outline" size="sm" onClick={() => setEditingRegion(null)}>
            Cancel
          </Button>
          <Button size="sm" onClick={onSave} className="gap-1">
            <Save className="w-4 h-4" />
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
