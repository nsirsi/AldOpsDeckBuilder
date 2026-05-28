import {
  driveFetch,
  errorResponse,
  textResponse,
} from './_shared/drive-api.js';

export async function handler(event) {
  if (event.httpMethod !== 'GET') {
    return errorResponse(405, 'Method not allowed');
  }

  const fileId = event.queryStringParameters?.fileId?.trim();
  if (!fileId) {
    return errorResponse(400, 'fileId query parameter is required');
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(fileId)) {
    return errorResponse(400, 'Invalid fileId');
  }

  try {
    const response = await driveFetch(`/files/${fileId}`, { alt: 'media' });
    const text = await response.text();
    return textResponse(200, text);
  } catch (err) {
    const status = err.status === 404 ? 404 : err.status >= 400 && err.status < 600 ? err.status : 502;
    return errorResponse(status, err.message || 'Failed to fetch Drive file');
  }
}
