export interface Seller {
  id: string;
  name: string;
  avatar?: string;
  studentProfile?: { phone?: string };
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  images: string[];
  status: string;
  sellerId: string;
  seller: Seller;
  _count?: { bookmarks: number };
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
  sender: { id: string; name: string; avatar?: string };
}

export interface Chat {
  id: string;
  listingId: string;
  buyerId: string;
  listing: { id: string; title: string; images: string[]; price: number; sellerId: string };
  buyer: { id: string; name: string; avatar?: string };
  messages: ChatMessage[];
  updatedAt: string;
}
