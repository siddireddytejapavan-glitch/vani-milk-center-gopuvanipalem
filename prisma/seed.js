const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Seed Admin User
  const adminEmail = process.env.ADMIN_EMAIL || 'siddreddylakshmankumar@gmail.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'VANI@MILK';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      name: 'Lakshman Kumar Siddireddy',
      role: 'ADMIN',
    },
    create: {
      name: 'Lakshman Kumar Siddireddy',
      email: adminEmail,
      passwordHash,
      role: 'ADMIN',
    },
  });
  console.log(`Admin user ready: ${admin.email}`);

  // 2. Seed Shop Settings
  const whatsappNumber = process.env.SHOP_WHATSAPP_NUMBER || '917995597719';
  await prisma.shopSettings.upsert({
    where: { id: 'default-settings' },
    update: {
      shopName: 'VANI MILK CENTER, GOPIVANIPALEM',
      phone: '7995597719',
      whatsappNumber: whatsappNumber,
      address: 'Gopivanipalem, Andhra Pradesh',
      openingHours: 'Morning 5:00 AM - Evening 10:00 PM',
      googleMapsUrl: 'https://maps.google.com/?q=Gopivanipalem',
      logoUrl: '/images/shop-logo.svg',
      aboutDescription: 'Welcome to Vani Milk Center, Gopivanipalem. We provide 100% pure & natural, hygienically processed milk, curd, ghee, paneer, buttermilk, and lassi for daily families, functions, and bulk catering orders.',
      bannerText: '100% Pure & Natural Milk Products | Healthy Life Happy Life | Home Delivery: 7995597719',
    },
    create: {
      id: 'default-settings',
      shopName: 'VANI MILK CENTER, GOPIVANIPALEM',
      phone: '7995597719',
      whatsappNumber: whatsappNumber,
      address: 'Gopivanipalem, Andhra Pradesh',
      openingHours: 'Morning 5:00 AM - Evening 10:00 PM',
      googleMapsUrl: 'https://maps.google.com/?q=Gopivanipalem',
      logoUrl: '/images/shop-logo.svg',
      aboutDescription: 'Welcome to Vani Milk Center, Gopivanipalem. We provide 100% pure & natural, hygienically processed milk, curd, ghee, paneer, buttermilk, and lassi for daily families, functions, and bulk catering orders.',
      bannerText: '100% Pure & Natural Milk Products | Healthy Life Happy Life | Home Delivery: 7995597719',
    },
  });
  console.log('Shop settings seeded.');

  // 3. Seed Categories
  const categories = [
    { name: 'Milk', slug: 'milk', displayOrder: 1 },
    { name: 'Curd', slug: 'curd', displayOrder: 2 },
    { name: 'Buttermilk', slug: 'buttermilk', displayOrder: 3 },
    { name: 'Lassi', slug: 'lassi', displayOrder: 4 },
    { name: 'Other', slug: 'other', displayOrder: 5 },
  ];

  const categoryMap = {};
  for (const cat of categories) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, displayOrder: cat.displayOrder },
      create: { name: cat.name, slug: cat.slug, displayOrder: cat.displayOrder },
    });
    categoryMap[cat.slug] = record.id;
  }
  console.log('Categories seeded.');

  // 4. Seed Products with Variants
  const productsData = [
    {
      name: 'Fresh Farm Milk',
      slugCategory: 'milk',
      description: '100% pure, wholesome cow and buffalo milk collected fresh twice daily. Natural taste and maximum cream content.',
      quality: 'Fresh Farm Quality Milk',
      imageUrl: '/images/products/fresh-milk.jpg',
      isFeatured: true,
      variants: [
        { packSize: '250 ml', unit: 'packet', price: 16, stockQuantity: 100, isAvailable: true },
        { packSize: '500 ml', unit: 'packet', price: 32, stockQuantity: 150, isAvailable: true },
        { packSize: '1 Litre', unit: 'packet', price: 62, stockQuantity: 120, isAvailable: true },
      ],
    },
    {
      name: 'Traditional Thick Curd (Dahi)',
      slugCategory: 'curd',
      description: 'Rich, thick, naturally cultured curd prepared freshly every day. Ideal for daily lunch, family feasts, and large marriage ceremonies.',
      quality: 'Thick, Naturally Set Curd',
      imageUrl: '/images/products/fresh-curd.jpg',
      isFeatured: true,
      variants: [
        { packSize: '250 ml', unit: 'cup', price: 25, stockQuantity: 80, isAvailable: true },
        { packSize: '500 ml', unit: 'packet', price: 48, stockQuantity: 100, isAvailable: true },
        { packSize: '1 Litre', unit: 'packet', price: 95, stockQuantity: 60, isAvailable: true },
        { packSize: '5 kg bucket', unit: 'bucket', price: 350, stockQuantity: 30, isAvailable: true },
        { packSize: '10 kg bucket', unit: 'bucket', price: 500, stockQuantity: 25, isAvailable: true },
        { packSize: '20 kg bucket', unit: 'bucket', price: 980, stockQuantity: 15, isAvailable: true },
      ],
    },
    {
      name: 'Spiced Fresh Buttermilk (Chaas)',
      slugCategory: 'buttermilk',
      description: 'Traditional churned buttermilk infused with roasted cumin, fresh ginger, and green chillies. Light, digestive, and refreshing.',
      quality: 'Naturally Churned Fresh Buttermilk',
      imageUrl: '/images/products/buttermilk.jpg',
      isFeatured: true,
      variants: [
        { packSize: '250 ml', unit: 'pouch', price: 15, stockQuantity: 80, isAvailable: true },
        { packSize: '500 ml', unit: 'bottle', price: 25, stockQuantity: 60, isAvailable: true },
        { packSize: '1 Litre', unit: 'bottle', price: 45, stockQuantity: 40, isAvailable: true },
      ],
    },
    {
      name: 'Sweet Creamy Lassi',
      slugCategory: 'lassi',
      description: 'Thick, sweet, creamy Punjabi style lassi topped with malai and cardamom aroma. Delicious anytime treat.',
      quality: 'Rich Malai Lassi',
      imageUrl: '/images/products/lassi.jpg',
      isFeatured: true,
      variants: [
        { packSize: '250 ml', unit: 'glass', price: 25, stockQuantity: 60, isAvailable: true },
        { packSize: '500 ml', unit: 'bottle', price: 45, stockQuantity: 50, isAvailable: true },
        { packSize: '1 Litre', unit: 'bottle', price: 85, stockQuantity: 30, isAvailable: true },
      ],
    },
    {
      name: 'Fresh Homemade Malai Paneer',
      slugCategory: 'other',
      description: 'Tender, ultra-soft paneer crafted daily from whole buffalo milk. High protein and melts in the mouth.',
      quality: '100% Pure Malai Paneer',
      imageUrl: '/images/products/fresh-paneer.jpg',
      isFeatured: false,
      variants: [
        { packSize: '200 g', unit: 'pack', price: 85, stockQuantity: 40, isAvailable: true },
        { packSize: '500 g', unit: 'pack', price: 200, stockQuantity: 30, isAvailable: true },
        { packSize: '1 kg', unit: 'block', price: 390, stockQuantity: 20, isAvailable: true },
      ],
    },
    {
      name: 'Pure Desi Cow Ghee',
      slugCategory: 'other',
      description: 'Golden granular desi ghee prepared using traditional bilona method. Rich aroma, wholesome taste and high medicinal qualities.',
      quality: 'Pure Traditional Desi Ghee',
      imageUrl: '/images/products/desi-ghee.jpg',
      isFeatured: false,
      variants: [
        { packSize: '250 ml', unit: 'jar', price: 220, stockQuantity: 30, isAvailable: true },
        { packSize: '500 ml', unit: 'jar', price: 420, stockQuantity: 25, isAvailable: true },
        { packSize: '1 Litre', unit: 'tin', price: 820, stockQuantity: 20, isAvailable: true },
      ],
    },
    {
      name: 'Ajay Chapatis',
      slugCategory: 'other',
      description: 'Ready to eat delicious home-made soft & tasty chapatis. Just heat and eat. 100% vegetarian, no artificial colours or preservatives.',
      quality: '100% Veg, Home Made',
      imageUrl: '/images/products/ajay-chapatis.jpg',
      isFeatured: true,
      variants: [
        { packSize: '5 Pieces Pack', unit: 'packet', price: 40, stockQuantity: 50, isAvailable: true },
        { packSize: '10 Pieces Pack', unit: 'packet', price: 75, stockQuantity: 50, isAvailable: true },
      ],
    },
    {
      name: "Nanda's Premium Fruit Sweet Bun",
      slugCategory: 'other',
      description: 'Fresh and soft bakery sweet buns generously loaded with tutti-frutti pieces. Delicious accompaniment with hot milk, coffee, or tea.',
      quality: 'Fresh Bakery Quality',
      imageUrl: '/images/products/fruit-sweet-bun.jpg',
      isFeatured: true,
      variants: [
        { packSize: '6 Pieces Pack', unit: 'box', price: 50, stockQuantity: 40, isAvailable: true },
      ],
    },
    {
      name: 'Curd Buckets (Functions & Marriages)',
      slugCategory: 'curd',
      description: 'Rich, thick, authentic curd packed in sturdy food-grade buckets for weddings, poojas, ceremonies, and catering.',
      quality: 'Function Grade Thick Curd',
      imageUrl: '/images/products/curd-bucket.jpg',
      isFeatured: true,
      variants: [
        { packSize: '5 kg bucket', unit: 'bucket', price: 350, stockQuantity: 30, isAvailable: true },
        { packSize: '10 kg bucket', unit: 'bucket', price: 500, stockQuantity: 25, isAvailable: true },
        { packSize: '20 kg bucket', unit: 'bucket', price: 980, stockQuantity: 15, isAvailable: true },
      ],
    },
  ];

  for (const prod of productsData) {
    let existing = await prisma.product.findFirst({
      where: { name: prod.name },
      include: { variants: true },
    });

    if (!existing) {
      existing = await prisma.product.create({
        data: {
          name: prod.name,
          categoryId: categoryMap[prod.slugCategory],
          description: prod.description,
          quality: prod.quality,
          imageUrl: prod.imageUrl,
          isFeatured: prod.isFeatured,
          isActive: true,
        },
      });
      console.log(`Created product: ${prod.name}`);
    }

    // Ensure variants exist
    for (const v of prod.variants) {
      const existingVariant = await prisma.productVariant.findFirst({
        where: {
          productId: existing.id,
          packSize: v.packSize,
        },
      });

      if (!existingVariant) {
        await prisma.productVariant.create({
          data: {
            productId: existing.id,
            packSize: v.packSize,
            unit: v.unit,
            price: v.price,
            stockQuantity: v.stockQuantity,
            isAvailable: v.isAvailable,
          },
        });
      }
    }
  }

  console.log('Sample products and variants successfully seeded.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
