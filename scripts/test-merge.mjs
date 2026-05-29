import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { DOMParser } from '@xmldom/xmldom';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

global.DOMParser = DOMParser;

const {
  mergeDecks,
  mergedFileName,
  validateMergedCardCount,
  MERGED_DECK_CARD_COUNTS,
} = await import('../src/xmlMerger.js');

const deckA = readFileSync(join(root, 'Dark MotF Bounty Hunters.txt'), 'utf8');
const deckB = readFileSync(join(root, 'Dark MotF Crimson Dawn.txt'), 'utf8');
const expected = readFileSync(
  join(root, 'merged Dark MotF Bounty Hunters Crimson Dawn.txt'),
  'utf8',
);

const merged = mergeDecks([deckA, deckB]);
const name = mergedFileName(['Dark MotF Bounty Hunters.txt', 'Dark MotF Crimson Dawn.txt']);

if (merged !== expected) {
  console.error('Merge output does not match expected sample.');
  console.error('Expected length:', expected.length, 'Got:', merged.length);
  process.exit(1);
}

if (name !== 'merged Dark MotF Bounty Hunters Crimson Dawn.txt') {
  console.error('Unexpected filename:', name);
  process.exit(1);
}

for (const count of MERGED_DECK_CARD_COUNTS) {
  try {
    validateMergedCardCount(count);
  } catch {
    console.error(`validateMergedCardCount(${count}) should not throw.`);
    process.exit(1);
  }
}

for (const invalid of [30, 70]) {
  try {
    validateMergedCardCount(invalid);
    console.error(`validateMergedCardCount(${invalid}) should throw.`);
    process.exit(1);
  } catch (err) {
    if (!err.message.includes('40') || !err.message.includes('60')) {
      console.error('Unexpected validation message:', err.message);
      process.exit(1);
    }
  }
}

console.log('Merge test passed.');
