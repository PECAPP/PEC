const { PrismaClient } = require('./server/prisma/generated/client');
const prisma = new PrismaClient();

async function main() {
    const admin = await prisma.user.findFirst({ where: { role: 'college_admin' } });
    if (!admin) {
        console.error('No admin found');
        return;
    }

    await prisma.notice.create({
        data: {
            title: 'Welcome to OmniFlow ERP',
            content: 'We are excited to have you on board. Explore the new dashboard features!',
            category: 'news',
            important: true,
            pinned: true,
            authorId: admin.id,
            publishedAt: new Date(),
        }
    });
    console.log('Test notice created');
}

main().finally(() => prisma.$disconnect());
