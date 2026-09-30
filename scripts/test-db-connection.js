const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function checkDatabaseConnection() {
  console.log('======================================================');
  console.log('  VANI MILK CENTER — DATABASE CONNECTION TEST');
  console.log('======================================================\n');

  const dbUrl = process.env.DATABASE_URL || '';

  if (!dbUrl) {
    console.error('❌ ERROR: DATABASE_URL is not set in your .env file.');
    console.log('👉 Please set DATABASE_URL in .env to your PostgreSQL connection string, for example:');
    console.log('   DATABASE_URL="postgresql://postgres:password@localhost:5432/vani_milk_center?schema=public"\n');
    process.exit(1);
  }

  console.log('📋 Current DATABASE_URL:');
  const maskedUrl = dbUrl.replace(/:([^@]+)@/, ':****@');
  console.log(`   ${maskedUrl}\n`);

  if (dbUrl.includes('[YOUR-PASSWORD]') || dbUrl.includes('YOUR-PASSWORD') || dbUrl.includes('[PASSWORD]')) {
    console.warn('⚠️  ATTENTION: DATABASE_URL contains a password placeholder.');
    console.log('👉 Please replace the placeholder with your actual PostgreSQL database password.\n');
  }

  console.log('⏳ Attempting database connection...');
  const prisma = new PrismaClient({
    log: ['error'],
  });

  try {
    const result = await prisma.$queryRawUnsafe('SELECT 1 as connected');
    console.log('✅ SUCCESS: Successfully connected to database!');
    console.log('   Connection verified: Database is alive and accepting queries.\n');

    // Check tables
    try {
      const [userCount, productCount, categoryCount, orderCount] = await Promise.all([
        prisma.user.count(),
        prisma.product.count(),
        prisma.category.count(),
        prisma.order.count(),
      ]);
      console.log('📊 Table Record Counts:');
      console.log(`   - Users (Admin): ${userCount}`);
      console.log(`   - Categories: ${categoryCount}`);
      console.log(`   - Products: ${productCount}`);
      console.log(`   - Orders: ${orderCount}\n`);
    } catch (tblErr) {
      console.log('ℹ️  Database connected, but tables may need initialization.');
      console.log('   Run: cmd.exe /c "npx prisma db push" && cmd.exe /c "node prisma/seed.js"\n');
    }
  } catch (err) {
    console.error('❌ Connection Failed:');
    console.error(`   ${err.message || err}`);
    console.log('\n💡 Tip: Your Next.js website continues running smoothly using resilient offline catalog defaults in src/lib/catalog.ts.');
  } finally {
    await prisma.$disconnect().catch(() => {});
    console.log('======================================================\n');
  }
}

checkDatabaseConnection();
