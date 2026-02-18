
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking Users with avatars...');
    const users = await prisma.user.findMany({
        where: { NOT: { avatarUrl: null } },
        select: { id: true, email: true, avatarUrl: true },
        take: 5
    });
    console.log('Users with avatars:', users);

    console.log('\nChecking Items with photos...');
    const items = await prisma.item.findMany({
        where: { photos: { some: {} } },
        select: { id: true, title: true, photos: true },
        take: 5
    });
    console.log('Items with photos:', JSON.stringify(items, null, 2));

    console.log('\nChecking total Photo records...');
    const photoCount = await prisma.photo.count();
    console.log('Total photos in DB:', photoCount);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
