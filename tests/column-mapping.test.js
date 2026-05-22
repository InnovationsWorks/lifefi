/**
 * Autonomous tests for the credit_cards column-name fix.
 *
 * Verifies three things without hitting a real Supabase instance:
 *   1. supabaseRowToCard maps every snake_case Supabase column → camelCase CreditCard field
 *   2. addCard sends the correct snake_case column names to Supabase
 *   3. updateCard builds a snake_case payload (never the raw camelCase app fields)
 *
 * Run with:  node tests/column-mapping.test.js
 */

const fs = require('fs');
const path = require('path');

// ── read the source file ──────────────────────────────────────────────────────
const src = fs.readFileSync(
  path.join(__dirname, '..', 'contexts', 'AppContext.tsx'),
  'utf8'
);

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  ✓  ${label}`);
    passed++;
  } else {
    console.error(`  ✗  ${label}`);
    failed++;
  }
}

// ── 1. supabaseRowToCard: reads correct Supabase column names ─────────────────
console.log('\n[1] supabaseRowToCard — reads Supabase snake_case columns');

assert(src.includes('row.card_name'),    'reads card_name from row');
assert(src.includes('row.last_four'),    'reads last_four from row');
assert(src.includes('row.credit_limit'), 'reads credit_limit from row');
assert(src.includes('row.due_date'),     'reads due_date from row');
assert(src.includes('row.balance'),      'reads balance from row');
assert(src.includes('row.color'),        'reads color from row');

// ── 2. supabaseRowToCard: maps to correct CreditCard field names ──────────────
console.log('\n[2] supabaseRowToCard — maps to camelCase CreditCard fields');

assert(src.includes("name:        String(row.card_name"),  'maps card_name → name');
assert(src.includes("last4:       String(row.last_four"),  'maps last_four → last4');
assert(src.includes("limit:       creditLimit"),            'maps credit_limit → limit');
assert(src.includes("dueDate,"),                            'maps due_date → dueDate');

// ── 3. addCard insert: sends snake_case column names ─────────────────────────
console.log('\n[3] addCard — sends correct snake_case column names to Supabase');

const insertBlock = src.slice(src.indexOf('.insert({'), src.indexOf('.select()'));
assert(insertBlock.includes('card_name:'),    'insert uses card_name (not name)');
assert(insertBlock.includes('last_four:'),    'insert uses last_four (not last4)');
assert(insertBlock.includes('credit_limit:'), 'insert uses credit_limit (not limit)');
assert(insertBlock.includes('due_date:'),     'insert uses due_date (not dueDate)');
assert(insertBlock.includes('user_id:'),      'insert includes user_id');
assert(insertBlock.includes('apr:'),          'insert includes apr field');

// ── 4. addCard insert: does NOT send camelCase app field names ────────────────
console.log('\n[4] addCard insert — does NOT send camelCase app field names');

assert(!insertBlock.includes('last4:'),   'insert does NOT send last4');
assert(!insertBlock.includes("name: c."), 'insert does NOT send name: c.name');
// credit_limit: c.limit is correct — a bare "\n      limit: c.limit" (no credit_ prefix) would be wrong
// Using a line-anchored regex so "credit_limit: c.limit" doesn't trigger the negative check
assert(!/^\s+limit:\s*c\.limit/m.test(insertBlock), 'insert does NOT send bare limit: c.limit (uses credit_limit instead)');

// ── 5. updateCard: builds snake_case payload ──────────────────────────────────
console.log('\n[5] updateCard — maps to snake_case before calling Supabase');

const updateBlock = src.slice(
  src.indexOf('// Build the Supabase payload'),
  src.indexOf("supabase.from('credit_cards').update(row)")
);
assert(updateBlock.includes('row.card_name'),    'update payload uses card_name');
assert(updateBlock.includes('row.last_four'),    'update payload uses last_four');
assert(updateBlock.includes('row.credit_limit'), 'update payload uses credit_limit');
assert(updateBlock.includes('row.due_date'),     'update payload uses due_date');

// ── 6. updateCard: skips fields not in Supabase schema ───────────────────────
console.log('\n[6] updateCard — skips dueDay and utilization (not in schema)');

assert(!updateBlock.includes('dueDay'),      'update does NOT send dueDay');
assert(!updateBlock.includes('utilization'), 'update does NOT send utilization');

// ── 7. updateCard guard ───────────────────────────────────────────────────────
console.log('\n[7] updateCard — has empty-id guard');
assert(src.includes("if (!id)") && src.includes('aborting Supabase write'), 'has empty-id guard');

// ── 8. loadData: maps incoming rows through supabaseRowToCard ─────────────────
console.log('\n[8] loadData — pipes credit_cards rows through supabaseRowToCard');
assert(src.includes('.map(supabaseRowToCard)'), 'loadData maps rows through supabaseRowToCard');

// ── summary ───────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(50)}`);
console.log(`  ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.error('\n  COLUMN MAPPING TEST SUITE FAILED\n');
  process.exit(1);
} else {
  console.log('\n  All column-mapping tests passed.\n');
}
