import { filterFilesBySide, getDeckSide, normalizeDeckFileName } from '../src/deckFilter.js';

const files = [
  { id: '1', name: 'Dark MotF Bounty Hunters.txt' },
  { id: '2', name: 'Light MotF Ewoks.txt' },
  { id: '3', name: '00 Dark MotF Jabba.txt' },
  { id: '4', name: '00Light MotF Jawas.txt' },
  { id: '5', name: '00 MotF Xizor.txt' },
];

if (normalizeDeckFileName('00 Dark MotF Jabba.txt') !== 'Dark MotF Jabba') {
  console.error('normalizeDeckFileName failed for spaced prefix');
  process.exit(1);
}

if (getDeckSide('00Light MotF Jawas.txt') !== 'light') {
  console.error('getDeckSide failed for compact 00Light prefix');
  process.exit(1);
}

const darkOnly = filterFilesBySide(files, 'dark');
if (darkOnly.length !== 2 || !darkOnly.every((f) => f.name.startsWith('Dark') || f.name.includes('Dark'))) {
  console.error('Dark filter expected 2 files, got', darkOnly.map((f) => f.name));
  process.exit(1);
}

const lightOnly = filterFilesBySide(files, 'light');
if (lightOnly.length !== 2) {
  console.error('Light filter expected 2 files, got', lightOnly.map((f) => f.name));
  process.exit(1);
}

console.log('Deck filter test passed.');
