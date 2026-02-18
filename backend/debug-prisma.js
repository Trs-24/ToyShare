
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const Database = require('better-sqlite3');

const db = new Database('dev.db');
const adapter = new PrismaBetterSqlite3(db);
const prisma = new PrismaClient({ adapter });

async function main() {
    try {
        console.log('Connecting...');

        // 1. Create a dummy exchange (or find one)
        const users = await prisma.user.findMany({ take: 2 });
        if (users.length < 2) {
            console.log('Not enough users to test exchange');
            return;
        }

        console.log('Users found:', users.map(u => u.id));

        // Create a temp exchange
        const exchange = await prisma.exchange.create({
            data: {
                initiatorId: users[0].id,
                receiverId: users[1].id,
                status: 'IN_PROGRESS',
                initiatorCompleted: false,
                receiverCompleted: false
            }
        });

        console.log('Created exchange:', exchange.id);
        console.log('InitiatorCompleted:', exchange.initiatorCompleted);

        // 2. Try to update it
        const updated = await prisma.exchange.update({
            where: { id: exchange.id },
            data: {
                initiatorCompleted: true
            }
        });
        console.log('Updated exchange:', updated.initiatorCompleted);

        // Cleanup
        await prisma.exchange.delete({ where: { id: exchange.id } });
        console.log('Test successful');

    } catch (e) {
        console.error('Error during Prisma test:', e);
    } finally {
        await prisma.$disconnect();
        db.close();
    }
}

main();
