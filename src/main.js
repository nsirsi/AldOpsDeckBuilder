import { filterFilesBySide } from './deckFilter.js';
import { parseFolderId } from './folderId.js';
import { mergeDecks, mergedFileName } from './xmlMerger.js';
import './style.css';

const API_BASE = '/api';

const folderForm = document.getElementById('folder-form');
const folderInput = document.getElementById('folder-input');
const loadBtn = document.getElementById('load-btn');
const deckOptions = document.getElementById('deck-options');
const sideFilter = document.getElementById('side-filter');
const formatSelect = document.getElementById('deck-format');
const decksPanel = document.getElementById('decks-panel');
const deckList = document.getElementById('deck-list');
const deckCount = document.getElementById('deck-count');
const selectAllBtn = document.getElementById('select-all-btn');
const clearBtn = document.getElementById('clear-btn');
const mergeBtn = document.getElementById('merge-btn');
const statusEl = document.getElementById('status');

/** @type {{ id: string, name: string }[]} */
let allDeckFiles = [];

/** @type {{ id: string, name: string }[]} */
let deckFiles = [];

const defaultFolderUrl = import.meta.env.VITE_DEFAULT_DRIVE_FOLDER_URL;
if (defaultFolderUrl) {
  folderInput.value = defaultFolderUrl;
}

folderForm.addEventListener('submit', (event) => {
  event.preventDefault();
  loadDecks();
});

selectAllBtn.addEventListener('click', () => {
  deckList.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    cb.checked = true;
  });
  updateMergeButton();
});

clearBtn.addEventListener('click', () => {
  deckList.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    cb.checked = false;
  });
  updateMergeButton();
});

mergeBtn.addEventListener('click', () => {
  mergeAndDownload();
});

deckList.addEventListener('change', updateMergeButton);

sideFilter.addEventListener('change', () => {
  applySideFilter();
});

async function loadDecks() {
  const folderId = parseFolderId(folderInput.value);
  if (!folderId) {
    setStatus('Enter a valid Google Drive folder URL or folder ID.', 'error');
    return;
  }

  setLoading(true);
  setStatus('Scanning folder…', 'loading');

  try {
    const response = await fetch(
      `${API_BASE}/list-files?folderId=${encodeURIComponent(folderId)}`,
    );
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || 'Failed to list deck files');
    }

    allDeckFiles = payload.files ?? [];
    deckOptions.hidden = false;
    applySideFilter();
    decksPanel.hidden = false;
  } catch (err) {
    allDeckFiles = [];
    deckFiles = [];
    deckOptions.hidden = true;
    renderDeckList();
    decksPanel.hidden = true;
    setStatus(err.message || 'Could not load folder.', 'error');
  } finally {
    setLoading(false);
  }
}

function getSelectedSide() {
  const selected = sideFilter.querySelector('input[name="deck-side"]:checked');
  return /** @type {'light' | 'dark'} */ (selected?.value ?? 'light');
}

/** @returns {'open' | '40' | '60'} */
function getSelectedFormat() {
  const value = formatSelect.value;
  if (value === '40' || value === '60') {
    return value;
  }
  return 'open';
}

function applySideFilter() {
  const side = getSelectedSide();
  deckFiles = filterFilesBySide(allDeckFiles, side);
  renderDeckList();

  const sideLabel = side === 'light' ? 'Light' : 'Dark';
  if (allDeckFiles.length === 0) {
    setStatus('No .txt deck files found in that folder.', 'error');
  } else if (deckFiles.length === 0) {
    setStatus(`No ${sideLabel} Side deck files found in that folder.`, 'error');
  } else {
    setStatus(
      `Showing ${deckFiles.length} ${sideLabel} Side deck${deckFiles.length === 1 ? '' : 's'}.`,
      'success',
    );
  }
}

function renderDeckList() {
  deckList.replaceChildren();
  deckCount.textContent = deckFiles.length ? `${deckFiles.length} files` : '';

  for (const file of deckFiles) {
    const li = document.createElement('li');
    li.className = 'deck-list__item';

    const label = document.createElement('label');
    label.className = 'deck-list__label';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = file.id;
    checkbox.dataset.name = file.name;

    const name = document.createElement('span');
    name.className = 'deck-list__name';
    name.textContent = file.name;

    label.append(checkbox, name);
    li.append(label);
    deckList.append(li);
  }

  updateMergeButton();
}

function getSelectedDecks() {
  return [...deckList.querySelectorAll('input[type="checkbox"]:checked')].map((cb) => ({
    id: cb.value,
    name: cb.dataset.name ?? 'deck.txt',
  }));
}

function updateMergeButton() {
  const selected = getSelectedDecks();
  mergeBtn.disabled = selected.length < 2;
}

async function mergeAndDownload() {
  const selected = getSelectedDecks();
  if (selected.length < 2) {
    setStatus('Select at least two decks to merge.', 'error');
    return;
  }

  setLoading(true);
  mergeBtn.disabled = true;
  setStatus('Fetching and merging decks…', 'loading');

  try {
    const xmlStrings = [];
    for (const deck of selected) {
      const response = await fetch(
        `${API_BASE}/get-file?fileId=${encodeURIComponent(deck.id)}`,
      );
      if (!response.ok) {
        let message = `Failed to fetch ${deck.name}`;
        try {
          const payload = await response.json();
          message = payload.error || message;
        } catch {
          /* body is plain text error from non-json */
        }
        throw new Error(message);
      }
      xmlStrings.push(await response.text());
    }

    const merged = mergeDecks(xmlStrings, { format: getSelectedFormat() });
    const filename = mergedFileName(selected.map((d) => d.name));
    downloadText(filename, merged);
    setStatus(`Downloaded ${filename}`, 'success');
  } catch (err) {
    setStatus(err.message || 'Merge failed.', 'error');
  } finally {
    setLoading(false);
    updateMergeButton();
  }
}

function downloadText(filename, content) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function setLoading(isLoading) {
  loadBtn.disabled = isLoading;
  mergeBtn.disabled = isLoading || getSelectedDecks().length < 2;
  folderInput.disabled = isLoading;
  sideFilter.querySelectorAll('input').forEach((input) => {
    input.disabled = isLoading;
  });
  formatSelect.disabled = isLoading;
}

/**
 * @param {string} message
 * @param {'loading' | 'success' | 'error' | ''} tone
 */
function setStatus(message, tone = '') {
  statusEl.textContent = message;
  statusEl.className = 'status';
  if (tone) {
    statusEl.classList.add(`status--${tone}`);
  }
}
