import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const p = new PrismaClient({ adapter });

const all = await p.contentFamiliarity.findMany();
const orphans: number[] = [];
for (const f of all) {
  let exists = false;
  if (f.contentType === 'kanji') exists = !!(await p.kanji.findUnique({ where: { id: f.contentId }, select: { id: true } }));
  else if (f.contentType === 'vocabulary') exists = !!(await p.vocabulary.findUnique({ where: { id: f.contentId }, select: { id: true } }));
  else if (f.contentType === 'grammar') exists = !!(await p.grammar.findUnique({ where: { id: f.contentId }, select: { id: true } }));
  else if (f.contentType === 'hiragana') exists = !!(await p.hiragana.findUnique({ where: { id: f.contentId }, select: { id: true } }));
  else if (f.contentType === 'katakana') exists = !!(await p.katakana.findUnique({ where: { id: f.contentId }, select: { id: true } }));
  else if (f.contentType === 'radical') exists = !!(await p.radical.findUnique({ where: { id: f.contentId }, select: { id: true } }));
  if (!exists) orphans.push(f.id);
}
console.log(`Stale ContentFamiliarity: ${orphans.length}`);
if (orphans.length > 0) {
  await p.contentFamiliarity.deleteMany({ where: { id: { in: orphans } } });
  console.log('Deleted.');
}
console.log('Final ContentFamiliarity count:', await p.contentFamiliarity.count());
console.log('Final SrsCard count:', await p.srsCard.count());

await p.$disconnect();
