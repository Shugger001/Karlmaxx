import { isFulfillmentStage } from "@/lib/fulfillment";
import type {
  CartItem,
  CustomerProfile,
  FulfillmentStage,
  Order,
  Product,
  ProductColorOption,
  UserRole,
} from "@/types";
import { localCatalogImagePaths } from "@/lib/localCatalogImages";
import { picsumCatalogImages, preferStableImageUrl } from "@/lib/stableProductImages";

function parseCartItems(raw: unknown): CartItem[] | null {
  if (!Array.isArray(raw)) return null;
  const out: CartItem[] = [];
  for (const x of raw) {
    if (!x || typeof x !== "object") return null;
    const o = x as Record<string, unknown>;
    if (
      typeof o.productId !== "string" ||
      typeof o.name !== "string" ||
      typeof o.price !== "number" ||
      typeof o.quantity !== "number" ||
      typeof o.image !== "string"
    ) {
      return null;
    }
    out.push({
      productId: o.productId,
      name: o.name,
      price: o.price,
      quantity: o.quantity,
      image: o.image,
      ...(typeof o.color === "string" && o.color ? { color: o.color } : {}),
    });
  }
  return out;
}

function num(v: unknown): number {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string") {
    const n = parseFloat(v);
    return Number.isNaN(n) ? NaN : n;
  }
  return NaN;
}

function parseColorOptions(raw: unknown): ProductColorOption[] {
  if (!Array.isArray(raw)) return [];
  const out: ProductColorOption[] = [];
  for (const x of raw) {
    if (!x || typeof x !== "object") continue;
    const o = x as Record<string, unknown>;
    if (typeof o.name !== "string" || !o.name.trim()) continue;
    out.push({
      name: o.name.trim(),
      ...(typeof o.hex === "string" ? { hex: o.hex } : {}),
      ...(typeof o.image === "string" ? { image: o.image } : {}),
    });
  }
  return out;
}

export function mapProductRow(row: Record<string, unknown>): Product | null {
  const id = row.id;
  const name = row.name;
  const brandRaw = row.brand;
  const brand = typeof brandRaw === "string" ? brandRaw : "";
  const price = num(row.price);
  const category = row.category;
  const images = row.images;
  const description = row.description;
  const stockRaw = row.stock;
  const featured = row.featured;
  const createdAt = row.created_at;
  const colorRaw = row.color_options;
  const stock =
    typeof stockRaw === "number" ? stockRaw : Number(stockRaw);
  if (
    typeof id !== "string" ||
    typeof name !== "string" ||
    typeof category !== "string" ||
    Number.isNaN(price) ||
    !Array.isArray(images) ||
    Number.isNaN(stock) ||
    typeof featured !== "boolean"
  ) {
    return null;
  }

  const localGallery = localCatalogImagePaths(category, id);

  let catalogImages = images
    .filter((x): x is string => typeof x === "string" && x.trim() !== "")
    .map((url, i) => preferStableImageUrl(url, id, `catalog-${i}`));
  if (catalogImages.length === 0) {
    catalogImages = picsumCatalogImages(id);
  }
  if (localGallery) {
    catalogImages = localGallery;
  }

  /** Only attach `image` when the DB provides a URL per colour — no placeholder or pool rotation. */
  const colorOptions = parseColorOptions(colorRaw).map((c, i) => {
    const raw = c.image?.trim();
    const base = {
      name: c.name,
      ...(c.hex ? { hex: c.hex } : {}),
    };
    if (!raw) return base;
    return {
      ...base,
      image: preferStableImageUrl(raw, id, `color-${c.name}-${i}`),
    };
  });

  return {
    id,
    name,
    brand,
    price,
    category,
    images: catalogImages,
    description: typeof description === "string" ? description : "",
    stock,
    featured,
    colorOptions,
    createdAt: typeof createdAt === "string" ? createdAt : null,
  };
}

export function mapProfileRow(row: Record<string, unknown>): CustomerProfile | null {
  const id = row.id;
  const email = row.email;
  const displayName = row.display_name;
  const roleRaw = row.role;
  const createdAt = row.created_at;
  if (typeof id !== "string") return null;
  const role: UserRole = roleRaw === "admin" ? "admin" : "user";
  return {
    id,
    email: typeof email === "string" ? email : null,
    displayName: typeof displayName === "string" ? displayName : null,
    role,
    createdAt: typeof createdAt === "string" ? createdAt : null,
  };
}

export function mapOrderRow(row: Record<string, unknown>): Order | null {
  const id = row.id;
  const items = parseCartItems(row.items);
  const total = num(row.total);
  const status = row.status;
  const userId = row.user_id;
  const paystackReference = row.paystack_reference;
  const createdAt = row.created_at;
  const customerEmail = row.customer_email;
  const fulfillmentStageRaw = row.fulfillment_stage;
  const carrier = row.carrier;
  const trackingNumber = row.tracking_number;
  const trackingToken = row.tracking_token;
  const fulfillmentStage: FulfillmentStage =
    typeof fulfillmentStageRaw === "string" && isFulfillmentStage(fulfillmentStageRaw)
      ? fulfillmentStageRaw
      : "placed";
  if (
    typeof id !== "string" ||
    !items ||
    Number.isNaN(total) ||
    (status !== "pending" && status !== "paid")
  ) {
    return null;
  }
  return {
    id,
    userId:
      typeof userId === "string" ? userId : userId === null ? null : undefined,
    items,
    total,
    status,
    paystackReference:
      typeof paystackReference === "string" ? paystackReference : null,
    createdAt: typeof createdAt === "string" ? createdAt : null,
    customerEmail:
      typeof customerEmail === "string" ? customerEmail : null,
    fulfillmentStage,
    carrier: typeof carrier === "string" ? carrier : null,
    trackingNumber:
      typeof trackingNumber === "string" ? trackingNumber : null,
    trackingToken:
      typeof trackingToken === "string" ? trackingToken : null,
  };
}
