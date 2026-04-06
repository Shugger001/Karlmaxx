export type UserRole = "admin" | "user";

export type UserProfile = {
  email: string | null;
  displayName: string | null;
  role: UserRole;
  createdAt?: string | null;
};

/** Customer row in admin Customers view (maps `public.profiles`). */
export type CustomerProfile = {
  id: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  createdAt: string | null;
};

export type ProductColorOption = {
  name: string;
  hex?: string;
  image?: string;
};

export type Product = {
  id: string;
  name: string;
  /** Manufacturer / house (e.g. Rolex). Used to group watches on the shop grid. */
  brand: string;
  price: number;
  category: string;
  images: string[];
  description: string;
  stock: number;
  featured: boolean;
  colorOptions: ProductColorOption[];
  createdAt: string | null;
};

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  /** When set, groups this line separately from other colors of the same product. */
  color?: string;
};

export type OrderStatus = "pending" | "paid";

/** Shipment pipeline (separate from payment `status`). */
export type FulfillmentStage =
  | "placed"
  | "preparing"
  | "shipped"
  | "out_for_delivery"
  | "delivered";

export type Order = {
  id: string;
  userId?: string | null;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  paystackReference?: string | null;
  createdAt: string | null;
  customerEmail?: string | null;
  fulfillmentStage: FulfillmentStage;
  carrier?: string | null;
  trackingNumber?: string | null;
  trackingToken?: string | null;
};
