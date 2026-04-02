'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Search,
  DoorOpen,
  Users,
  Layers,
  Loader2,
  X,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/usePermissions';
import api from '@/lib/api';
import { fetchAllPages } from '@/lib/fetchAllPages';

interface Room {
  id: string;
  name: string;
  type: string;
  capacity: number;
  building: string;
  floor: number;
  facilities: string;
  isAvailable: boolean;
}

const roomTypes = ['Lecture Hall', 'Lab', 'Seminar Room', 'Auditorium', 'Workshop', 'Library', 'Office', 'Other'];

const emptyForm = {
  name: '',
  type: 'Lecture Hall',
  capacity: 30,
  building: '',
  floor: 1,
  facilities: '[]',
  isAvailable: true,
};

export default function RoomsPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAdmin } = usePermissions();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterBuilding, setFilterBuilding] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterAvailability, setFilterAvailability] = useState('all');
  const [showDialog, setShowDialog] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/auth');
      return;
    }
    fetchRooms();
  }, [authLoading, user, router]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const data = await fetchAllPages<Room>('/rooms');
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const buildings = [...new Set(rooms.map((r) => r.building))];

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      !search ||
      room.name.toLowerCase().includes(search.toLowerCase()) ||
      room.building.toLowerCase().includes(search.toLowerCase());
    const matchesBuilding = filterBuilding === 'all' || room.building === filterBuilding;
    const matchesType = filterType === 'all' || room.type === filterType;
    const matchesAvailability =
      filterAvailability === 'all' ||
      (filterAvailability === 'available' && room.isAvailable) ||
      (filterAvailability === 'unavailable' && !room.isAvailable);
    return matchesSearch && matchesBuilding && matchesType && matchesAvailability;
  });

  const openCreate = () => {
    setEditingRoom(null);
    setForm(emptyForm);
    setShowDialog(true);
  };

  const openEdit = (room: Room) => {
    setEditingRoom(room);
    setForm({
      name: room.name,
      type: room.type,
      capacity: room.capacity,
      building: room.building,
      floor: room.floor,
      facilities: room.facilities,
      isAvailable: room.isAvailable,
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.building) {
      toast.error('Please fill required fields');
      return;
    }

    setSaving(true);
    try {
      if (editingRoom) {
        await api.patch(`/rooms/${editingRoom.id}`, form);
        toast.success('Room updated');
      } else {
        await api.post('/rooms', form);
        toast.success('Room created');
      }
      setShowDialog(false);
      fetchRooms();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save room');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this room?')) return;
    try {
      await api.delete(`/rooms/${id}`);
      toast.success('Room deleted');
      fetchRooms();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete room');
    }
  };

  const getFacilities = (facilitiesStr: string): string[] => {
    try {
      return JSON.parse(facilitiesStr);
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Room Management</h1>
          <p className="text-muted-foreground">Manage campus rooms and facilities</p>
        </div>
        {isAdmin && (
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" /> Add Room
          </Button>
        )}
      </div>

      <div className="card-elevated p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search rooms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterBuilding} onValueChange={setFilterBuilding}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All buildings" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Buildings</SelectItem>
              {buildings.map((b) => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {roomTypes.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterAvailability} onValueChange={setFilterAvailability}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="unavailable">Unavailable</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredRooms.map((room, idx) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="card-elevated p-5 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <DoorOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{room.name}</h3>
                  <p className="text-xs text-muted-foreground">{room.building} - Floor {room.floor}</p>
                </div>
              </div>
              <Badge variant={room.isAvailable ? 'default' : 'secondary'}>
                {room.isAvailable ? (
                  <><Check className="w-3 h-3 mr-1" /> Available</>
                ) : (
                  <><X className="w-3 h-3 mr-1" /> Unavailable</>
                )}
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Layers className="w-4 h-4" />
                <span>{room.type}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{room.capacity} seats</span>
              </div>
            </div>

            {getFacilities(room.facilities).length > 0 && (
              <div className="flex flex-wrap gap-1">
                {getFacilities(room.facilities).map((f: string, i: number) => (
                  <Badge key={i} variant="outline" className="text-xs">{f}</Badge>
                ))}
              </div>
            )}

            {isAdmin && (
              <div className="flex gap-2 pt-2 border-t">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(room)}>
                  <Edit2 className="w-3 h-3 mr-1" /> Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(room.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <div className="card-elevated p-12 text-center">
          <Building2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-muted-foreground">No rooms found</p>
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRoom ? 'Edit Room' : 'Add Room'}</DialogTitle>
            <DialogDescription>
              {editingRoom ? 'Update room details' : 'Add a new room to the campus'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Room Name *</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., L-101"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Capacity</label>
                <Input
                  type="number"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                  className="mt-1"
                  min={1}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Building *</label>
                <Input
                  value={form.building}
                  onChange={(e) => setForm({ ...form, building: e.target.value })}
                  placeholder="e.g., Main Block"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Floor</label>
                <Input
                  type="number"
                  value={form.floor}
                  onChange={(e) => setForm({ ...form, floor: Number(e.target.value) })}
                  className="mt-1"
                  min={0}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Facilities (comma-separated)</label>
              <Input
                value={form.facilities === '[]' ? '' : form.facilities.replace(/[\[\]"]/g, '')}
                onChange={(e) => {
                  const val = e.target.value;
                  const facilities = (val && typeof val === 'string')
                    ? JSON.stringify(val.split(',').map((f) => (f || '').trim()).filter(Boolean))
                    : '[]';
                  setForm({ ...form, facilities });
                }}
                placeholder="e.g., Projector, AC, Whiteboard"
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Check className="w-4 h-4 mr-2" /> Save</>}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
