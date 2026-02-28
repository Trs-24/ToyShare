import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Starting avatar URL cleanup...');

  const result = await prisma.user.updateMany({
    where: {
      avatarUrl: {
        startsWith: '/uploads/',
      },
    },
    data: {
      avatarUrl: null,
    },
  });

  console.log(`✅ Cleanup complete. Updated ${result.count} users.`);
}

main()
  .catch((e) => {
    console.error('❌ Error during cleanup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
