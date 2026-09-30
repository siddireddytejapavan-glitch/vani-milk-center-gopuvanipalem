const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function checkDatabaseConnection() {
  console.log('======================================================');
  console.log('  VANI MILK CENTER — DATABASE CONNECTION DIAGNOSTICS');
  console.log('======================================================\n');

  const dbUrl = process.env.DATABASE_URL || '';

  if (!dbUrl) {
    console.error('❌ ERROR: DATABASE_URL is not set in your .env file.');
    console.log('👉 Please set DATABASE_URL in .env to your Supabase PostgreSQL connection string.\n');
    process.exit(1);
  }

  console.log('📋 Current DATABASE_URL configuration:');
  const maskedUrl = dbUrl.replace(/:([^@]+)@/, ':****@');
  console.log(`   ${maskedUrl}\n`);

  if (dbUrl.includes('[YOUR-PASSWORD]') || dbUrl.includes('YOUR-PASSWORD')) {
    console.warn('⚠️  ATTENTION: DATABASE_URL contains "[YOUR-PASSWORD]".');
    console.log('👉 Please replace [YOUR-PASSWORD] in .env or .env.local with your actual Supabase database password.');
    console.log('   (Found in your Supabase project dashboard -> Project Settings -> Database)\n');
  }

  if (dbUrl.includes('saeeiphkhzpbujbmmiux')) {
    console.log('✅ Supabase Project Reference identified: saeeiphkhzpbujbmmiux (Region: ap-southeast-1)');
  }

  console.log('⏳ Attempting connection to PostgreSQL...');
  const prisma = new PrismaClient({
    log: ['error'],
  });

  try {
    const result = await prisma.$queryRawUnsafe('SELECT 1 as connected');
    console.log('✅ SUCCESS: Successfully connected to Supabase PostgreSQL database!');
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
      console.log('   Run: cmd.exe /c "npx prisma db push" or execute supabase-schema.sql in Supabase SQL editor.\n');
    }
  } catch (err) {
    console.error('❌ Connection Failed:');
    console.error(`   ${err.message || err}`);
    console.log('\n💡 Tip: Your Next.js website continues running smoothly using resilient offline catalog defaults.');
  } finally {
    await prisma.$disconnect().catch(() => {});
    console.log('======================================================\n');
  }
}

checkDatabaseConnection();
