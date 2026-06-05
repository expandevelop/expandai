const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      ecosystemProfile: true,
      passwordHash: true,
      createdAt: true,
    },
    take: 20,
  });

  const report = users.map((user) => ({
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    ecosystemProfile: user.ecosystemProfile,
    hasPasswordHash: Boolean(user.passwordHash),
    createdAt: user.createdAt,
  }));

  console.log(JSON.stringify(report, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
