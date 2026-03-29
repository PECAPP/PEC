'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Menu, 
  ShoppingBag, 
  Trash2, 
  Edit2, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Loader2,
  Package,
  IndianRupee,
  Search,
  Filter,
  Check,
  Ban,
  Truck,
  MapPin,
} from 'lucide-react';
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  serverTimestamp 
} from '@/lib/dataClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface CanteenItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  isAvailable: boolean;
  stock: number;
}

export default function CanteenManager() {
  const [items, setItems] = useState<CanteenItem[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'menu'>('orders');
  const [editingItem, setEditingItem] = useState<Partial<CanteenItem> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    // Real-time orders
    const qOrders = query(collection(({} as any), 'canteenOrders'), orderBy('timestamp', 'desc'));
    const unsubscribeOrders = onSnapshot(qOrders, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Menu items
    const qItems = query(collection(({} as any), 'canteenItems'));
    const unsubscribeItems = onSnapshot(qItems, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CanteenItem)));
      setLoading(false);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeItems();
    };
  }, []);

  const handleSaveItem = async () => {
    if (!editingItem?.name || !editingItem?.price) {
      toast.error('Name and Price are required');
      return;
    }

    try {
      const id = editingItem.id || editingItem.name.toLowerCase().replace(/\s+/g, '_');
      await setDoc(doc(({} as any), 'canteenItems', id), {
        ...editingItem,
        id,
        isAvailable: editingItem.isAvailable ?? true,
        stock: editingItem.stock ?? 100,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      toast.success(editingItem.id ? 'Item updated' : 'Item added');
      setIsDialogOpen(false);
      setEditingItem(null);
    } catch (error) {
      toast.error('Failed to save item');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteDoc(doc(({} as any), 'canteenItems', id));
      toast.success('Item deleted');
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(({} as any), 'canteenOrders', orderId), {
        status: newStatus
      });
      toast.success(`Order marked as ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const canteenStats = {
    pending: orders.filter(o => o.status === 'Pending').length,
    active: orders.filter(o => o.status === 'Confirmed' || o.status === 'Out for Delivery').length,
    totalRevenue: orders
      .filter(o => o.status === 'Delivered')
      .reduce((sum, o) => sum + o.totalAmount, 0)
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Package className="w-8 h-8 text-primary" />
            Canteen Dashboard
          </h1>
          <p className="text-muted-foreground">Manage your night hunger squad from here.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
            <Button 
              variant={activeTab === 'orders' ? 'secondary' : 'ghost'} 
              onClick={() => setActiveTab('orders')}
              size="sm"
            >
              Recent Orders
            </Button>
            <Button 
              variant={activeTab === 'menu' ? 'secondary' : 'ghost'} 
              onClick={() => setActiveTab('menu')}
              size="sm"
            >
              Menu Manager
            </Button>
          </div>
          
          {activeTab === 'menu' && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="gradient" onClick={() => setEditingItem({})}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingItem?.id ? 'Edit Item' : 'New Canteen Item'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Item Name</label>
                    <Input 
                      value={editingItem?.name || ''} 
                      onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                      placeholder="e.g. Kurkure Masala"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Price (₹)</label>
                      <Input 
                        type="number"
                        value={editingItem?.price || ''} 
                        onChange={e => setEditingItem({...editingItem, price: Number(e.target.value)})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category</label>
                      <Select 
                        value={editingItem?.category || ''} 
                        onValueChange={v => setEditingItem({...editingItem, category: v})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Snacks">Snacks</SelectItem>
                          <SelectItem value="Drinks">Drinks</SelectItem>
                          <SelectItem value="Meals">Meals</SelectItem>
                          <SelectItem value="Desserts">Desserts</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Image URL</label>
                    <Input 
                      value={editingItem?.image || ''} 
                      onChange={e => setEditingItem({...editingItem, image: e.target.value})}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium">Available for Order</label>
                      <p className="text-xs text-muted-foreground">Toggle to show/hide from menu</p>
                    </div>
                    <Switch 
                      checked={editingItem?.isAvailable ?? true}
                      onCheckedChange={v => setEditingItem({...editingItem, isAvailable: v})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleSaveItem} className="w-full">Save Item</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="p-6 rounded-2xl border bg-card/50 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-orange-500/10">
            <Clock className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pending Orders</p>
            <p className="text-2xl font-bold">{canteenStats.pending}</p>
          </div>
        </div>
        <div className="p-6 rounded-2xl border bg-card/50 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <Truck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Active Deliveries</p>
            <p className="text-2xl font-bold">{canteenStats.active}</p>
          </div>
        </div>
        <div className="p-6 rounded-2xl border bg-card/50 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-green-500/10">
            <IndianRupee className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Today's Sales</p>
            <p className="text-2xl font-bold">₹{canteenStats.totalRevenue}</p>
          </div>
        </div>
      </div>

      {activeTab === 'orders' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Live Orders</h2>
            <Badge variant="secondary" className="bg-primary/5 text-primary">Auto-updates live</Badge>
          </div>

          <div className="grid gap-4">
            {orders.length > 0 ? (
              orders.map((order) => (
                <div key={order.id} className="p-6 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all flex flex-col md:flex-row gap-6 md:items-center">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge className={
                        order.status === 'Pending' ? 'bg-orange-500' :
                        order.status === 'Confirmed' ? 'bg-blue-500' :
                        order.status === 'Out for Delivery' ? 'bg-indigo-500' :
                        order.status === 'Delivered' ? 'bg-green-500' :
                        'bg-red-500'
                      }>
                        {order.status}
                      </Badge>
                      <span className="text-sm font-medium text-muted-foreground">#{order.id.slice(-6).toUpperCase()}</span>
                      <span className="text-sm text-muted-foreground">• {order.timestamp?.toDate().toLocaleTimeString()}</span>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold">{order.studentName}</h3>
                      <p className="text-primary font-medium flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {order.hostelRoom}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {order.items.map((it: any, idx: number) => (
                        <div key={idx} className="px-2 py-1 rounded bg-muted text-xs font-medium">
                          {it.quantity}x {it.name}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-4 min-w-[200px]">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Total Value</p>
                      <p className="text-2xl font-bold">₹{order.totalAmount}</p>
                    </div>
                    
                    <div className="flex gap-2 w-full md:w-auto">
                      {order.status === 'Pending' && (
                        <Button 
                          size="sm" 
                          onClick={() => updateOrderStatus(order.id, 'Confirmed')}
                          className="flex-1 md:flex-none bg-blue-500 hover:bg-blue-600"
                        >
                          Confirm
                        </Button>
                      )}
                      {order.status === 'Confirmed' && (
                        <Button 
                          size="sm" 
                          onClick={() => updateOrderStatus(order.id, 'Out for Delivery')}
                          className="flex-1 md:flex-none bg-indigo-500 hover:bg-indigo-600"
                        >
                          Out for Delivery
                        </Button>
                      )}
                      {(order.status === 'Out for Delivery' || order.status === 'Confirmed') && (
                        <Button 
                          size="sm" 
                          onClick={() => updateOrderStatus(order.id, 'Delivered')}
                          className="flex-1 md:flex-none bg-green-500 hover:bg-green-600"
                        >
                          Complete
                        </Button>
                      )}
                      {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => updateOrderStatus(order.id, 'Cancelled')}
                          className="flex-1 md:flex-none text-destructive hover:bg-destructive/10"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 border-2 border-dashed border-muted rounded-3xl bg-card/50">
                <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-bold">No orders yet</h3>
                <p className="text-muted-foreground">Wait for the hunger sirens to ring.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Menu Management</h2>
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search menu..." className="w-64 h-9" />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Item</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Price</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={item.image} className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <p className="font-bold">{item.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className="font-medium">{item.category}</Badge>
                    </td>
                    <td className="px-6 py-4 font-bold text-primary">₹{item.price}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={item.isAvailable} 
                          onCheckedChange={async (v) => {
                            await updateDoc(doc(({} as any), 'canteenItems', item.id), { isAvailable: v });
                            toast.info(`${item.name} is now ${v ? 'Available' : 'Unavailable'}`);
                          }}
                        />
                        <span className="text-sm font-medium">
                          {item.isAvailable ? 'Live' : 'Hidden'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="w-8 h-8 rounded-lg"
                          onClick={() => {
                            setEditingItem(item);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="w-8 h-8 rounded-lg text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
