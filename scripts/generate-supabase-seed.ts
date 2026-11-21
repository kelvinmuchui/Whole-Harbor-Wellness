import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { INITIAL_USERS } from '../src/lib/seedUsers.ts';
import {
  INITIAL_ARTICLES,
  INITIAL_EARNINGS,
  INITIAL_FAQS,
  INITIAL_ORDERS,
  INITIAL_PARTNERS,
  INITIAL_PROGRAMS,
  INITIAL_TESTIMONIALS
} from '../src/lib/seedData.ts';
import { WHW_PRODUCTS } from '../src/lib/whwCatalog.ts';

const collections = [
  ['users', INITIAL_USERS],
  ['partners', INITIAL_PARTNERS],
  ['products', WHW_PRODUCTS],
  ['orders', INITIAL_ORDERS],
  ['partner_earnings', INITIAL_EARNINGS],
  ['wellness_programs', INITIAL_PROGRAMS],
  ['educational_articles', INITIAL_ARTICLES],
  ['faqs', INITIAL_FAQS],
  ['testimonials', INITIAL_TESTIMONIALS]
] as const;

function quoteSql(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

const values = collections.flatMap(([collection, records]) =>
  records.map((record) => {
    const id = 'id' in record ? record.id : undefined;
    if (!id) {
      throw new Error(`Seed record in "${collection}" has no id.`);
    }

    return `  (${quoteSql(collection)}, ${quoteSql(id)}, ${quoteSql(
      JSON.stringify(record)
    )}::jsonb, true)`;
  })
);

const sql = [
  '-- Generated from the current Whole Harbor Wellness demo data.',
  '-- Run only after applying migrations/20261121000000_whw_records.sql.',
  '-- Re-running updates demo rows only and never overwrites live rows.',
  'begin;',
  '',
  'insert into public.whw_records (collection, record_id, data, is_demo)',
  'values',
  `${values.join(',\n')}`,
  'on conflict (collection, record_id) do update',
  'set data = excluded.data, is_demo = true, updated_at = now()',
  'where public.whw_records.is_demo;',
  '',
  'commit;',
  ''
].join('\n');

writeFileSync(resolve(process.cwd(), 'supabase/seed.sql'), sql);
console.log(`Generated Supabase seed SQL for ${values.length} demo records.`);
