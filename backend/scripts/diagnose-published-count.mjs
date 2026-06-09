import { PrismaClient } from '@prisma/client';
import { FULL_CATALOG, FULL_GRADE_CATALOG } from '../prisma/quiz/catalog/index.js';

const prisma = new PrismaClient();

const total = await prisma.quiz.count();
const published = await prisma.quiz.count({ where: { isPublished: true } });
const unpublished = await prisma.quiz.count({ where: { isPublished: false } });

const catalogSlugs = new Set(FULL_GRADE_CATALOG.map((q) => q.slug));
const dbSlugs = await prisma.quiz.findMany({ select: { slug: true, isPublished: true, gradeLevel: true } });

const inCatalogUnpublished = dbSlugs.filter((q) => catalogSlugs.has(q.slug) && !q.isPublished);
const notInCatalog = dbSlugs.filter((q) => !catalogSlugs.has(q.slug));
const missingFromDb = FULL_GRADE_CATALOG.filter((q) => !dbSlugs.some((d) => d.slug === q.slug));

const byGrade = {};
for (const row of dbSlugs) {
  const key = `${row.gradeLevel}:${row.isPublished}`;
  byGrade[key] = (byGrade[key] ?? 0) + 1;
}

console.log({
  catalogSize: FULL_GRADE_CATALOG.length,
  sameCatalogRef: FULL_CATALOG === FULL_GRADE_CATALOG,
  total,
  published,
  unpublished,
});
console.log('byGrade', byGrade);
console.log('inCatalogUnpublished', inCatalogUnpublished.length, inCatalogUnpublished.slice(0, 10));
console.log('notInCatalog', notInCatalog.length, notInCatalog.slice(0, 10).map((q) => q.slug));
console.log('missingFromDb', missingFromDb.length, missingFromDb.slice(0, 10).map((q) => q.slug));

await prisma.$disconnect();
