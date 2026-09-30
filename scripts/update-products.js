const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateDB() {
  // 1. Update ShopSettings
  await prisma.shopSettings.updateMany({
    data: {
      openingHours: 'Morning 5:00 AM - Evening 10:00 PM',
    },
  });
  console.log('ShopSettings openingHours updated to Morning 5:00 AM - Evening 10:00 PM');

  // 2. Update FAT MILK & vani curd images
  await prisma.product.updateMany({
    where: { name: 'FAT MILK' },
    data: { imageUrl: '/images/products/fat-milk.jpg' }
  });
  await prisma.product.updateMany({
    where: { name: 'vani curd' },
    data: { imageUrl: '/images/products/vani-curd.jpg' }
  });
  console.log('FAT MILK and vani curd images updated.');

  // 3. Find or create Other category
  let otherCat = await prisma.category.findUnique({ where: { slug: 'other' } });
  if (!otherCat) {
    otherCat = await prisma.category.create({
      data: { name: 'Other', slug: 'other', displayOrder: 5 }
    });
  }

  // 4. Add or update Ajay Chapatis
  let chapatis = await prisma.product.findFirst({ where: { name: 'Ajay Chapatis' } });
  if (!chapatis) {
    chapatis = await prisma.product.create({
      data: {
        name: 'Ajay Chapatis',
        categoryId: otherCat.id,
        description: 'Ready to eat delicious home-made soft & tasty chapatis. Just heat and eat. 100% vegetarian, no artificial colours or preservatives.',
        quality: '100% Veg, Home Made',
        imageUrl: '/images/products/ajay-chapatis.jpg',
        isActive: true,
        isFeatured: true,
        variants: {
          create: [
            { packSize: '5 Pieces Pack', unit: 'packet', price: 40, stockQuantity: 50, isAvailable: true },
            { packSize: '10 Pieces Pack', unit: 'packet', price: 75, stockQuantity: 50, isAvailable: true }
          ]
        }
      }
    });
    console.log('Created Ajay Chapatis product.');
  } else {
    await prisma.product.update({
      where: { id: chapatis.id },
      data: { imageUrl: '/images/products/ajay-chapatis.jpg', isActive: true, isFeatured: true }
    });
    console.log('Updated Ajay Chapatis image.');
  }

  // 5. Add or update Nanda\'s Premium Fruit Sweet Bun
  let bun = await prisma.product.findFirst({ where: { name: "Nanda's Premium Fruit Sweet Bun" } });
  if (!bun) {
    bun = await prisma.product.create({
      data: {
        name: "Nanda's Premium Fruit Sweet Bun",
        categoryId: otherCat.id,
        description: 'Fresh and soft bakery sweet buns generously loaded with tutti-frutti pieces. Delicious accompaniment with hot milk, coffee, or tea.',
        quality: 'Fresh Bakery Quality',
        imageUrl: '/images/products/fruit-sweet-bun.jpg',
        isActive: true,
        isFeatured: true,
        variants: {
          create: [
            { packSize: '6 Pieces Pack', unit: 'box', price: 50, stockQuantity: 40, isAvailable: true }
          ]
        }
      }
    });
    console.log('Created Fruit Sweet Bun product.');
  } else {
    await prisma.product.update({
      where: { id: bun.id },
      data: { imageUrl: '/images/products/fruit-sweet-bun.jpg', isActive: true, isFeatured: true }
    });
    console.log('Updated Fruit Sweet Bun image.');
  }

  // 6. Ensure default dairy items also exist with their photos
  const curdCat = await prisma.category.findUnique({ where: { slug: 'curd' } });
  const buttermilkCat = await prisma.category.findUnique({ where: { slug: 'buttermilk' } });
  const lassiCat = await prisma.category.findUnique({ where: { slug: 'lassi' } });

  const extraProducts = [
    {
      name: 'Curd Buckets (Functions & Marriages)',
      categoryId: curdCat ? curdCat.id : otherCat.id,
      description: 'Rich, thick, authentic curd packed in sturdy food-grade buckets for weddings, poojas, ceremonies, and catering.',
      quality: 'Function Grade Thick Curd',
      imageUrl: '/images/products/curd-bucket.jpg',
      isFeatured: true,
      variants: [
        { packSize: '5 kg bucket', unit: 'bucket', price: 350, stockQuantity: 30, isAvailable: true },
        { packSize: '10 kg bucket', unit: 'bucket', price: 500, stockQuantity: 25, isAvailable: true },
        { packSize: '20 kg bucket', unit: 'bucket', price: 980, stockQuantity: 15, isAvailable: true }
      ]
    },
    {
      name: 'Spiced Fresh Buttermilk (Chaas)',
      categoryId: buttermilkCat ? buttermilkCat.id : otherCat.id,
      description: 'Traditional churned buttermilk spiced with roasted cumin, fresh ginger, and coriander. Cool and digestive.',
      quality: 'Naturally Churned Fresh Buttermilk',
      imageUrl: '/images/products/buttermilk.jpg',
      isFeatured: true,
      variants: [
        { packSize: '250 ml', unit: 'pouch', price: 15, stockQuantity: 80, isAvailable: true },
        { packSize: '500 ml', unit: 'bottle', price: 25, stockQuantity: 60, isAvailable: true },
        { packSize: '1 Litre', unit: 'bottle', price: 45, stockQuantity: 40, isAvailable: true }
      ]
    },
    {
      name: 'Sweet Creamy Lassi',
      categoryId: lassiCat ? lassiCat.id : otherCat.id,
      description: 'Rich, sweet, creamy lassi topped with natural malai. Chilled and satisfying.',
      quality: 'Rich Malai Lassi',
      imageUrl: '/images/products/lassi.jpg',
      isFeatured: true,
      variants: [
        { packSize: '250 ml', unit: 'glass', price: 25, stockQuantity: 60, isAvailable: true },
        { packSize: '500 ml', unit: 'bottle', price: 45, stockQuantity: 50, isAvailable: true }
      ]
    },
    {
      name: 'Fresh Homemade Malai Paneer',
      categoryId: otherCat.id,
      description: 'Soft, delicate paneer prepared fresh daily from pure buffalo milk. Melts in your mouth.',
      quality: '100% Pure Malai Paneer',
      imageUrl: '/images/products/fresh-paneer.jpg',
      isFeatured: false,
      variants: [
        { packSize: '200 g', unit: 'pack', price: 85, stockQuantity: 40, isAvailable: true },
        { packSize: '500 g', unit: 'pack', price: 200, stockQuantity: 30, isAvailable: true }
      ]
    },
    {
      name: 'Pure Desi Cow Ghee',
      categoryId: otherCat.id,
      description: 'Traditional golden granular desi ghee with aromatic scent and rich nutritional value.',
      quality: 'Pure Traditional Desi Ghee',
      imageUrl: '/images/products/desi-ghee.jpg',
      isFeatured: false,
      variants: [
        { packSize: '250 ml', unit: 'jar', price: 220, stockQuantity: 30, isAvailable: true },
        { packSize: '500 ml', unit: 'jar', price: 420, stockQuantity: 25, isAvailable: true },
        { packSize: '1 Litre', unit: 'tin', price: 820, stockQuantity: 20, isAvailable: true }
      ]
    }
  ];

  for (const item of extraProducts) {
    let existing = await prisma.product.findFirst({ where: { name: item.name } });
    if (!existing) {
      await prisma.product.create({
        data: {
          name: item.name,
          categoryId: item.categoryId,
          description: item.description,
          quality: item.quality,
          imageUrl: item.imageUrl,
          isFeatured: item.isFeatured,
          isActive: true,
          variants: {
            create: item.variants
          }
        }
      });
      console.log(`Created ${item.name}`);
    } else {
      await prisma.product.update({
        where: { id: existing.id },
        data: { imageUrl: item.imageUrl }
      });
      console.log(`Updated ${item.name} image`);
    }
  }

  const all = await prisma.product.findMany({
    select: { name: true, imageUrl: true, isActive: true }
  });
  console.log('All DB products now:', JSON.stringify(all, null, 2));

  const settings = await prisma.shopSettings.findFirst();
  console.log('Current settings openingHours:', settings.openingHours);
}

