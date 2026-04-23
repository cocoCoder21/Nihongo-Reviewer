// Hard-reset all familiarize/SRS state across ALL users so the Practice tab
// starts from a true clean slate. Run with: `npm run db:reset-familiarity`.
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const p = new PrismaClient({ adapter });

const beforeFam = await p.contentFamiliarity.count();
const beforeSrs = await p.srsCard.count();
console.log(`Before: ContentFamiliarity=${beforeFam}, SrsCard=${beforeSrs}`);

const delFam = await p.contentFamiliarity.deleteMany({});
const delSrs = await p.srsCard.deleteMany({});
console.log(`Deleted: ContentFamiliarity=${delFam.count}, SrsCard=${delSrs.count}`);

const afterFam = await p.contentFamiliarity.count();
const afterSrs = await p.srsCard.count();
console.log(`After:  ContentFamiliarity=${afterFam}, SrsCard=${afterSrs}`);

await p.$disconnect();
console.log('Familiarity reset complete. Remember to clear browser localStorage keys: nb-familiarity, nihon-benkyou-flashcards');
