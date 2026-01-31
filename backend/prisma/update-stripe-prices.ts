import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const STRIPE_PRICES = {
  Starter: {
    monthly: 'price_1StXdgEgbLgtyB2ALBXbF7Vn',
    yearly: 'price_1StXdgEgbLgtyB2AJ5xacHWz',
  },
  Pro: {
    monthly: 'price_1StXfGEgbLgtyB2AnUPxbeS3',
    yearly: 'price_1StXfGEgbLgtyB2AqBS6ohtX',
  },
  Premium: {
    monthly: 'price_1StXfxEgbLgtyB2AkbSE3WBg',
    yearly: 'price_1StXfxEgbLgtyB2A9xhSqR8f',
  },
};

async function updateStripePrices() {
  console.log('Updating Stripe Price IDs...\n');

  for (const [planName, prices] of Object.entries(STRIPE_PRICES)) {
    try {
      await prisma.subscriptionPlan.update({
        where: { name: planName },
        data: {
          stripePriceIdMonthly: prices.monthly,
          stripePriceIdYearly: prices.yearly,
        },
      });
      console.log(`✓ ${planName}: monthly=${prices.monthly}, yearly=${prices.yearly}`);
    } catch (error) {
      console.error(`✗ Error updating ${planName}:`, error);
    }
  }

  console.log('\nDone!');
}

updateStripePrices()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
