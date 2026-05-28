/**
 * Extract a Google Drive folder ID from a pasted URL or raw ID.
 * @param {string} input
 * @returns {string | null}
 */
export function parseFolderId(input) {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  const fromUrl = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (fromUrl) {
    return fromUrl[1];
  }

  if (/^[a-zA-Z0-9_-]{10,}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}
