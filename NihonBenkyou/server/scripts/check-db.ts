import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const p = new PrismaClient({ adapter });

const counts = {
  kanji: await p.kanji.count(),
  vocabulary: await p.vocabulary.count(),
  grammar: await p.grammar.count(),
  hiragana: await p.hiragana.count(),
  katakana: await p.katakana.count(),
  radical: await p.radical.count(),
  srsCards: await p.srsCard.count(),
  contentFamiliarity: await p.contentFamiliarity.count(),
};
console.log('Counts:', counts);

const allCards = await p.srsCard.findMany({
  select: { id: true, contentType: true, contentId: true },
});
const orphans: { id: number; contentType: string; contentId: number }[] = [];
for (const c of allCards) {
  let exists = false;
  if (c.contentType === 'KANJI')
    exists = !!(await p.kanji.findUnique({ where: { id: c.contentId }, select: { id: true } }));
  else if (c.contentType === 'VOCABULARY')
    exists = !!(await p.vocabulary.findUnique({ where: { id: c.contentId }, select: { id: true } }));
  else if (c.contentType === 'GRAMMAR')
    exists = !!(await p.grammar.findUnique({ where: { id: c.contentId }, select: { id: true } }));
  else if (c.contentType === 'HIRAGANA')
    exists = !!(await p.hiragana.findUnique({ where: { id: c.contentId }, select: { id: true } }));
  else if (c.contentType === 'KATAKANA')
    exists = !!(await p.katakana.findUnique({ where: { id: c.contentId }, select: { id: true } }));
  else if (c.contentType === 'RADICAL')
    exists = !!(await p.radical.findUnique({ where: { id: c.contentId }, select: { id: true } }));
  if (!exists) orphans.push(c);
}
console.log(`Orphaned SrsCards: ${orphans.length}`);
if (orphans.length > 0) {
  console.log(orphans);
  await p.srsCard.deleteMany({ where: { id: { in: orphans.map((o) => o.id) } } });
  console.log('Deleted orphans.');
}

await p.$disconnect();
