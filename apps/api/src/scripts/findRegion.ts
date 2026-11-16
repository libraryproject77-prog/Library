import { PrismaClient } from '@prisma/client';

const regions = [
  'ap-south-1',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-northeast-1',
  'ap-northeast-2',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'eu-central-1',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'sa-east-1'
];

async function check() {
  for (const r of regions) {
    const url = process.env.DATABASE_URL || `postgresql://postgres:password@localhost:5432/postgres`;
    const p = new PrismaClient({ datasources: { db: { url } } });
    try {
      await p.$connect();
      console.log('✅ SUCCESS! Connected to Supabase region:', r);
      await p.$disconnect();
      return r;
    } catch (e: any) {
      if (!e.message.includes('tenant') && !e.message.includes("Can't reach database server")) {
        console.log(`Region ${r} response:`, e.message);
      }
    } finally {
      await p.$disconnect();
    }
  }
  console.log('Done scanning regions.');
  return null;
}

check().catch(console.error);
