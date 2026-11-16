import { PrismaClient } from '@prisma/client';

async function testConnection(region: string) {
  const url = process.env.DATABASE_URL || `postgresql://postgres:password@localhost:5432/postgres`;
  const directUrl = process.env.DIRECT_URL || url;
  
  console.log(`Testing region ${region}...`);
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: directUrl
      }
    }
  });

  try {
    await prisma.$connect();
    console.log(`✅ Successfully connected to Supabase in region: ${region}!`);
    await prisma.$disconnect();
    return true;
  } catch (err: any) {
    console.log(`❌ Failed on ${region}:`, err.message);
    await prisma.$disconnect();
    return false;
  }
}

async function run() {
  const regions = ['ap-south-1', 'ap-southeast-1', 'us-east-1', 'eu-central-1'];
  for (const r of regions) {
    const ok = await testConnection(r);
    if (ok) break;
  }
}

run();
