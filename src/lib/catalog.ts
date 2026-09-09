import { prisma, isDatabaseConfigured } from './db';

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
}

export interface VariantData {
  id: string;
  productId: string;
  packSize: string;
  unit: string;
  price: number;
  stockQuantity: number;
  isAvailable: boolean;
}

export interface ProductData {
  id: string;
  name: string;
  categoryId: string;
  category?: CategoryData;
  description: string;
  quality: string;
  imageUrl: string;
  isActive: boolean;
  isFeatured: boolean;
  variants: VariantData[];
}

export interface ShopSettingsData {
  id: string;
  shopName: string;
  phone: string;
  whatsappNumber: string;
  address: string;
  openingHours: string;
  googleMapsUrl: string;
  logoUrl: string;
  aboutDescription: string;
  bannerText: string;
}

export const DEFAULT_SHOP_SETTINGS: ShopSettingsData = {
  id: 'default-settings',
  shopName: 'VANI MILK CENTER, GOPIVANIPALEM',
  phone: '7995597719',
  whatsappNumber: '917995597719',
  address: 'Gopivanipalem, Andhra Pradesh',
  openingHours: 'Morning 5:00 AM - Evening 10:00 PM',
  googleMapsUrl: 'https://maps.google.com/?q=Gopivanipalem',
  logoUrl: '/images/shop-logo.svg',
  aboutDescription:
    'Welcome to Vani Milk Center, Gopivanipalem. We provide 100% pure & natural, hygienically processed milk, curd, ghee, paneer, buttermilk, and lassi for daily families, functions, and bulk catering orders.',
  bannerText:
    '100% Pure & Natural Milk Products | Healthy Life Happy Life | Home Delivery: 7995597719',
};

export const DEFAULT_CATEGORIES: CategoryData[] = [
  { id: 'cat-milk', name: 'Milk', slug: 'milk', displayOrder: 1 },
  { id: 'cat-curd', name: 'Curd', slug: 'curd', displayOrder: 2 },
  { id: 'cat-buttermilk', name: 'Buttermilk', slug: 'buttermilk', displayOrder: 3 },
  { id: 'cat-lassi', name: 'Lassi', slug: 'lassi', displayOrder: 4 },
  { id: 'cat-other', name: 'Ghee & Extras', slug: 'other', displayOrder: 5 },
];

