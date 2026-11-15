import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const institutionName = process.env.INITIAL_INSTITUTION_NAME?.trim();
  const institutionSlug = process.env.INITIAL_INSTITUTION_SLUG?.trim();
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;
  if (!institutionName || !institutionSlug || !adminEmail || !adminPassword || adminPassword.length < 12) {
    throw new Error('Set INITIAL_INSTITUTION_NAME, INITIAL_INSTITUTION_SLUG, INITIAL_ADMIN_EMAIL, and an INITIAL_ADMIN_PASSWORD of at least 12 characters.');
  }

  const institution = await prisma.institution.upsert({
    where: { slug: institutionSlug },
    update: { name: institutionName },
    create: {
      name: institutionName,
      slug: institutionSlug
    }
  });

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: 'Institution Administrator',
      passwordHash,
      role: 'INSTITUTION_ADMIN',
      institutionId: institution.id
    },
    create: {
      name: 'Institution Administrator',
      email: adminEmail,
      passwordHash, role: 'INSTITUTION_ADMIN', institutionId: institution.id
    }
  });

  console.log('Institution administrator configured. No sample certificate or student records were created.');
}

main()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); });
