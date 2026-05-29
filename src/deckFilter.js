/**
 * Strip an optional two-digit prefix and whitespace from a deck file name.
 * @param {string} fileName
 * @returns {string}
 */
export function normalizeDeckFileName(fileName) {
  const stem = fileName.replace(/\.txt$/i, '');
  return stem.replace(/^\d{2}\s*/, '');
}

/**
 * @param {string} fileName
 * @returns {'light' | 'dark' | null}
 */
export function getDeckSide(fileName) {
  const normalized = normalizeDeckFileName(fileName);
  if (normalized.startsWith('Light')) {
    return 'light';
  }
  if (normalized.startsWith('Dark')) {
    return 'dark';
  }
  return null;
}

/**
 * @param {{ name: string }[]} files
 * @param {'light' | 'dark'} side
 * @returns {{ id: string, name: string }[]}
 */
export function filterFilesBySide(files, side) {
  return files.filter((file) => getDeckSide(file.name) === side);
}
