import prisma from '../src/config/prisma.js';
import bcrypt from 'bcryptjs';

const seed = async () => {
  try {
    console.log('Seeding database...');

    // Delete existing test users
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['admin@evergreen.com', 'client@evergreen.com', 'staff@evergreen.com'],
        },
      },
    });

    // Create a test admin user
    const hashedPassword = await bcrypt.hash('password123', 10);
    await prisma.user.create({
      data: {
        email: 'admin@evergreen.com',
        passwordHash: hashedPassword,
        role: 'SUPER_ADMIN',
        fullName: 'Admin User',
        isActive: true,
      },
    });

    // Create a test client user
    const clientPassword = await bcrypt.hash('password123', 10);
    await prisma.user.create({
      data: {
        email: 'client@evergreen.com',
        passwordHash: clientPassword,
        role: 'CLIENT',
        fullName: 'Client User',
        isActive: true,
      },
    });

    // Create a test staff user
    const staffPassword = await bcrypt.hash('password123', 10);
    await prisma.user.create({
      data: {
        email: 'staff@evergreen.com',
        passwordHash: staffPassword,
        role: 'STAFF',
        fullName: 'Staff User',
        isActive: true,
      },
    });

    console.log('Test users seeded successfully');
  } catch (error: any) {
    console.error('Seeding failed:', error.message);
  }
};

seed();