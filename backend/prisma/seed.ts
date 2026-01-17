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

async function main() {
  console.log('🌱 Seeding database...');

  // Seed professions
  const professions = [
    { name: 'Graphiste', category: 'Design' },
    { name: 'Designer 3D', category: '3D' },
    { name: 'Motion Designer', category: 'Motion' },
    { name: 'Illustrateur', category: 'Design' },
    { name: 'UI/UX Designer', category: 'Design' },
    { name: 'Architecte 3D', category: '3D' },
    { name: 'Animateur 3D', category: '3D' },
    { name: 'Video Editor', category: 'Motion' },
    { name: 'Directeur Artistique', category: 'Direction' },
    { name: 'Webdesigner', category: 'Design' },
  ];

  for (const profession of professions) {
    await prisma.profession.upsert({
      where: { name: profession.name },
      update: {},
      create: profession,
    });
  }

  console.log('✅ Professions seeded successfully');

  // Seed subscription plans
  await prisma.subscriptionPlan.upsert({
    where: { name: 'Starter' },
    update: {},
    create: {
      name: 'Starter',
      priceMonthly: 29,
      maxProjectsMonth: 5,
      aiCreditsMonth: 50,
      features: {
        matchingBasique: true,
        documentsStandard: true,
      },
      isActive: true,
    },
  });

  await prisma.subscriptionPlan.upsert({
    where: { name: 'Premium' },
    update: {},
    create: {
      name: 'Premium',
      priceMonthly: 99,
      maxProjectsMonth: 30,
      aiCreditsMonth: 500,
      features: {
        matchingPrioritaire: true,
        documentsIllimites: true,
        profilsPremium: true,
        supportPrioritaire: true,
      },
      isActive: true,
    },
  });

  console.log('✅ Subscription plans seeded successfully');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
