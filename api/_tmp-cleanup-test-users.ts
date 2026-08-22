import 'dotenv/config';
import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany({
    where: { email: { contains: 'example.com' } },
    select: { id: true, email: true },
  });
  console.log(JSON.stringify(users, null, 2));

  if (users.length > 0) {
    const result = await prisma.user.deleteMany({
      where: { id: { in: users.map((u) => u.id) } },
    });
    console.log('deleted', result.count);
  }

  await prisma.$disconnect();
}

main();
