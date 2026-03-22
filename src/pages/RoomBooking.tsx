import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Plus, Loader2, Filter } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';

import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  where,
  orderBy,
} from '@/lib/dataClient';
import type { Room as RoomType, RoomBooking as RoomBookingType } from '../types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const roomTypes = ['Classroom', 'Laboratory', 'Meeting Room', 'Seminar Hall', 'Conference Room'];

export default function RoomBooking() {
  const { user } = useAuth();
  const { role } = usePermissions();
  const isAdmin = role === 'college_admin';
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [bookings, setBookings] = useState<RoomBookingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [filterType, setFilterType] = useState('');

  const [newBooking, setNewBooking] = useState({
    startTime: '09:00',
    endTime: '10:00',
    purpose: '',
  });

  const [newRoom, setNewRoom] = useState({
    name: '',
    type: '',
    capacity: 30,
    location: '',
    amenities: [] as string[],
  });

  // Fetch rooms
  useEffect(() => {
    const roomsRef = collection(({} as any), 'rooms');
    const unsubscribe = onSnapshot(
      query(roomsRef, orderBy('name')),
      (snapshot) => {
        const roomsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as RoomType[];
        setRooms(roomsData);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  // Fetch bookings for selected date
  useEffect(() => {
    const bookingsRef = collection(({} as any), 'roomBookings');
    const dateStart = new Date(selectedDate);
    const dateEnd = new Date(selectedDate);
    dateEnd.setDate(dateEnd.getDate() + 1);

    const unsubscribe = onSnapshot(
      query(
        bookingsRef,
        where('date', '>=', dateStart),
        where('date', '<', dateEnd),
        orderBy('date'),
        orderBy('startTime')
      ),
      (snapshot) => {
        const bookingsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as RoomBookingType[];
        setBookings(bookingsData);
      }
    );

    return unsubscribe;
  }, [selectedDate]);

  const filteredRooms = rooms.filter(
    (room) => !filterType || room.type === filterType
  );

  const handleAddRoom = async () => {
    if (role !== 'college_admin') {
      toast.error('You do not have permission to add rooms');
      return;
    }

    try {
      await addDoc(collection(({} as any), 'rooms'), {
        ...newRoom,
        createdAt: new Date(),
        isAvailable: true,
      });
      toast.success('Room added successfully');
      setNewRoom({
        name: '',
        type: '',
        capacity: 30,
        location: '',
        amenities: [],
      });
      setOpenDialog(false);
    } catch (error) {
      console.error('Error adding room:', error);
      toast.error('Failed to add room');
    }
  };

  const handleBookRoom = async (roomId: string) => {
    if (!user) {
      toast.error('Please log in to book rooms');
      return;
    }

    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;

    try {
      // Check for conflicts
      const conflict = bookings.some(
        (b) =>
          b.roomId === roomId &&
          new Date(selectedDate + 'T' + newBooking.startTime) <
            new Date(selectedDate + 'T' + b.endTime) &&
          new Date(selectedDate + 'T' + newBooking.endTime) >
            new Date(selectedDate + 'T' + b.startTime)
      );

      if (conflict) {
        toast.error('Room is not available during this time');
        return;
      }

      const bookingDate = new Date(selectedDate);
      await addDoc(collection(({} as any), 'roomBookings'), {
        roomId,
        userId: user.uid,
        date: bookingDate,
        startTime: newBooking.startTime,
        endTime: newBooking.endTime,
        purpose: newBooking.purpose,
        title: `${room.name} - ${newBooking.purpose}`,
        status: role === 'faculty' ? 'pending' : 'approved',
        createdAt: new Date(),
      });

      toast.success(
        role === 'faculty'
          ? 'Booking request submitted for approval'
          : 'Room booked successfully'
      );
      setSelectedRoom(null);
      setNewBooking({
        startTime: '09:00',
        endTime: '10:00',
        purpose: '',
      });
    } catch (error) {
      console.error('Error booking room:', error);
      toast.error('Failed to book room');
    }
  };

  const handleApproveBooking = async (bookingId: string) => {
    try {
      await updateDoc(doc(({} as any), 'roomBookings', bookingId), {
        status: 'approved',
      });
      toast.success('Booking approved');
    } catch (error) {
      console.error('Error approving booking:', error);
      toast.error('Failed to approve booking');
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    try {
      await deleteDoc(doc(({} as any), 'roomBookings', bookingId));
      toast.success('Booking rejected');
    } catch (error) {
      console.error('Error rejecting booking:', error);
      toast.error('Failed to reject booking');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
              <MapPin className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">Room Management</h1>
            </div>
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Room
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Room</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Room Name (e.g., Lab A101)"
                    value={newRoom.name}
                    onChange={(e) =>
                      setNewRoom({ ...newRoom, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <select
                    value={newRoom.type}
                    onChange={(e) =>
                      setNewRoom({ ...newRoom, type: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                  >
                    <option value="">Select Room Type</option>
                    {roomTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Capacity"
                    value={newRoom.capacity}
                    onChange={(e) =>
                      setNewRoom({
                        ...newRoom,
                        capacity: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    value={newRoom.location}
                    onChange={(e) =>
                      setNewRoom({ ...newRoom, location: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <Button onClick={handleAddRoom} className="w-full">
                    Add Room
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Pending Approvals - Admin Only */}
          {bookings.filter((b) => b.status === 'pending').length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
              <h3 className="font-semibold mb-3">Pending Approvals</h3>
              {bookings
                .filter((b) => b.status === 'pending')
                .map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded mb-2"
                  >
                    <div>
                      <p className="font-medium">{rooms.find(r => r.id === booking.roomId)?.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {booking.startTime} - {booking.endTime}
                      </p>
                      <p className="text-sm">{booking.purpose}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApproveBooking(booking.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRejectBooking(booking.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* All Rooms List for Admin */}
          <div>
            <h3 className="text-lg font-semibold mb-4">All Rooms</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map((room) => {
                const roomBookings = bookings.filter(
                  (b) => b.roomId === room.id && b.status === 'approved'
                );
                const isOccupied = roomBookings.length > 0;

                return (
                  <div
                    key={room.id}
                    className={`border rounded-lg p-4 ${
                      isOccupied
                        ? 'border-red-300 bg-red-50 dark:bg-red-950 dark:border-red-700'
                        : 'border-gray-300 dark:border-gray-700'
                    }`}
                  >
                    <h3 className="font-semibold">{room.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {room.type}
                    </p>
                    <p className="text-sm mt-2">
                      <span className="text-gray-600 dark:text-gray-400">
                        Capacity:
                      </span>{' '}
                      {room.capacity}
                    </p>
                    {isOccupied && (
                      <div className="mt-2 p-2 bg-red-100 dark:bg-red-900 rounded">
                        <p className="text-xs font-medium">Bookings Today:</p>
                        {roomBookings.map((booking) => (
                          <p key={booking.id} className="text-xs">
                            {booking.startTime} - {booking.endTime}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* FACULTY/USER VIEW */}
      {!isAdmin && (
        <div className="space-y-6">
          {/* Faculty Header */}
          <div className="flex items-center gap-3">
            <MapPin className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Room Booking</h1>
          </div>

          {/* Date and Filter */}
          <div className="flex gap-4 flex-col sm:flex-row">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="">All Room Types</option>
              {roomTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRooms.map((room) => {
          const roomBookings = bookings.filter(
            (b) => b.roomId === room.id && b.status === 'approved'
          );
          const isOccupied = roomBookings.length > 0;

          return (
            <div
              key={room.id}
              className={`border rounded-lg p-4 ${
                isOccupied
                  ? 'border-red-300 bg-red-50 dark:bg-red-950 dark:border-red-700'
                  : 'border-gray-300 dark:border-gray-700'
              } hover:shadow-lg transition-shadow`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold">{room.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {room.type}
                  </p>
                </div>
                {isOccupied && (
                  <Clock className="w-4 h-4 text-red-600 dark:text-red-400" />
                )}
              </div>

              <div className="space-y-1 text-sm mb-3">
                <p>
                  <span className="text-gray-600 dark:text-gray-400">
                    Capacity:
                  </span>{' '}
                  {room.capacity}
                </p>
                <p>
                  <span className="text-gray-600 dark:text-gray-400">
                    Location:
                  </span>{' '}
                  {room.location}
                </p>
                {roomBookings.length > 0 && (
                  <div className="mt-2 p-2 bg-red-100 dark:bg-red-900 rounded">
                    {roomBookings.map((booking) => (
                      <p key={booking.id} className="text-xs font-medium">
                        {booking.startTime} - {booking.endTime}:{' '}
                        {booking.purpose}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {!isOccupied && (
                <Button
                  onClick={() => setSelectedRoom(room)}
                  className="w-full"
                >
                  Book Now
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Booking Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">
              Book {selectedRoom.name}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={newBooking.startTime}
                    onChange={(e) =>
                      setNewBooking({
                        ...newBooking,
                        startTime: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={newBooking.endTime}
                    onChange={(e) =>
                      setNewBooking({
                        ...newBooking,
                        endTime: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Purpose
                </label>
                <textarea
                  value={newBooking.purpose}
                  onChange={(e) =>
                    setNewBooking({ ...newBooking, purpose: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="What is the room needed for?"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleBookRoom(selectedRoom.id)}
                  className="flex-1"
                >
                  Confirm Booking
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedRoom(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      )}
    </div>
  );
}