export const DEFAULT_PRODUCTS: ProductData[] = [
  {
    id: 'prod-milk',
    name: 'Fresh Farm Milk',
    categoryId: 'cat-milk',
    category: DEFAULT_CATEGORIES[0],
    description:
      '100% pure, wholesome cow and buffalo milk collected fresh twice daily. Natural taste and maximum cream content.',
    quality: 'Fresh Farm Quality Milk',
    imageUrl: '/images/products/fresh-milk.jpg',
    isActive: true,
    isFeatured: true,
    variants: [
      { id: 'var-milk-250', productId: 'prod-milk', packSize: '250 ml', unit: 'packet', price: 16, stockQuantity: 100, isAvailable: true },
      { id: 'var-milk-500', productId: 'prod-milk', packSize: '500 ml', unit: 'packet', price: 32, stockQuantity: 150, isAvailable: true },
      { id: 'var-milk-1l', productId: 'prod-milk', packSize: '1 Litre', unit: 'packet', price: 62, stockQuantity: 120, isAvailable: true },
    ],
  },
  {
    id: 'prod-curd',
    name: 'Traditional Thick Curd (Dahi)',
    categoryId: 'cat-curd',
    category: DEFAULT_CATEGORIES[1],
    description:
      'Rich, thick, naturally cultured curd prepared freshly every day. Ideal for daily lunch, family feasts, and large marriage ceremonies.',
    quality: 'Thick, Naturally Set Curd',
    imageUrl: '/images/products/fresh-curd.jpg',
    isActive: true,
    isFeatured: true,
    variants: [
      { id: 'var-curd-250', productId: 'prod-curd', packSize: '250 ml', unit: 'cup', price: 25, stockQuantity: 80, isAvailable: true },
      { id: 'var-curd-500', productId: 'prod-curd', packSize: '500 ml', unit: 'packet', price: 48, stockQuantity: 100, isAvailable: true },
      { id: 'var-curd-1l', productId: 'prod-curd', packSize: '1 Litre', unit: 'packet', price: 95, stockQuantity: 60, isAvailable: true },
      { id: 'var-curd-5kg', productId: 'prod-curd', packSize: '5 kg bucket', unit: 'bucket', price: 350, stockQuantity: 30, isAvailable: true },
      { id: 'var-curd-10kg', productId: 'prod-curd', packSize: '10 kg bucket', unit: 'bucket', price: 500, stockQuantity: 25, isAvailable: true },
      { id: 'var-curd-20kg', productId: 'prod-curd', packSize: '20 kg bucket', unit: 'bucket', price: 980, stockQuantity: 15, isAvailable: true },
    ],
  },
  {
    id: 'prod-buttermilk',
    name: 'Spiced Fresh Buttermilk (Chaas)',
    categoryId: 'cat-buttermilk',
    category: DEFAULT_CATEGORIES[2],
    description:
      'Traditional churned buttermilk infused with roasted cumin, fresh ginger, and green chillies. Light, digestive, and refreshing.',
    quality: 'Naturally Churned Fresh Buttermilk',
    imageUrl: '/images/products/buttermilk.jpg',
    isActive: true,
    isFeatured: true,
    variants: [
      { id: 'var-bm-250', productId: 'prod-buttermilk', packSize: '250 ml', unit: 'pouch', price: 15, stockQuantity: 80, isAvailable: true },
      { id: 'var-bm-500', productId: 'prod-buttermilk', packSize: '500 ml', unit: 'bottle', price: 25, stockQuantity: 60, isAvailable: true },
      { id: 'var-bm-1l', productId: 'prod-buttermilk', packSize: '1 Litre', unit: 'bottle', price: 45, stockQuantity: 40, isAvailable: true },
    ],
  },
  {
    id: 'prod-lassi',
    name: 'Sweet Creamy Lassi',
    categoryId: 'cat-lassi',
    category: DEFAULT_CATEGORIES[3],
    description:
      'Thick, sweet, creamy Punjabi style lassi topped with malai and cardamom aroma. Delicious anytime treat.',
    quality: 'Rich Malai Lassi',
    imageUrl: '/images/products/lassi.jpg',
    isActive: true,
    isFeatured: true,
    variants: [
      { id: 'var-lassi-250', productId: 'prod-lassi', packSize: '250 ml', unit: 'glass', price: 25, stockQuantity: 60, isAvailable: true },
      { id: 'var-lassi-500', productId: 'prod-lassi', packSize: '500 ml', unit: 'bottle', price: 45, stockQuantity: 50, isAvailable: true },
      { id: 'var-lassi-1l', productId: 'prod-lassi', packSize: '1 Litre', unit: 'bottle', price: 85, stockQuantity: 30, isAvailable: true },
    ],
  },
  {
    id: 'prod-paneer',
    name: 'Fresh Homemade Malai Paneer',
    categoryId: 'cat-other',
    category: DEFAULT_CATEGORIES[4],
    description:
      'Tender, ultra-soft paneer crafted daily from whole buffalo milk. High protein and melts in the mouth.',
    quality: '100% Pure Malai Paneer',
    imageUrl: '/images/products/fresh-paneer.jpg',
    isActive: true,
    isFeatured: false,
    variants: [
      { id: 'var-paneer-200', productId: 'prod-paneer', packSize: '200 g', unit: 'pack', price: 85, stockQuantity: 40, isAvailable: true },
      { id: 'var-paneer-500', productId: 'prod-paneer', packSize: '500 g', unit: 'pack', price: 200, stockQuantity: 30, isAvailable: true },
      { id: 'var-paneer-1kg', productId: 'prod-paneer', packSize: '1 kg', unit: 'block', price: 390, stockQuantity: 20, isAvailable: true },
    ],
  },
  {
    id: 'prod-ghee',
    name: 'Pure Desi Cow Ghee',
    categoryId: 'cat-other',
    category: DEFAULT_CATEGORIES[4],
    description:
      'Golden granular desi ghee prepared using traditional bilona method. Rich aroma, wholesome taste and high medicinal qualities.',
    quality: 'Pure Traditional Desi Ghee',
    imageUrl: '/images/products/desi-ghee.jpg',
    isActive: true,
    isFeatured: false,
    variants: [
      { id: 'var-ghee-250', productId: 'prod-ghee', packSize: '250 ml', unit: 'jar', price: 220, stockQuantity: 30, isAvailable: true },
      { id: 'var-ghee-500', productId: 'prod-ghee', packSize: '500 ml', unit: 'jar', price: 420, stockQuantity: 25, isAvailable: true },
      { id: 'var-ghee-1l', productId: 'prod-ghee', packSize: '1 Litre', unit: 'tin', price: 820, stockQuantity: 20, isAvailable: true },
    ],
  },
  {
    id: 'prod-chapatis',
    name: 'Ajay Chapatis',
    categoryId: 'cat-other',
    category: DEFAULT_CATEGORIES[4],
    description:
      'Ready to eat delicious home-made soft & tasty chapatis. Just heat and eat. 100% vegetarian, no artificial colours or preservatives.',
    quality: '100% Veg, Home Made',
    imageUrl: '/images/products/ajay-chapatis.jpg',
    isActive: true,
    isFeatured: true,
    variants: [
      { id: 'var-chap-5', productId: 'prod-chapatis', packSize: '5 Pieces Pack', unit: 'packet', price: 40, stockQuantity: 50, isAvailable: true },
      { id: 'var-chap-10', productId: 'prod-chapatis', packSize: '10 Pieces Pack', unit: 'packet', price: 75, stockQuantity: 50, isAvailable: true },
    ],
  },
  {
    id: 'prod-sweet-bun',
    name: "Nanda's Premium Fruit Sweet Bun",
    categoryId: 'cat-other',
    category: DEFAULT_CATEGORIES[4],
    description:
      'Fresh and soft bakery sweet buns generously loaded with tutti-frutti pieces. Delicious accompaniment with hot milk, coffee, or tea.',
    quality: 'Fresh Bakery Quality',
    imageUrl: '/images/products/fruit-sweet-bun.jpg',
    isActive: true,
    isFeatured: true,
    variants: [
      { id: 'var-bun-6', productId: 'prod-sweet-bun', packSize: '6 Pieces Pack', unit: 'box', price: 50, stockQuantity: 40, isAvailable: true },
    ],
  },
  {
    id: 'prod-curd-bucket',
    name: 'Curd Buckets (Functions & Marriages)',
    categoryId: 'cat-curd',
    category: DEFAULT_CATEGORIES[1],
    description:
      'Rich, thick, authentic curd packed in sturdy food-grade buckets for weddings, poojas, ceremonies, and catering.',
    quality: 'Function Grade Thick Curd',
    imageUrl: '/images/products/curd-bucket.jpg',
    isActive: true,
    isFeatured: true,
    variants: [
      { id: 'var-cb-5kg', productId: 'prod-curd-bucket', packSize: '5 kg bucket', unit: 'bucket', price: 350, stockQuantity: 30, isAvailable: true },
      { id: 'var-cb-10kg', productId: 'prod-curd-bucket', packSize: '10 kg bucket', unit: 'bucket', price: 500, stockQuantity: 25, isAvailable: true },
      { id: 'var-cb-20kg', productId: 'prod-curd-bucket', packSize: '20 kg bucket', unit: 'bucket', price: 980, stockQuantity: 15, isAvailable: true },
    ],
  },
];

