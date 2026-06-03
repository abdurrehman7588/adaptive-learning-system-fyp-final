import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { seedQuizzes } from './quizSeed.js';
import { seedQuizAttempts } from './quizAttemptSeed.js';

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.DEMO_PARENT_EMAIL ?? 'parent@demo.com').trim().toLowerCase();
  const password = process.env.DEMO_PARENT_PASSWORD ?? 'password123';
  const name = 'Demo Parent';

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
      role: 'parent',
    },
    create: {
      email,
      name,
      passwordHash,
      role: 'parent',
    },
  });

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (adminEmail && process.env.ADMIN_PASSWORD) {
    const adminHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { passwordHash: adminHash, role: 'admin', name: 'Admin' },
      create: {
        email: adminEmail,
        name: 'Admin',
        passwordHash: adminHash,
        role: 'admin',
      },
    });
    console.log(`Admin user ready: ${adminEmail}`);
  }

  const parent = await prisma.user.findUnique({ where: { email } });
  if (parent) {
    await prisma.parentProfile.upsert({
      where: { parentId: parent.id },
      update: {},
      create: {
        parentId: parent.id,
        preferences: {
          emailNotifications: true,
          weeklyReportEmail: false,
          learningGoals: [],
          childInterests: [],
        },
      },
    });

    const demoUsername = (process.env.DEMO_CHILD_USERNAME ?? 'demokid').trim().toLowerCase();
    const demoPin = process.env.DEMO_CHILD_PIN ?? '1234';
    const demoPinHash = await bcrypt.hash(demoPin, 12);

    await prisma.child.upsert({
      where: { username: demoUsername },
      update: {
        name: 'Demo Learner',
        pinHash: demoPinHash,
        parentId: parent.id,
        gradeLevel: 'grade_2',
        age: 8,
        avatarUrl: '🦊',
        isActive: true,
      },
      create: {
        parentId: parent.id,
        name: 'Demo Learner',
        username: demoUsername,
        pinHash: demoPinHash,
        gradeLevel: 'grade_2',
        age: 8,
        avatarUrl: '🦊',
        learningPreferences: {},
      },
    });

    console.log(`Demo child ready: username=${demoUsername} / PIN=${demoPin}`);
  }

  console.log(`Demo parent ready: ${email} / ${password}`);

  await seedQuizzes(prisma);
  await seedQuizAttempts(prisma);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
