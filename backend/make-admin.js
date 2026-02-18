// Script to promote first user to ADMIN
const { PrismaClient } = require('../node_modules/.prisma/client');
const prisma = new PrismaClient();

async function main() {
    const firstUser = await prisma.user.findFirst();
    if (!firstUser) {
        console.log('No users found');
        return;
    }

    await prisma.user.update({
        where: { id: firstUser.id },
        data: { role: 'ADMIN' },
    });

    console.log(`✅ User "${firstUser.email}" is now ADMIN`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
