import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding profile views for testing...');

  // Find the test professionals
  const professionals = await prisma.professional.findMany({
    where: {
      user: {
        email: {
          startsWith: 'test-matching-',
        },
      },
    },
    include: {
      user: true,
    },
  });

  if (professionals.length === 0) {
    console.log('❌ No test professionals found. Run seed-test-matching.ts first.');
    return;
  }

  console.log(`Found ${professionals.length} test professionals`);

  // For each professional, create profile views with different sources
  for (const professional of professionals) {
    console.log(`\n👤 Adding views for ${professional.user.email}`);

    // Delete existing views for this professional
    await prisma.profileView.deleteMany({
      where: { professionalId: professional.id },
    });

    // AI Recommendations - 45% (most common)
    const aiViews = 45;
    for (let i = 0; i < aiViews; i++) {
      await prisma.profileView.create({
        data: {
          professionalId: professional.id,
          source: 'AI_RECOMMENDATION',
          viewedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random within last 30 days
        },
      });
    }

    // Direct Search - 30%
    const directViews = 30;
    for (let i = 0; i < directViews; i++) {
      await prisma.profileView.create({
        data: {
          professionalId: professional.id,
          source: 'DIRECT_SEARCH',
          viewedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        },
      });
    }

    // From Favorites - 15%
    const favoritesViews = 15;
    for (let i = 0; i < favoritesViews; i++) {
      await prisma.profileView.create({
        data: {
          professionalId: professional.id,
          source: 'FROM_FAVORITES',
          viewedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        },
      });
    }

    // Link Sharing - 10%
    const linkViews = 10;
    for (let i = 0; i < linkViews; i++) {
      await prisma.profileView.create({
        data: {
          professionalId: professional.id,
          source: 'LINK_SHARING',
          viewedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        },
      });
    }

    const total = aiViews + directViews + favoritesViews + linkViews;
    console.log(`✅ Created ${total} profile views (${aiViews} AI, ${directViews} direct, ${favoritesViews} favorites, ${linkViews} link)`);
  }

  console.log('\n✅ Profile views seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding profile views:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