export async function getShopSettings(): Promise<ShopSettingsData> {
  if (!isDatabaseConfigured()) {
    return DEFAULT_SHOP_SETTINGS;
  }
  try {
    const settings = await prisma.shopSettings.findUnique({
      where: { id: 'default-settings' },
    });
    if (settings) {
      return settings as ShopSettingsData;
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Database query for shop settings failed, using defaults:', (error as any)?.message || error);
    }
  }
  return DEFAULT_SHOP_SETTINGS;
}

export async function getFeaturedProductsAndCategories(): Promise<{
  products: ProductData[];
  categories: CategoryData[];
}> {
  if (!isDatabaseConfigured()) {
    const featured = DEFAULT_PRODUCTS.filter((p) => p.isFeatured);
    return {
      products: featured.length > 0 ? featured : DEFAULT_PRODUCTS,
      categories: DEFAULT_CATEGORIES,
    };
  }

  try {
    const [dbProducts, dbCategories] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        include: {
          category: true,
          variants: {
            orderBy: { price: 'asc' },
          },
        },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.category.findMany({
        orderBy: { displayOrder: 'asc' },
      }),
    ]);

    if (dbProducts && dbProducts.length > 0) {
      return {
        products: dbProducts as unknown as ProductData[],
        categories: dbCategories && dbCategories.length > 0 ? (dbCategories as CategoryData[]) : DEFAULT_CATEGORIES,
      };
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Database query for featured products failed, using defaults:', (error as any)?.message || error);
    }
  }

  // Graceful fallback: return top featured defaults
  const featured = DEFAULT_PRODUCTS.filter((p) => p.isFeatured);
  return {
    products: featured.length > 0 ? featured : DEFAULT_PRODUCTS,
    categories: DEFAULT_CATEGORIES,
  };
}

