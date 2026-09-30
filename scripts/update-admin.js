const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function updateAdmin() {
  const email = 'siddireddytejapavan@gmail.com';
  const password = 'TEJA@MILK';
  const passwordHash = await bcrypt.hash(password, 10);

  // Update or create new admin
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: 'ADMIN',
      name: 'Teja Pavan',
    },
    create: {
      email,
      passwordHash,
      role: 'ADMIN',
      name: 'Teja Pavan',
    },
  });

  // Also remove old placeholder admin if present
  await prisma.user.deleteMany({
    where: {
      email: 'admin@dairy.local',
    },
  });

  console.log(`SUCCESS: Admin user updated to ${user.email}`);
}

updateAdmin()
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
