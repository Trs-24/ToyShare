export interface User {
  id: string;
  email: string;
  name: string | null;
  isVerified?: boolean;
  image?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  role?: 'USER' | 'ADMIN';
  status?: 'active' | 'blocked' | 'pending';
  phone?: string | null;
  city?: string | null;
  rating?: number;
  avatarUrl?: string | null;
  _count?: {
    items?: number;
    sentExchanges?: number;
    receivedExchanges?: number;
  };
}

export interface Item {
  id: string;
  title: string;
  description: string;
  condition: string;
  category: string | null;
  isAvailable: boolean;
  gender: string | null;
  age: string | null;
  type: string | null;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  owner?: User;
  photos: { id: string; url: string }[];
  // Extended properties from API
  exchangeStatus?: string;
  wishlist?: string | null;
}

export interface Exchange {
  id: string;
  status: 'PROPOSED' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  initiatorId: string;
  receiverId: string;
  initiator?: User;
  receiver?: User;
  itemOfferedId?: string;
  itemRequestedId?: string;
  itemOffered?: Item;
  itemRequested?: Item;
  meetingDate?: string | null;
  postOffice?: string | null;
  shippingNote?: string | null;
  ratings?: Rating[];
  messages?: Message[];
  // Completion status
  initiatorCompleted?: boolean;
  receiverCompleted?: boolean;
  initiatorShippingConfirmed?: boolean;
  receiverShippingConfirmed?: boolean;
}

export interface Message {
  id: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  senderId: string;
  exchangeId: string;
  sender?: User;
}

export interface Rating {
  id: string;
  score: number;
  comment: string | null;
  fromUserId: string;
  toUserId: string;
  exchangeId: string;
  createdAt: string;
  fromUser?: User;
}

// ── API Payloads ────────────────────────────────────────────────────────

export interface RegisterPayload {
  email: string;
  password?: string;
  name: string;
  phone: string;
  city?: string;
  country?: string;
  defaultPostOffice?: string;
}

export interface CreateItemPayload {
  title: string;
  description: string;
  condition: string;
  category?: string;
  gender?: string;
  age?: string;
  type?: string;
  wishlist?: string;
  photos?: string[];
}

export interface CreateExchangePayload {
  offeredItemId: string;
  requestedItemId: string;
  note?: string;
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  city?: string;
  country?: string;
  defaultPostOffice?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalItems: number;
  activeExchanges: number;
  completedExchanges: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
