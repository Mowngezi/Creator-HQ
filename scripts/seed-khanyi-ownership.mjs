#!/usr/bin/env node
// scripts/seed-khanyi-ownership.mjs
//
// One-off migration that gives Khanyi's seed kit (data/KhKumalo.json) an
// ownership block, so Mongezi can edit her kit via the recovery flow on any
// browser. Run interactively from the project root:
//
//   cd projects/creatorhq-pilot-v2
//   node scripts/seed-khanyi-ownership.mjs
//
// Prompts for a recovery contact (email or SA phone) + a date of birth.
// Writes ownership { owner_token, salt, contact_hash, dob_hash, contact_type,
// created_at } onto the JSON. Prints the recovery details so the operator can
// keep them somewhere safe — they're the ONLY way back if cookies are cleared.
//
// Idempotent: refuses to overwrite an existing ownership block unless --force
// is passed.

import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';
import { buildOwnershipBlock, normaliseDob, detectContactType } from '../lib/ownership.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const SEED_PATH = path.join(PROJECT_ROOT, 'data', 'KhKumalo.json');

const args = new Set(process.argv.slice(2));
const FORCE = args.has('--force');

function prompt(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(String(answer).trim());
    });
  });
}

async function main() {
  if (!existsSync(SEED_PATH)) {
    console.error(`No seed file at ${SEED_PATH}`);
    process.exit(1);
  }

  const json = JSON.parse(readFileSync(SEED_PATH, 'utf8'));

  if (json.ownership && !FORCE) {
    console.log('Khanyi already has an ownership block. Pass --force to overwrite.');
    console.log('Existing ownership.created_at:', json.ownership.created_at);
    process.exit(0);
  }

  console.log('');
  console.log('=== Seed Khanyi ownership ===');
  console.log('Use details YOU control. These are how you recover edit access on a new device.');
  console.log('Raw values will NOT be stored. We only persist hashes.');
  console.log('');

  let contact = '';
  let contactType = null;
  while (!contactType) {
    contact = await prompt('Recovery contact (email or SA phone, e.g. 0821234567): ');
    contactType = detectContactType(contact);
    if (!contactType) {
      console.log('Not recognised. Try again. Email needs @ + dot. Phone is 0 followed by 9 digits.');
    }
  }

  let dob = '';
  let normalised = '';
  while (!normalised) {
    dob = await prompt('Date of birth (YYYY-MM-DD or DD/MM/YYYY): ');
    normalised = normaliseDob(dob);
    if (!normalised) {
      console.log('Could not parse that date. Try again.');
    }
  }

  const ownership = buildOwnershipBlock({ contact, dob: normalised });

  json.ownership = ownership;
  writeFileSync(SEED_PATH, JSON.stringify(json, null, 2) + '\n', 'utf8');

  console.log('');
  console.log('=== ownership block written to data/KhKumalo.json ===');
  console.log('Contact type:    ', ownership.contact_type);
  console.log('Created at:      ', ownership.created_at);
  console.log('Owner token:     ', ownership.owner_token);
  console.log('Salt:            ', ownership.salt);
  console.log('');
  console.log('Save these RECOVERY DETAILS somewhere private:');
  console.log('  Contact:       ', contact);
  console.log('  DOB:           ', normalised);
  console.log('');
  console.log('To restore edit access on a new device, hit /c/KhKumalo/recover and');
  console.log('enter the contact + DOB above. The cookie will be set on that browser.');
}

main().catch((err) => {
  console.error('seed-khanyi-ownership failed:', err);
  process.exit(1);
});
