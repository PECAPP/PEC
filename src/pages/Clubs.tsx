import { useState, useEffect } from 'react';
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  arrayUnion,
  arrayRemove,
  orderBy,
} from '@/lib/dataClient';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { usePermissions } from '@/hooks/usePermissions';
import {
  Plus,
  Edit2,
  Trash2,
  Users,
  MapPin,
  UserPlus,
  UserMinus,
  Calendar,
} from 'lucide-react';

interface Club {
  id: string;
  name: string;
  description: string;
  category: string;
  logo?: string;
  president: string;
  vice_president?: string;
  members: string[];
  totalMembers: number;
  createdAt: any;
  updatedAt: any;
}

interface ClubEvent {
  id: string;
  clubId: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  attendees: string[];
  createdAt: any;
}

export default function Clubs() {
  const { user } = useAuth();
  const { role } = usePermissions();

  const [clubs, setClubs] = useState<Club[]>([]);
  const [clubEvents, setClubEvents] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [deleteClubId, setDeleteClubId] = useState<string | null>(null);

  const [newClub, setNewClub] = useState({
    name: '',
    description: '',
    category: '',
    logo: '',
    president: user?.uid || '',
    vice_president: '',
  });

  const isAdmin = role === 'college_admin';

  // Fetch clubs
  useEffect(() => {
    const clubsRef = collection(({} as any), 'clubs');
    const unsubscribe = onSnapshot(
      query(clubsRef, orderBy('name')),
      (snapshot) => {
        const clubsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Club[];
        setClubs(clubsData);

        const uniqueCategories = Array.from(
          new Set(clubsData.map((c) => c.category))
        );
        setCategories(uniqueCategories);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  // Fetch club events
  useEffect(() => {
    const eventsRef = collection(({} as any), 'clubEvents');
    const unsubscribe = onSnapshot(eventsRef, (snapshot) => {
      const eventsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ClubEvent[];
      setClubEvents(eventsData);
    });

    return unsubscribe;
  }, []);

  const filteredClubs = clubs.filter((club) => {
    const matchesSearch = club.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || club.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const isUserMember = (club: Club) => user && club.members.includes(user.uid);

  const handleAddClub = async () => {
    if (!isAdmin) {
      toast.error('You do not have permission to add clubs');
      return;
    }

    try {
      await addDoc(collection(({} as any), 'clubs'), {
        ...newClub,
        president: user?.uid || '',
        members: [user?.uid],
        totalMembers: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      toast.success('Club created successfully');
      resetForm();
      setOpenAddDialog(false);
    } catch (error) {
      console.error('Error adding club:', error);
      toast.error('Failed to create club');
    }
  };

  const handleEditClub = (club: Club) => {
    setEditingClub(club);
    setNewClub({
      name: club.name,
      description: club.description,
      category: club.category,
      logo: club.logo || '',
      president: club.president,
      vice_president: club.vice_president || '',
    });
    setOpenEditDialog(true);
  };

  const handleUpdateClub = async () => {
    if (!isAdmin || !editingClub) return;

    try {
      await updateDoc(doc(({} as any), 'clubs', editingClub.id), {
        ...newClub,
        updatedAt: new Date(),
      });
      toast.success('Club updated successfully');
      resetForm();
      setOpenEditDialog(false);
    } catch (error) {
      console.error('Error updating club:', error);
      toast.error('Failed to update club');
    }
  };

  const handleDeleteClub = async (clubId: string) => {
    if (!isAdmin) {
      toast.error('You do not have permission to delete clubs');
      return;
    }

    try {
      await deleteDoc(doc(({} as any), 'clubs', clubId));
      toast.success('Club deleted successfully');
      setDeleteClubId(null);
    } catch (error) {
      console.error('Error deleting club:', error);
      toast.error('Failed to delete club');
    }
  };

  const handleJoinClub = async (clubId: string) => {
    if (!user) {
      toast.error('You must be logged in to join a club');
      return;
    }

    try {
      const clubRef = doc(({} as any), 'clubs', clubId);
      const club = clubs.find((c) => c.id === clubId);
      
      if (club && !club.members.includes(user.uid)) {
        await updateDoc(clubRef, {
          members: arrayUnion(user.uid),
          totalMembers: (club.totalMembers || 0) + 1,
          updatedAt: new Date(),
        });
        toast.success('Joined club successfully');
      }
    } catch (error) {
      console.error('Error joining club:', error);
      toast.error('Failed to join club');
    }
  };

  const handleLeaveClub = async (clubId: string) => {
    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    try {
      const clubRef = doc(({} as any), 'clubs', clubId);
      const club = clubs.find((c) => c.id === clubId);
      
      if (club && club.members.includes(user.uid)) {
        await updateDoc(clubRef, {
          members: arrayRemove(user.uid),
          totalMembers: Math.max(0, (club.totalMembers || 1) - 1),
          updatedAt: new Date(),
        });
        toast.success('Left club successfully');
      }
    } catch (error) {
      console.error('Error leaving club:', error);
      toast.error('Failed to leave club');
    }
  };

  const resetForm = () => {
    setNewClub({
      name: '',
      description: '',
      category: '',
      logo: '',
      president: user?.uid || '',
      vice_president: '',
    });
    setEditingClub(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading clubs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ADMIN VIEW */}
      {isAdmin && (
        <div className="space-y-6">
          {/* Admin Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">Clubs Management</h1>
            </div>
            <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Club
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingClub ? 'Edit Club' : 'Create New Club'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Club Name
                    </label>
                    <input
                      type="text"
                      value={newClub.name}
                      onChange={(e) =>
                        setNewClub({ ...newClub, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Club name..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Description
                    </label>
                    <textarea
                      value={newClub.description}
                      onChange={(e) =>
                        setNewClub({ ...newClub, description: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Club description..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Category
                      </label>
                      <input
                        type="text"
                        value={newClub.category}
                        onChange={(e) =>
                          setNewClub({ ...newClub, category: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="Sports, Arts, Tech..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Logo URL
                      </label>
                      <input
                        type="text"
                        value={newClub.logo}
                        onChange={(e) =>
                          setNewClub({ ...newClub, logo: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="Logo URL..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Vice President
                    </label>
                    <input
                      type="text"
                      value={newClub.vice_president}
                      onChange={(e) =>
                        setNewClub({
                          ...newClub,
                          vice_president: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Vice President email..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={
                        editingClub ? handleUpdateClub : handleAddClub
                      }
                      className="flex-1"
                    >
                      {editingClub ? 'Update Club' : 'Create Club'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        resetForm();
                        setOpenEditDialog(false);
                        setOpenAddDialog(false);
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* All Clubs Admin View */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">All Clubs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clubs.map((club) => (
                <motion.div
                  key={club.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 hover:shadow-lg transition-shadow dark:border-gray-700"
                >
                  {club.logo && (
                    <img
                      src={club.logo}
                      alt={club.name}
                      className="w-full h-40 object-cover rounded-lg mb-3"
                    />
                  )}
                  <h3 className="font-bold text-lg">{club.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {club.category}
                  </p>
                  <p className="text-sm mb-3 line-clamp-2">
                    {club.description}
                  </p>
                  <div className="flex items-center gap-2 mb-3 text-sm">
                    <Users className="w-4 h-4" />
                    <span>{club.totalMembers} members</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditClub(club)}
                      className="flex-1 gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteClubId(club.id)}
                      className="gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STUDENT/FACULTY VIEW */}
      {!isAdmin && (
        <div className="space-y-6">
          {/* Faculty Header */}
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Clubs & Societies</h1>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Search clubs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg bg-white dark:bg-gray-800"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Clubs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClubs.map((club) => (
              <motion.div
                key={club.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow dark:border-gray-700"
              >
                {club.logo && (
                  <img
                    src={club.logo}
                    alt={club.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">{club.name}</h3>
                  <p className="text-xs text-primary font-medium mb-2">
                    {club.category}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {club.description}
                  </p>

                  {/* Club Info */}
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      <span>{club.totalMembers} members</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>
                        {clubEvents.filter((e) => e.clubId === club.id).length}{' '}
                        events
                      </span>
                    </div>
                  </div>

                  {/* Upcoming Events Preview */}
                  {clubEvents
                    .filter((e) => e.clubId === club.id)
                    .slice(0, 2)
                    .map((event) => (
                      <div
                        key={event.id}
                        className="bg-blue-50 dark:bg-blue-950 p-2 rounded text-xs mb-2"
                      >
                        <p className="font-medium">{event.title}</p>
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {event.date} {event.time}
                        </div>
                      </div>
                    ))}

                  {/* Join/Leave Button */}
                  {isUserMember(club) ? (
                    <Button
                      variant="outline"
                      onClick={() => handleLeaveClub(club.id)}
                      className="w-full gap-2"
                    >
                      <UserMinus className="w-4 h-4" />
                      Leave Club
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleJoinClub(club.id)}
                      className="w-full gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      Join Club
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {filteredClubs.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || selectedCategory
                  ? 'No clubs found matching your criteria'
                  : 'No clubs available yet'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteClubId !== null}
        onOpenChange={(open) => !open && setDeleteClubId(null)}
      >
        <AlertDialogContent>
          <AlertDialogTitle>Delete Club</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this club? This action cannot be
            undone.
          </AlertDialogDescription>
          <div className="flex gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteClubId && handleDeleteClub(deleteClubId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Club</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Club Name
              </label>
              <input
                type="text"
                value={newClub.name}
                onChange={(e) =>
                  setNewClub({ ...newClub, name: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Club name..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                value={newClub.description}
                onChange={(e) =>
                  setNewClub({ ...newClub, description: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Club description..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={newClub.category}
                  onChange={(e) =>
                    setNewClub({ ...newClub, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Sports, Arts, Tech..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Logo URL
                </label>
                <input
                  type="text"
                  value={newClub.logo}
                  onChange={(e) =>
                    setNewClub({ ...newClub, logo: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Logo URL..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Vice President
              </label>
              <input
                type="text"
                value={newClub.vice_president}
                onChange={(e) =>
                  setNewClub({
                    ...newClub,
                    vice_president: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Vice President email..."
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleUpdateClub} className="flex-1">
                Update Club
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  setOpenEditDialog(false);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
