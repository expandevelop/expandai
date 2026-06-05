const { PrismaClient, RecordStatus, UserRole } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const adminEmail = process.env.EXPANDAI_BOOTSTRAP_ADMIN_EMAIL || 'admin@expandai.com';
const adminPassword = process.env.EXPANDAI_BOOTSTRAP_ADMIN_PASSWORD || 'Expand@123';
const adminName = process.env.EXPANDAI_BOOTSTRAP_ADMIN_NAME || 'Administrador ExpandAI';
const defaultUserPassword =
  process.env.EXPANDAI_BOOTSTRAP_DEFAULT_PASSWORD || adminPassword;

async function main() {
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
  const defaultPasswordHash = await bcrypt.hash(defaultUserPassword, 10);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      status: RecordStatus.ACTIVE,
      ecosystemProfile: 'admin',
    },
    create: {
      name: adminName,
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      status: RecordStatus.ACTIVE,
      ecosystemProfile: 'admin',
    },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      ecosystemProfile: true,
    },
  });

  const usersWithoutPassword = await prisma.user.findMany({
    where: {
      passwordHash: null,
    },
    select: {
      id: true,
      email: true,
      role: true,
      ecosystemProfile: true,
    },
  });

  const updatedUsers = [];

  for (const user of usersWithoutPassword) {
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: defaultPasswordHash,
      },
      select: {
        id: true,
        email: true,
        role: true,
        ecosystemProfile: true,
      },
    });

    updatedUsers.push(updatedUser);
  }

  console.log(
    JSON.stringify(
      {
        adminUser,
        backfilledUsersCount: updatedUsers.length,
        backfilledUsers: updatedUsers,
        temporaryPasswordApplied: defaultUserPassword,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
