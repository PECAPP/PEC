'use client';

import { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Clock,
  Truck,
  IndianRupee,
  MapPin,
  ShoppingBag,
  Search,
  Edit2,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { DataTable } from '@/components/common/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Button,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Switch,
  Badge,
} from '@pec/ui';
import { api } from '@pec/api';

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

export default function ManagerCanteenView() {
  const [items, setItems] = useState<CanteenItem[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [_loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'menu'>('orders');
  const [editingItem, setEditingItem] = useState<Partial<CanteenItem> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    // Real-time orders
    const fetchOrders = async () => {
      try {
        const { data: raw } = await api.get('/night-canteen/orders');
        setOrders(Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []));
      } catch (e) {
        console.error("Error fetching orders:", e);
      }
    };
    fetchOrders();
    
    const socket = io((process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001") + "/night-canteen");
    socket.on("connect", () => {
      socket.emit("joinManager");
    });
    socket.on("newOrder", (newOrder) => {
      toast.success(`New order from ${newOrder.studentName}`);
      setOrders(prev => [newOrder, ...prev]);
    });
    socket.on("orderUpdated", (updatedOrder) => {
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    });
    
    const unsubscribeOrders = () => socket.disconnect();

    // Menu items
    const fetchItems = async () => {
      try {
        const { data: raw } = await api.get('/night-canteen/items');
        setItems(Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []));
      } catch(e) { console.error(e); }
      setLoading(false);
    };
    fetchItems();
    const unsubscribeItems = () => {};

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
      if (editingItem.id) {
        await api.patch('/night-canteen/items/' + id, { ...editingItem, id, isAvailable: editingItem.isAvailable ?? true, stock: editingItem.stock ?? 100 });
      } else {
        await api.post('/night-canteen/items', { ...editingItem, id, isAvailable: editingItem.isAvailable ?? true, stock: editingItem.stock ?? 100 });
      }
      
      toast.success(editingItem.id ? 'Item updated' : 'Item added');
      setIsDialogOpen(false);
      setEditingItem(null);
    } catch (_error) {
      toast.error('Failed to save item');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete('/night-canteen/items/' + id);
      toast.success('Item deleted');
    } catch (_error) {
      toast.error('Failed to delete item');
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.patch('/night-canteen/orders/' + orderId, { status: newStatus });
      toast.success(`Order marked as ${newStatus}`);
    } catch (_error) {
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

  const columns = useMemo<ColumnDef<CanteenItem>[]>(() => [
    {
      accessorKey: 'name',
      header: 'Item',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <img src={row.original.image} className="w-10 h-10 rounded-sm object-cover" />
          <div>
            <p className="font-bold">{row.original.name}</p>
            <p className="text-xs text-muted-foreground line-clamp-1">{row.original.description}</p>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => <Badge variant="secondary" className="font-medium">{row.original.category}</Badge>
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => <span className="font-bold text-primary">₹{row.original.price}</span>
    },
    {
      accessorKey: 'isAvailable',
      header: 'Status',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Switch 
            checked={row.original.isAvailable} 
            onCheckedChange={async (v) => {
              await api.patch('/night-canteen/items/' + row.original.id, { isAvailable: v });
              toast.info(`${row.original.name} is now ${v ? 'Available' : 'Unavailable'}`);
            }}
          />
          <span className="text-sm font-medium">
            {row.original.isAvailable ? 'Live' : 'Hidden'}
          </span>
        </div>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button 
            size="icon" 
            variant="ghost" 
            className="w-8 h-8 rounded-sm"
            onClick={() => {
              setEditingItem(row.original);
              setIsDialogOpen(true);
            }}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            className="w-8 h-8 rounded-sm text-destructive hover:bg-destructive/10"
            onClick={() => handleDeleteItem(row.original.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ], []);

  return (
    <div className="  px-4 py-8 ">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Package className="w-8 h-8 text-primary" />
            Canteen Dashboard
          </h1>
          <p className="text-muted-foreground">Manage your night hunger squad from here.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-muted p-1 rounded-sm">
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
        <div className="p-6 rounded-sm border bg-card/50 flex items-center gap-4">
          <div className="p-3 rounded-sm bg-orange-500/10">
            <Clock className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pending Orders</p>
            <p className="text-2xl font-bold">{canteenStats.pending}</p>
          </div>
        </div>
        <div className="p-6 rounded-sm border bg-card/50 flex items-center gap-4">
          <div className="p-3 rounded-sm bg-primary/10">
            <Truck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Active Deliveries</p>
            <p className="text-2xl font-bold">{canteenStats.active}</p>
          </div>
        </div>
        <div className="p-6 rounded-sm border bg-card/50 flex items-center gap-4">
          <div className="p-3 rounded-sm bg-green-500/10">
            <IndianRupee className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Today&apos;s Sales</p>
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

          <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
            {['Pending', 'Confirmed', 'Out for Delivery', 'Delivered'].map((status) => (
              <div key={status} className="flex-1 min-w-[300px] bg-muted/30 rounded-sm p-4 flex flex-col h-[600px]">
                <div className="flex items-center justify-between mb-4 px-2">
                  <h3 className="font-bold text-lg">{status}</h3>
                  <Badge variant="secondary" className="rounded-full">{orders.filter(o => o.status === status).length}</Badge>
                </div>
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                  <AnimatePresence>
                    {orders.filter(o => o.status === status).map((order) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        key={order.id} 
                        className="p-4 rounded-sm border border-border bg-card shadow-sm hover:shadow-md transition-all flex flex-col gap-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-xs font-bold text-muted-foreground">#{order.id.slice(-6).toUpperCase()}</span>
                            <h4 className="font-bold">{order.studentName}</h4>
                          </div>
                          <Badge className={
                            order.status === 'Pending' ? 'bg-orange-500' :
                            order.status === 'Confirmed' ? 'bg-blue-500' :
                            order.status === 'Out for Delivery' ? 'bg-indigo-500' :
                            'bg-green-500'
                          }>
                            ₹{order.totalAmount}
                          </Badge>
                        </div>
                        
                        <p className="text-sm font-medium flex items-center gap-1 text-primary">
                          <MapPin className="w-3 h-3" /> {order.hostelRoom}
                        </p>

                        <div className="flex flex-wrap gap-1">
                          {order.items.map((it: any, idx: number) => (
                            <span key={idx} className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-medium">
                              {it.quantity}x {it.name}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex gap-2 mt-2">
                          {order.status === 'Pending' && (
                            <Button size="sm" onClick={() => updateOrderStatus(order.id, 'Confirmed')} className="flex-1 h-8 text-xs bg-blue-500 hover:bg-blue-600">Accept</Button>
                          )}
                          {order.status === 'Confirmed' && (
                            <Button size="sm" onClick={() => updateOrderStatus(order.id, 'Out for Delivery')} className="flex-1 h-8 text-xs bg-indigo-500 hover:bg-indigo-600">Dispatch</Button>
                          )}
                          {order.status === 'Out for Delivery' && (
                            <Button size="sm" onClick={() => updateOrderStatus(order.id, 'Delivered')} className="flex-1 h-8 text-xs bg-green-500 hover:bg-green-600">Complete</Button>
                          )}
                          {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                            <Button size="sm" variant="ghost" onClick={() => updateOrderStatus(order.id, 'Cancelled')} className="h-8 text-xs text-destructive hover:bg-destructive/10 px-2">Cancel</Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {orders.filter(o => o.status === status).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground/50 border border-dashed border-muted/50 rounded-sm">
                      <p className="text-sm">No orders</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
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

          <div className="overflow-hidden rounded-sm border border-border bg-card shadow-sm">
            <DataTable columns={columns} data={items} />
          </div>
        </div>
      )}
    </div>
  );
}

