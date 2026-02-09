import { PrismaClient } from '@prisma/client';
import cloudinary from '../src/config/cloudinary.js';
import { extractPublicIdFromUrl } from '../src/services/upload.service.js';

const prisma = new PrismaClient();

/**
 * Script to cleanup orphaned images from Cloudinary
 * Run with: npx tsx scripts/cleanup-orphaned-images.ts
 */

async function cleanupOrphanedImages() {
  console.log('🧹 Starting cleanup of orphaned Cloudinary images...\n');

  try {
    // Get all images currently used in the database
    const usedImages = new Set<string>();

    // 1. Get all professional profile pictures and banners
    const professionals = await prisma.professional.findMany({
      select: {
        profilePictureUrl: true,
        bannerUrl: true,
      },
    });

    professionals.forEach((prof) => {
      if (prof.profilePictureUrl) usedImages.add(prof.profilePictureUrl);
      if (prof.bannerUrl) usedImages.add(prof.bannerUrl);
    });

    console.log(`✅ Found ${professionals.length} professionals`);

    // 2. Get all creator profile pictures
    const creators = await prisma.creator.findMany({
      select: {
        profilePictureUrl: true,
      },
    });

    creators.forEach((creator) => {
      if (creator.profilePictureUrl) usedImages.add(creator.profilePictureUrl);
    });

    console.log(`✅ Found ${creators.length} creators`);

    // 3. Get all portfolio images
    const portfolios = await prisma.portfolio.findMany({
      select: {
        imageUrl: true,
      },
    });

    portfolios.forEach((portfolio) => {
      if (portfolio.imageUrl) usedImages.add(portfolio.imageUrl);
    });

    console.log(`✅ Found ${portfolios.length} portfolio items`);

    console.log(`\n📊 Total images in database: ${usedImages.size}`);

    // 4. Get all images from Cloudinary (in juny folder)
    console.log('\n🔍 Fetching images from Cloudinary...');

    const cloudinaryImages: string[] = [];
    let nextCursor: string | undefined = undefined;

    do {
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: 'juny/', // Only check juny folder
        max_results: 500,
        next_cursor: nextCursor,
      });

      cloudinaryImages.push(...result.resources.map((r: any) => r.secure_url));
      nextCursor = result.next_cursor;
    } while (nextCursor);

    console.log(`✅ Found ${cloudinaryImages.length} images on Cloudinary`);

    // 5. Find orphaned images
    const orphanedImages = cloudinaryImages.filter((url) => !usedImages.has(url));

    console.log(`\n🗑️  Found ${orphanedImages.length} orphaned images`);

    if (orphanedImages.length === 0) {
      console.log('\n✨ No orphaned images to clean up!');
      return;
    }

    // 6. Ask for confirmation
    console.log('\nOrphaned images (first 10):');
    orphanedImages.slice(0, 10).forEach((url, i) => {
      const publicId = extractPublicIdFromUrl(url);
      console.log(`  ${i + 1}. ${publicId}`);
    });

    if (orphanedImages.length > 10) {
      console.log(`  ... and ${orphanedImages.length - 10} more`);
    }

    console.log('\n⚠️  WARNING: This will permanently delete these images!');
    console.log('To proceed, run this script with --confirm flag:');
    console.log('npx tsx scripts/cleanup-orphaned-images.ts --confirm\n');

    // 7. Delete if confirmed
    if (process.argv.includes('--confirm')) {
      console.log('\n🗑️  Deleting orphaned images...');

      let deleted = 0;
      let failed = 0;

      for (const url of orphanedImages) {
        const publicId = extractPublicIdFromUrl(url);
        if (!publicId) {
          console.log(`❌ Could not extract publicId from: ${url}`);
          failed++;
          continue;
        }

        try {
          await cloudinary.uploader.destroy(publicId);
          deleted++;
          if (deleted % 10 === 0) {
            console.log(`  Deleted ${deleted}/${orphanedImages.length}...`);
          }
        } catch (error) {
          console.error(`❌ Failed to delete ${publicId}:`, error);
          failed++;
        }
      }

      console.log(`\n✅ Cleanup complete!`);
      console.log(`  Deleted: ${deleted}`);
      console.log(`  Failed: ${failed}`);
    }
  } catch (error) {
    console.error('\n❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupOrphanedImages();
