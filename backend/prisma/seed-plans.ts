import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create PostgreSQL connection pool
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create Prisma adapter
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function seedPlans() {
  console.log('Seeding subscription plans...');

  const plans = [
    {
      name: 'Starter',
      priceMonthly: 19,
      priceYearly: 190,
      maxProjectsMonth: 5,
      aiCreditsMonth: 100,
      features: {
        list: [
          '5 projets par mois',
          '100 crédits IA',
          'Matching intelligent',
          'Messagerie illimitée',
          'Support email',
        ],
      },
      isActive: true,
    },
    {
      name: 'Pro',
      priceMonthly: 49,
      priceYearly: 470,
      maxProjectsMonth: 20,
      aiCreditsMonth: 500,
      features: {
        list: [
          '20 projets par mois',
          '500 crédits IA',
          'Matching intelligent avancé',
          'Messagerie illimitée',
          'Accès portfolios illimité',
          'Export PDF',
          'Support prioritaire',
        ],
        highlighted: true,
      },
      isActive: true,
    },
    {
      name: 'Premium',
      priceMonthly: 99,
      priceYearly: 950,
      maxProjectsMonth: 100,
      aiCreditsMonth: 2000,
      features: {
        list: [
          'Projets illimités',
          '2000 crédits IA',
          'Matching IA premium',
          'Messagerie illimitée',
          'Accès portfolios illimité',
          'Export PDF',
          'API access',
          'Account manager dédié',
          'Support téléphonique',
        ],
      },
      isActive: true,
    },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    });
    console.log(`  ✓ Plan "${plan.name}" created/updated`);
  }

  console.log('Done seeding plans!');
}

seedPlans()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
