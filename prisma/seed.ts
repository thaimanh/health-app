/* eslint-disable */

import bcrypt from 'bcrypt';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const passwordHashed = await bcrypt.hash('123456', 10);

  const users = [
    {
      userName: 'john.doe',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.USER,
      email: 'john.doe@example.com',
      password: passwordHashed,
      phone: '123-456-7890',
      isVerified: true,
      emailVerificationToken: null,
    },
    {
      userName: 'jane.smith',
      firstName: 'Jane',
      lastName: 'Smith',
      role: UserRole.ADMIN,
      email: 'jane.smith@example.com',
      password: passwordHashed,
      phone: '987-654-3210',
      isVerified: true,
      emailVerificationToken: null,
    },
    {
      userName: 'peter.jones',
      firstName: 'Peter',
      lastName: 'Jones',
      role: UserRole.USER,
      email: 'peter.jones@example.com',
      password: passwordHashed,
      phone: null,
      isVerified: true,
      emailVerificationToken: null,
    },
  ];

  // Use createMany for better performance
  await prisma.user.createMany({
    data: users,
  });

  console.log('Seed data for User model has been created.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
