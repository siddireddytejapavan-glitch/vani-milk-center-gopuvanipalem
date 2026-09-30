const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function updateAll() {
  const email = 'siddreddylakshmankumar@gmail.com';
  const password = 'VANI@MILK';
  const phone = '7995597719';
  const whatsappNumber = '917995597719';
  const shopName = 'VANI MILK CENTER, GOPIVANIPALEM';
  const passwordHash = await bcrypt.hash(password, 10);

  // 1. Update/create Admin user
  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: 'ADMIN',
      name: 'Lakshman Kumar Siddireddy',
    },
    create: {
      email,
      passwordHash,
      role: 'ADMIN',
      name: 'Lakshman Kumar Siddireddy',
    },
  });

  // Remove old admin users
  await prisma.user.deleteMany({
    where: {
      email: {
        not: email,
      },
    },
  });

  console.log(`Admin user updated to: ${admin.email}`);

  // 2. Update Shop Settings
  const settings = await prisma.shopSettings.upsert({
    where: { id: 'default-settings' },
    update: {
      shopName,
      phone,
      whatsappNumber,
      logoUrl: '/images/shop-logo.svg',
      address: 'Gopivanipalem, Andhra Pradesh',
      openingHours: 'Morning: 5:30 AM - 1:00 PM | Evening: 4:30 PM - 9:30 PM',
      googleMapsUrl: 'https://maps.google.com/?q=Gopivanipalem',
      aboutDescription:
        'Welcome to Vani Milk Center, Gopivanipalem. We deliver 100% pure & natural, hygienically processed milk, curd, ghee, paneer, buttermilk, and lassi for daily families, functions, and bulk catering orders.',
      bannerText:
        '100% Pure & Natural Milk Products | Healthy Life Happy Life | Home Delivery: 7995597719',
    },
    create: {
      id: 'default-settings',
      shopName,
      phone,
      whatsappNumber,
      logoUrl: '/images/shop-logo.svg',
      address: 'Gopivanipalem, Andhra Pradesh',
      openingHours: 'Morning: 5:30 AM - 1:00 PM | Evening: 4:30 PM - 9:30 PM',
      googleMapsUrl: 'https://maps.google.com/?q=Gopivanipalem',
      aboutDescription:
        'Welcome to Vani Milk Center, Gopivanipalem. We deliver 100% pure & natural, hygienically processed milk, curd, ghee, paneer, buttermilk, and lassi for daily families, functions, and bulk catering orders.',
      bannerText:
        '100% Pure & Natural Milk Products | Healthy Life Happy Life | Home Delivery: 7995597719',
    },
  });

  console.log(`Shop settings updated to: ${settings.shopName}`);
}

updateAll()
  .catch((err) => {
    const msg = err?.message || String(err);
    if (msg.includes('FATAL') || msg.includes('ENOTFOUND') || msg.includes('tenant/user') || msg.includes('P1001') || msg.includes('P1000')) {
      console.warn('⚠️ Notice: Could not connect to Supabase database. Please check your credentials in .env');
      return;
    }
    console.error(err);
  })
  .finally(async () => {
    await prisma.$disconnect().catch(() => {});
  });
