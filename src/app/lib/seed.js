const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminPass = await bcrypt.hash('admin123', 10);
  const cashierPass = await bcrypt.hash('cashier123', 10);

  await prisma.staff.upsert({
    where: { pin: 'ADMIN01' },
    update: {},
    create: { name: 'Admin User', pin: 'ADMIN01', password: adminPass, role: 'ADMIN' },
  });

  await prisma.staff.upsert({
    where: { pin: 'CASH01' },
    update: {},
    create: { name: 'Cashier User', pin: 'CASH01', password: cashierPass, role: 'CASHIER' },
  });

  console.log('Done! Admin: ADMIN01 / admin123 | Cashier: CASH01 / cashier123');
}

main().catch(console.error).finally(() => prisma.$disconnect());