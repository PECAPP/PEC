const { PrismaClient } = require('./prisma/generated/client');
const prisma = new PrismaClient();

async function main() {
    let admin = await prisma.user.findFirst({ where: { role: 'college_admin' } });
    if (!admin) {
        admin = await prisma.user.findFirst();
    }
    if (!admin) {
        console.error('No users found in database');
        return;
    }

    await prisma.notice.create({
        data: {
            title: 'Welcome to OmniFlow ERP',
            content: 'We are excited to have you on board. Explore the new dashboard features! Check your attendance and schedule.',
            category: 'news',
            important: true,
            pinned: true,
            authorId: admin.id,
            publishedAt: new Date(),
        }
    });
    console.log('Test notice created');
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