async function main() {
  try {
    await updateDB();
  } catch (err) {
    const msg = err?.message || String(err);
    if (
      msg.includes('FATAL') ||
      msg.includes('ENOTFOUND') ||
      msg.includes('tenant/user') ||
      msg.includes('P1001') ||
      msg.includes('P1000') ||
      msg.includes('PrismaClientInitializationError')
    ) {
      console.warn('\n======================================================');
      console.warn('⚠️  DATABASE CONNECTION NOTICE');
      console.warn('======================================================');
      console.warn('Could not connect to Supabase PostgreSQL database.');
      console.warn('Error details:', msg.split('\n').filter((l) => l.includes('FATAL') || l.includes('Error')).join(' ') || msg);
      console.warn('\n👉 How to resolve this in your project:');
      console.warn('1. Open Supabase Dashboard: https://supabase.com/dashboard/org/scgsknoptivsuphzxzoz');
      console.warn('2. Open your project (or click "New Project" if you haven\'t created one yet).');
      console.warn('3. Go to Project Settings -> Database -> Connection String -> URI.');
      console.warn('4. In your .env file, replace the placeholder with your project ref & database password:');
      console.warn('   DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"');
      console.warn('\n✨ The storefront continues running smoothly using resilient catalog defaults in src/lib/catalog.ts.');
      console.warn('======================================================\n');
      return;
    }
    console.error(err);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}

main();

