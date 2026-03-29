'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Loader2,
  UtensilsCrossed,
  Search,
  Filter
} from 'lucide-react';
import { collection, query, getDocs, addDoc, serverTimestamp, where, onSnapshot } from '@/lib/dataClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ImageWithBlur } from '@/components/ui/image-with-blur';
import { Skeleton } from '@/components/ui/skeleton';
import { usePermissions } from '@/hooks/usePermissions';

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

interface CartItem extends CanteenItem {
  quantity: number;
}

export default function NightCanteen() {
  const { user } = usePermissions();
  const [items, setItems] = useState<CanteenItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [hostelRoom, setHostelRoom] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [view, setView] = useState<'menu' | 'orders'>('menu');
  const [myOrders, setMyOrders] = useState<any[]>([]);

  const categories = ['All', 'Snacks', 'Drinks', 'Meals', 'Desserts'];

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const q = query(collection(({} as any), 'canteenItems'), where('isAvailable', '==', true));
        const snapshot = await getDocs(q);
        setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CanteenItem)));
      } catch (error) {
        console.error('Error fetching canteen items:', error);
        toast.error('Failed to load menu');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  useEffect(() => {
    if (view === 'orders' && user) {
      const q = query(
        collection(({} as any), 'canteenOrders'),
        where('studentId', '==', user.uid)
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate()
        }));
        setMyOrders(orders.sort((a, b) => b.timestamp - a.timestamp));
      });

      return () => unsubscribe();
    }
  }, [view, user]);

  const addToCart = (item: CanteenItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    toast.success(`${item.name} added to cart`);
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === itemId) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const placeOrder = async () => {
    if (!hostelRoom.trim()) {
      toast.error('Please enter your hostel and room number');
      return;
    }

    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsPlacingOrder(true);
    try {
      const orderData = {
        studentId: user?.uid,
        studentName: user?.fullName || user?.name || user?.email?.split('@')[0],
        hostelRoom,
        items: cart.map(i => ({
          itemId: i.id,
          name: i.name,
          quantity: i.quantity,
          price: i.price
        })),
        totalAmount: cartTotal,
        status: 'Pending',
        timestamp: serverTimestamp()
      };

      await addDoc(collection(({} as any), 'canteenOrders'), orderData);
      setCart([]);
      setHostelRoom('');
      toast.success('Order placed successfully!');
      setView('orders');
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <UtensilsCrossed className="w-8 h-8 text-primary" />
            Night Canteen
          </h1>
          <p className="text-muted-foreground">Late night cravings sorted! Ordered straight to your room.</p>
        </div>

        <div className="flex items-center gap-2 bg-muted p-1 rounded-lg self-start">
          <Button 
            variant={view === 'menu' ? 'secondary' : 'ghost'} 
            onClick={() => setView('menu')}
            className="rounded-md"
          >
            Menu
          </Button>
          <Button 
            variant={view === 'orders' ? 'secondary' : 'ghost'} 
            onClick={() => setView('orders')}
            className="rounded-md"
          >
            My Orders
          </Button>
        </div>
      </div>

      {view === 'menu' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search for items..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map(cat => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                    className="whitespace-nowrap"
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                   <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden">
                      <Skeleton className="h-48 w-full" />
                      <div className="p-4 space-y-3">
                         <div className="flex justify-between">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-6 w-12" />
                         </div>
                         <Skeleton className="h-4 w-full" />
                         <Skeleton className="h-10 w-full rounded-md" />
                      </div>
                   </div>
                ))}
              </div>
            ) : filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredItems.map((item) => (
                  <motion.div
                    layout
                    key={item.id}
                    className="group relative overflow-hidden rounded-2xl border border-border bg-card hover:border-primary/50 transition-all card-shadow"
                  >
                    <div className="aspect-[16/9] overflow-hidden bg-muted relative">
                      <ImageWithBlur 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        fallbackColor="bg-muted"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="p-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <span className="text-primary font-bold whitespace-nowrap">₹{item.price}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {item.description}
                      </p>
                      <Button 
                        onClick={() => addToCart(item)}
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm"
                        variant="secondary"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed rounded-2xl border-muted">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No items found</h3>
                <p className="text-muted-foreground">Try a different search or category</p>
              </div>
            )}
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 rounded-2xl border border-border bg-card p-6 shadow-xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
              <div className="flex items-center gap-2 mb-6">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">Your Cart</h2>
                {cart.length > 0 && (
                  <Badge variant="secondary" className="ml-auto rounded-full">
                    {cart.length}
                  </Badge>
                )}
              </div>

              {cart.length > 0 ? (
                <>
                  <div className="space-y-4 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-border">
                          <ImageWithBlur 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover" 
                          /> 
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <p className="text-primary text-sm">₹{item.price}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <button 
                              onClick={() => updateQuantity(item.id, -1)}
                              className="p-1 rounded-md hover:bg-muted"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, 1)}
                              className="p-1 rounded-md hover:bg-muted"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="ml-auto text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <MapPin className="w-3 h-3" /> Delivery Address
                      </label>
                      <Input
                        placeholder="Hostel Name & Room No (e.g. H4, 302)"
                        value={hostelRoom}
                        onChange={(e) => setHostelRoom(e.target.value)}
                        className="bg-muted/50"
                      />
                    </div>

                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground">Total Amount</span>
                      <span className="text-2xl font-bold">₹{cartTotal}</span>
                    </div>

                    <Button 
                      onClick={placeOrder} 
                      className="w-full h-12 text-lg font-bold"
                      disabled={isPlacingOrder}
                      variant="gradient"
                    >
                      {isPlacingOrder ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Placing Order...
                        </>
                      ) : (
                        'Confirm Order'
                      )}
                    </Button>
                    <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest">
                      Cash on Delivery Only
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold">Hungry?</h3>
                    <p className="text-sm text-muted-foreground">Your cart is as empty as your stomach!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="w-6 h-6 text-primary" />
            Order History
          </h2>
          
          {myOrders.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {myOrders.map((order) => (
                <div key={order.id} className="p-6 rounded-2xl border border-border bg-card card-shadow relative overflow-hidden hover:border-primary/30 transition-all">
                  <div className="absolute top-0 right-0 p-4">
                    <Badge className={
                      order.status === 'Pending' ? 'bg-orange-500/10 text-orange-500' :
                      order.status === 'Delivered' ? 'bg-green-500/10 text-green-500' :
                      order.status === 'Cancelled' ? 'bg-red-500/10 text-red-500' :
                      'bg-primary/10 text-primary'
                    }>
                      {order.status}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Order #{order.id.slice(-6).toUpperCase()}</p>
                      <p className="text-sm flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3" /> {order.timestamp?.toLocaleString() || 'Processsing...'}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {order.items.map((item: any, idx: number) => (
                        <Badge key={idx} variant="secondary">
                          {item.quantity}x {item.name}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex justify-between items-end pt-2 border-t border-border mt-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Delivery to</p>
                        <p className="font-bold">{order.hostelRoom}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Total Paid</p>
                        <p className="text-xl font-bold text-primary">₹{order.totalAmount}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border-2 border-dashed border-muted rounded-3xl">
              <Clock className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-bold">No orders yet</h3>
              <p className="text-muted-foreground mt-2">Hunger is a choice. Make the right one.</p>
              <Button onClick={() => setView('menu')} className="mt-6">
                Browse Menu
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
