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
    console.warn('⚠️  ATTENTION: DATABASE_URL still contains the "[YOUR-PASSWORD]" placeholder.');
    console.log('👉 Please replace [YOUR-PASSWORD] in .env with your actual Supabase database password.\n');
  }

  if (dbUrl.includes('postgres.scgsknoptivsuphzxzoz')) {
    console.warn('⚠️  NOTICE: "scgsknoptivsuphzxzoz" is your Supabase ORGANIZATION address.');
    console.log('   In Supabase, your database project has its own Project Reference ID.');
    console.log('👉 To find your project connection string:');
    console.log('   1. Open: https://supabase.com/dashboard/org/scgsknoptivsuphzxzoz');
    console.log('   2. Click on your Project (or click "New Project" if not created yet).');
    console.log('   3. Go to Project Settings (gear icon) -> Database -> Connection string (URI).');
    console.log('   4. Copy the URI and paste it into your .env file.\n');
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