function getFilteredFallbackProducts(categorySlug?: string, search?: string) {
  let filtered = [...DEFAULT_PRODUCTS];

  if (categorySlug && categorySlug !== 'all') {
    filtered = filtered.filter((p) => p.category?.slug === categorySlug);
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.quality.toLowerCase().includes(q) ||
        p.variants.some((v) => v.packSize.toLowerCase().includes(q))
    );
  }

  return {
    products: filtered,
    categories: DEFAULT_CATEGORIES,
  };
}

export async function getAllProductsAndCategories(
  categorySlug?: string,
  search?: string
): Promise<{
  products: ProductData[];
  categories: CategoryData[];
}> {
  if (!isDatabaseConfigured()) {
    return getFilteredFallbackProducts(categorySlug, search);
  }

  try {
    const whereClause: any = { isActive: true };

    if (categorySlug && categorySlug !== 'all') {
      whereClause.category = { slug: categorySlug };
    }

    if (search && search.trim()) {
      const query = search.trim();
      whereClause.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { quality: { contains: query, mode: 'insensitive' } },
      ];
    }

    const [dbProducts, dbCategories] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        include: {
          category: true,
          variants: {
            orderBy: { price: 'asc' },
          },
        },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.category.findMany({
        orderBy: { displayOrder: 'asc' },
      }),
    ]);

    if (dbProducts && dbProducts.length > 0) {
      return {
        products: dbProducts as unknown as ProductData[],
        categories: dbCategories && dbCategories.length > 0 ? (dbCategories as CategoryData[]) : DEFAULT_CATEGORIES,
      };
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Database query for all products failed, using defaults:', (error as any)?.message || error);
    }
  }

  return getFilteredFallbackProducts(categorySlug, search);
}

export function findFallbackVariant(variantId: string): { variant: VariantData; product: ProductData } | null {
  for (const p of DEFAULT_PRODUCTS) {
    const v = p.variants.find((item) => item.id === variantId);
    if (v) {
      return { variant: v, product: p };
    }
  }
  return null;
}
