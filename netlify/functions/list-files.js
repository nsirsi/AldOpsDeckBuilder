import {
  driveFetch,
  errorResponse,
  jsonResponse,
} from './_shared/drive-api.js';

export async function handler(event) {
  if (event.httpMethod !== 'GET') {
    return errorResponse(405, 'Method not allowed');
  }

  const folderId = event.queryStringParameters?.folderId?.trim();
  if (!folderId) {
    return errorResponse(400, 'folderId query parameter is required');
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(folderId)) {
    return errorResponse(400, 'Invalid folderId');
  }

  try {
    const files = [];
    let pageToken;

    do {
      const response = await driveFetch('/files', {
        q: `'${folderId}' in parents and trashed = false`,
        fields: 'nextPageToken, files(id, name, mimeType)',
        pageSize: '100',
        orderBy: 'name',
        pageToken,
      });
      const data = await response.json();

      for (const file of data.files ?? []) {
        if (isDeckTextFile(file)) {
          files.push({ id: file.id, name: file.name });
        }
      }

      pageToken = data.nextPageToken;
    } while (pageToken);

    return jsonResponse(200, { folderId, files });
  } catch (err) {
    const status = err.status === 404 ? 404 : err.status >= 400 && err.status < 600 ? err.status : 502;
    return errorResponse(status, err.message || 'Failed to list Drive files');
  }
}

function isDeckTextFile(file) {
  const name = file.name?.toLowerCase() ?? '';
  if (name.endsWith('.txt')) {
    return true;
  }
  return file.mimeType === 'text/plain';
}
