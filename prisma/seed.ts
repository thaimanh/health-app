import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany({}); // Clear existing data

  const users = [
    {
      userName: 'john.doe',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.USER,
      email: 'john.doe@example.com',
      password: 'hashedpassword1', // In a real app, use a proper hashing library
      phone: '123-456-7890',
    },
    {
      userName: 'jane.smith',
      firstName: 'Jane',
      lastName: 'Smith',
      role: UserRole.ADMIN,
      email: 'jane.smith@example.com',
      password: 'hashedpassword2',
      phone: '987-654-3210',
    },
    {
      userName: 'peter.jones',
      firstName: 'Peter',
      lastName: 'Jones',
      role: UserRole.USER,
      email: 'peter.jones@example.com',
      password: 'hashedpassword3',
      phone: null, // Example with optional field not provided
    },
    {
      userName: 'alice.williams',
      firstName: 'Alice',
      lastName: 'Williams',
      role: UserRole.USER,
      email: 'alice.williams@example.com',
      password: 'hashedpassword4',
      phone: '555-123-4567',
    },
    {
      userName: 'bob.brown',
      firstName: 'Bob',
      lastName: 'Brown',
      role: UserRole.USER,
      email: 'bob.brown@example.com',
      password: 'hashedpassword5',
      phone: '111-222-3333',
    },
  ];

  for (const user of users) {
    await prisma.user.create({
      data: user,
    });
  }

  console.log('Seed data for User model has been created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
