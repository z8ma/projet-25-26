import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding test data for matching...');

  // Clean up existing test data
  console.log('🧹 Cleaning up existing test data...');
  await prisma.user.deleteMany({
    where: {
      email: {
        startsWith: 'test-matching-',
      },
    },
  });

  // Create test creator
  console.log('👤 Creating test creator...');
  const creatorPassword = await bcrypt.hash('password123', 10);
  const creatorUser = await prisma.user.create({
    data: {
      email: 'test-matching-creator@example.com',
      passwordHash: creatorPassword,
      role: 'CREATOR',
      creator: {
        create: {
          companyName: 'Test Company',
          industry: 'Tech',
          typicalBudget: '5-10k',
          preferredCreatives: ['graphiste', 'web'],
          description: 'Entreprise tech à la recherche de créatifs talentueux',
        },
      },
    },
    include: {
      creator: true,
    },
  });

  console.log(`✅ Creator created: ${creatorUser.email}`);

  // Ensure Graphiste profession exists
  let graphisteProfession = await prisma.profession.findFirst({
    where: { name: { contains: 'Graphiste' } },
  });

  if (!graphisteProfession) {
    graphisteProfession = await prisma.profession.create({
      data: {
        name: 'Graphiste',
        category: 'Design',
      },
    });
  }

  // Create 3 professionals with different skill levels

  // 1. JUNIOR GRAPHISTE - Low match expected
  console.log('👨‍🎨 Creating Junior Graphiste...');
  const juniorPassword = await bcrypt.hash('password123', 10);
  const juniorUser = await prisma.user.create({
    data: {
      email: 'test-matching-junior@example.com',
      passwordHash: juniorPassword,
      role: 'PROFESSIONAL',
      professional: {
        create: {
          firstName: 'Junior',
          lastName: 'Designer',
          bio: 'Graphiste débutant passionné',
          experienceYears: 1,
          availability: 'Disponible',
          minimumBudget: 500,
          professions: {
            create: [
              {
                profession: { connect: { id: graphisteProfession.id } },
                isPrimary: true,
              },
            ],
          },
          softwareSkills: {
            create: [
              { softwareName: 'Canva', proficiencyLevel: 'CONFIRMED', yearsOfUse: 1 },
              { softwareName: 'Photoshop', proficiencyLevel: 'JUNIOR', yearsOfUse: 1 },
            ],
          },
          portfolios: {
            create: [
              {
                title: 'Logo simple',
                description: 'Un logo basique pour un café',
                projectUrl: 'https://example.com/portfolio1',
                imageUrl: 'https://via.placeholder.com/400',
                clientType: 'PME',
                tags: {
                  create: [
                    { tag: 'simple' },
                    { tag: 'coloré' },
                  ],
                },
              },
            ],
          },
        },
      },
    },
  });

  console.log(`✅ Junior created: ${juniorUser.email}`);

  // 2. INTERMEDIATE GRAPHISTE - Medium match expected
  console.log('👨‍🎨 Creating Intermediate Graphiste...');
  const intermediatePassword = await bcrypt.hash('password123', 10);
  const intermediateUser = await prisma.user.create({
    data: {
      email: 'test-matching-intermediate@example.com',
      passwordHash: intermediatePassword,
      role: 'PROFESSIONAL',
      professional: {
        create: {
          firstName: 'Alex',
          lastName: 'Créatif',
          bio: 'Graphiste avec une solide expérience en branding',
          experienceYears: 4,
          availability: 'Disponible',
          minimumBudget: 2000,
          professions: {
            create: [
              {
                profession: { connect: { id: graphisteProfession.id } },
                isPrimary: true,
              },
            ],
          },
          softwareSkills: {
            create: [
              { softwareName: 'Illustrator', proficiencyLevel: 'EXPERT', yearsOfUse: 4 },
              { softwareName: 'Photoshop', proficiencyLevel: 'SENIOR', yearsOfUse: 4 },
              { softwareName: 'InDesign', proficiencyLevel: 'SENIOR', yearsOfUse: 3 },
              { softwareName: 'Figma', proficiencyLevel: 'CONFIRMED', yearsOfUse: 2 },
            ],
          },
          portfolios: {
            create: [
              {
                title: 'Identité visuelle startup tech',
                description: 'Création complète d\'identité pour une startup SaaS',
                projectUrl: 'https://example.com/portfolio2',
                imageUrl: 'https://via.placeholder.com/400',
                clientType: 'Startup',
                tags: {
                  create: [
                    { tag: 'moderne' },
                    { tag: 'tech' },
                    { tag: 'minimaliste' },
                  ],
                },
              },
              {
                title: 'Charte graphique e-commerce',
                description: 'Design system complet pour site e-commerce',
                projectUrl: 'https://example.com/portfolio3',
                imageUrl: 'https://via.placeholder.com/400',
                clientType: 'E-commerce',
                tags: {
                  create: [
                    { tag: 'web' },
                    { tag: 'coloré' },
                  ],
                },
              },
              {
                title: 'Branding application mobile',
                description: 'Identité visuelle et UI pour app mobile',
                projectUrl: 'https://example.com/portfolio4',
                imageUrl: 'https://via.placeholder.com/400',
                clientType: 'Tech',
                tags: {
                  create: [
                    { tag: 'mobile' },
                    { tag: 'interface' },
                  ],
                },
              },
            ],
          },
        },
      },
    },
  });

  console.log(`✅ Intermediate created: ${intermediateUser.email}`);

  // 3. SENIOR GRAPHISTE - High match expected
  console.log('👨‍🎨 Creating Senior Graphiste...');
  const seniorPassword = await bcrypt.hash('password123', 10);
  const seniorUser = await prisma.user.create({
    data: {
      email: 'test-matching-senior@example.com',
      passwordHash: seniorPassword,
      role: 'PROFESSIONAL',
      professional: {
        create: {
          firstName: 'Sophie',
          lastName: 'Expert',
          bio: 'Directrice artistique senior spécialisée en tech et branding',
          experienceYears: 10,
          availability: 'Disponible',
          minimumBudget: 5000,
          isPremium: true,
          professions: {
            create: [
              {
                profession: { connect: { id: graphisteProfession.id } },
                isPrimary: true,
              },
            ],
          },
          softwareSkills: {
            create: [
              { softwareName: 'Illustrator', proficiencyLevel: 'EXPERT', yearsOfUse: 10 },
              { softwareName: 'Photoshop', proficiencyLevel: 'EXPERT', yearsOfUse: 10 },
              { softwareName: 'InDesign', proficiencyLevel: 'EXPERT', yearsOfUse: 8 },
              { softwareName: 'Figma', proficiencyLevel: 'EXPERT', yearsOfUse: 5 },
              { softwareName: 'After Effects', proficiencyLevel: 'SENIOR', yearsOfUse: 6 },
              { softwareName: 'Sketch', proficiencyLevel: 'SENIOR', yearsOfUse: 7 },
              { softwareName: 'Adobe XD', proficiencyLevel: 'SENIOR', yearsOfUse: 4 },
            ],
          },
          portfolios: {
            create: [
              {
                title: 'Rebranding startup licorne',
                description: 'Refonte complète de l\'identité d\'une scale-up tech valorisée à 100M€',
                projectUrl: 'https://example.com/portfolio5',
                imageUrl: 'https://via.placeholder.com/400',
                clientType: 'Startup',
                tags: {
                  create: [
                    { tag: 'tech' },
                    { tag: 'moderne' },
                    { tag: 'premium' },
                    { tag: 'minimaliste' },
                  ],
                },
              },
              {
                title: 'Design system enterprise SaaS',
                description: 'Création d\'un design system complet pour plateforme B2B',
                projectUrl: 'https://example.com/portfolio6',
                imageUrl: 'https://via.placeholder.com/400',
                clientType: 'Tech',
                tags: {
                  create: [
                    { tag: 'web' },
                    { tag: 'interface' },
                    { tag: 'système' },
                  ],
                },
              },
              {
                title: 'Identité visuelle fintech',
                description: 'Branding complet pour néobanque innovante',
                projectUrl: 'https://example.com/portfolio7',
                imageUrl: 'https://via.placeholder.com/400',
                clientType: 'Finance',
                tags: {
                  create: [
                    { tag: 'tech' },
                    { tag: 'élégant' },
                    { tag: 'professionnel' },
                  ],
                },
              },
              {
                title: 'Application mobile santé',
                description: 'UI/UX et branding pour app de télémédecine',
                projectUrl: 'https://example.com/portfolio8',
                imageUrl: 'https://via.placeholder.com/400',
                clientType: 'Tech',
                tags: {
                  create: [
                    { tag: 'mobile' },
                    { tag: 'moderne' },
                    { tag: 'accessible' },
                  ],
                },
              },
              {
                title: 'Plateforme e-learning',
                description: 'Design complet d\'une plateforme éducative tech',
                projectUrl: 'https://example.com/portfolio9',
                imageUrl: 'https://via.placeholder.com/400',
                clientType: 'Education',
                tags: {
                  create: [
                    { tag: 'web' },
                    { tag: 'interface' },
                    { tag: 'coloré' },
                  ],
                },
              },
            ],
          },
        },
      },
    },
  });

  console.log(`✅ Senior created: ${seniorUser.email}`);

  console.log('\n📊 Summary:');
  console.log('Creator:', creatorUser.email, '(password: password123)');
  console.log('Junior:', juniorUser.email, '(password: password123)');
  console.log('Intermediate:', intermediateUser.email, '(password: password123)');
  console.log('Senior:', seniorUser.email, '(password: password123)');
  console.log('\n✅ Test data seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
